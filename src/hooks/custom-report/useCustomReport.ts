import { useState, useCallback, useMemo, useRef } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { WEBHOOK_CUSTOM_REPORT_URL } from "@/config/env";
import { safeParseResponse } from "@/lib/safeFetch";
import { ReportItem } from "@/hooks/useReports";

interface CustomReportPayload {
  body: {
    period: string;
    first_seen_end: string;
    durationHours: number;
    period_label: string;
  };
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
  try {
    const parsed = JSON.parse(normalized);
    if (typeof parsed === "string") normalized = parsed;
  } catch { /* not JSON-encoded */ }
  return normalized
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
};

export const useCustomReport = (): UseCustomReportReturn => {
  const [customReports, setCustomReports] = useState<ReportItem[]>([]);
  const [loading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const reportsRef = useRef<ReportItem[]>([]);

  const { authenticatedFetch } = useAuthenticatedFetch();

  const generateCustomReport = useCallback(
    async (from: Date, to: Date) => {
      setGenerating(true);
      setError(null);

      const durationMs = to.getTime() - from.getTime();
      const durationHours = Math.round(durationMs / (1000 * 60 * 60));

      const payload: CustomReportPayload = {
        body: {
          period: from.toISOString(),
          first_seen_end: to.toISOString(),
          durationHours,
          period_label: "custom_range",
        },
      };

      try {
        const response = await authenticatedFetch(WEBHOOK_CUSTOM_REPORT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await safeParseResponse<ReportItem[]>(response, WEBHOOK_CUSTOM_REPORT_URL);
        if (!result.ok) throw new Error(result.userMessage);

        const raw: ReportItem[] = Array.isArray(result.data) ? result.data : [];
        const valid = raw.filter(
          (r) =>
            r &&
            typeof r.report_type === "string" &&
            typeof r.report_template === "string" &&
            typeof r.created_at === "string"
        );
        const processed = valid.map((r) => ({
          ...r,
          report_type: r.report_type || "custom",
          report_template: normalizeHtml(r.report_template),
        }));

        // Merge with existing custom reports (newest first), deduplicate by created_at
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
        setCurrentPage(1);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to generate custom report. Please try again.";
        setError(msg);
      } finally {
        setGenerating(false);
      }
    },
    [authenticatedFetch]
  );

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return customReports;
    const q = searchQuery.toLowerCase();
    return customReports.filter(
      (r) =>
        r.report_type.toLowerCase().includes(q) ||
        new Date(r.created_at).toLocaleDateString().includes(q)
    );
  }, [customReports, searchQuery]);

  const totalPages = Math.ceil(filteredReports.length / pageSize);

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, currentPage, pageSize]);

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
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    count: customReports.length,
  };
};

export default useCustomReport;
