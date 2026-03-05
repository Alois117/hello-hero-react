import { useState, useCallback, useMemo, useRef } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { WEBHOOK_CUSTOM_REPORT_URL } from "@/config/env";
import { safeParseResponse } from "@/lib/safeFetch";
import { ReportItem } from "@/hooks/useReports";

/**
 * IMPORTANT:
 * n8n Webhook receives request JSON under `$json.body`.
 * So we must POST a *flat* object (not `{ body: {...} }`), otherwise n8n sees `$json.body.body.*`.
 */
interface CustomReportRequestBody {
  first_seen_start: string; // start ISO
  first_seen_end: string; // end ISO
  durationHours: number;
  period_label: string;
}

export interface UseCustomReportReturn {
  customReports: ReportItem[];
  loading: boolean;
  generating: boolean;
  error: string | null;
  generateCustomReport: (from: Date, to: Date) => Promise<void>;
  filteredReports: ReportItem[];
  paginatedReports: ReportItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  totalPages: number;
  pageSize: number;
  count: number;
}

const normalizeHtml = (raw: string): string => {
  if (!raw || typeof raw !== "string") return "";
  let normalized = raw.trim();

  // Some backends double-encode HTML as JSON string; attempt to unwrap.
  try {
    const parsed = JSON.parse(normalized);
    if (typeof parsed === "string") normalized = parsed;
  } catch {
    /* not JSON-encoded */
  }

  return normalized
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const useCustomReport = (): UseCustomReportReturn => {
  const [customReports, setCustomReports] = useState<ReportItem[]>([]);
  // Kept for parity with other hooks; currently no initial fetch logic exists.
  const [loading] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Keep a ref to avoid stale closure when merging results.
  const reportsRef = useRef<ReportItem[]>([]);
  const { authenticatedFetch } = useAuthenticatedFetch();

  const generateCustomReport = useCallback(
    async (from: Date, to: Date) => {
      setGenerating(true);
      setError(null);

      try {
        // Basic input validation (avoid sending invalid ranges)
        const fromMs = from?.getTime?.();
        const toMs = to?.getTime?.();
        if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) {
          throw new Error("Invalid date range. Please select valid start and end dates.");
        }
        if (toMs <= fromMs) {
          throw new Error("Invalid date range. End date must be after start date.");
        }

        const durationMs = toMs - fromMs;
        // Prevent 0 hours due to rounding; keep at least 1 hour.
        const durationHours = Math.max(1, Math.round(durationMs / (1000 * 60 * 60)));

        // ✅ Send a FLAT object so n8n can read `$json.body.period` etc.
        const requestBody: CustomReportRequestBody = {
          first_seen_start: new Date(fromMs).toISOString(),
          first_seen_end: new Date(toMs).toISOString(),
          durationHours,
          period_label: "custom_range",
        };

        const response = await authenticatedFetch(WEBHOOK_CUSTOM_REPORT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        const result = await safeParseResponse<ReportItem[]>(response, WEBHOOK_CUSTOM_REPORT_URL);
        if (!result.ok) {
          throw new Error(result.userMessage);
        }

        const raw = Array.isArray(result.data) ? result.data : [];

        // Validate shape (keep only what the reports UI expects)
        const valid = raw.filter(
          (r) =>
            r &&
            typeof r.report_type === "string" &&
            typeof r.report_template === "string" &&
            typeof r.created_at === "string"
        );

        const processed: ReportItem[] = valid.map((r) => ({
          ...r,
          // Normalize to "custom" if backend didn't set it, and keep existing value otherwise.
          report_type: r.report_type || "custom",
          report_template: normalizeHtml(r.report_template),
        }));

        // Merge with existing custom reports (newest first), dedupe by type+created_at
        const existing = reportsRef.current;
        const merged = [...processed, ...existing];

        const seen = new Set<string>();
        const deduped = merged.filter((r) => {
          const key = `${r.report_type}_${r.created_at}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        deduped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        reportsRef.current = deduped;
        setCustomReports(deduped);

        // Reset pagination on new results
        setCurrentPage(1);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to generate custom report. Please try again.";
        setError(msg);
      } finally {
        setGenerating(false);
      }
    },
    [authenticatedFetch]
  );

  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customReports;

    return customReports.filter((r) => {
      const type = (r.report_type || "").toLowerCase();
      const dateText = new Date(r.created_at).toLocaleDateString().toLowerCase();
      return type.includes(q) || dateText.includes(q);
    });
  }, [customReports, searchQuery]);

  const totalPages = useMemo(() => {
    const pages = Math.ceil(filteredReports.length / pageSize);
    return Math.max(1, pages);
  }, [filteredReports.length, pageSize]);

  // Clamp currentPage if filtered results shrink
  const safeCurrentPage = useMemo(
    () => clamp(currentPage, 1, totalPages),
    [currentPage, totalPages]
  );

  const paginatedReports = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, safeCurrentPage, pageSize]);

  return {
    customReports,
    loading,
    generating,
    error,
    generateCustomReport,
    filteredReports,
    paginatedReports,
    searchQuery,
    setSearchQuery,
    currentPage: safeCurrentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    count: customReports.length,
  };
};

export default useCustomReport;