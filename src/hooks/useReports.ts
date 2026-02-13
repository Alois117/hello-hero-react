import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { WEBHOOK_REPORTS_URL } from "@/config/env";
import { safeParseResponse } from "@/lib/safeFetch";

const WEBHOOK_URL = WEBHOOK_REPORTS_URL;
const REFRESH_INTERVAL = 30000; // 30 seconds

export interface ReportItem {
  report_type: "daily" | "weekly" | "monthly" | string;
  report_template: string;
  created_at: string;
}

export interface ReportCounts {
  total: number;
  daily: number;
  weekly: number;
  monthly: number;
}

export interface UseReportsReturn {
  reports: ReportItem[];
  loading: boolean;
  error: string | null;
  counts: ReportCounts;
  isConnected: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  filteredReports: ReportItem[];
  paginatedReports: ReportItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  pageSize: number;
  dateRange: { from: Date | null; to: Date | null };
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;
  fetchCustomReports: () => Promise<void>;
}

const sortReportsDescending = (reports: ReportItem[]): ReportItem[] => {
  return [...reports].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });
};

export const useReports = (): UseReportsReturn => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reportsMapRef = useRef<Map<string, ReportItem>>(new Map());

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });

  const { authenticatedFetch } = useAuthenticatedFetch();

  const counts: ReportCounts = useMemo(() => ({
    total: reports.length,
    daily: reports.filter((r) => r.report_type === "daily").length,
    weekly: reports.filter((r) => r.report_type === "weekly").length,
    monthly: reports.filter((r) => r.report_type === "monthly").length,
  }), [reports]);

  /**
   * Normalize double-escaped HTML from the API.
   * Some reports come with JSON-stringified HTML (double-escaped),
   * others come as plain HTML. This handles both cases gracefully.
   */
  const normalizeHtml = (raw: string): string => {
    if (!raw || typeof raw !== "string") return "";
    
    let normalized = raw.trim();
    
    // Attempt JSON.parse to handle double-escaped content
    // If it fails, the content is already plain HTML
    try {
      const parsed = JSON.parse(normalized);
      if (typeof parsed === "string") {
        normalized = parsed;
      }
    } catch {
      // Not JSON-encoded, use as-is
    }
    
    // Handle any remaining escaped sequences
    normalized = normalized
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
    
    return normalized;
  };

  const fetchReports = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);

        const response = await authenticatedFetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        const result = await safeParseResponse<ReportItem[]>(response, WEBHOOK_URL);
        if (!result.ok) {
          throw new Error(result.userMessage);
        }

        const webhookReports: ReportItem[] = Array.isArray(result.data) ? result.data : [];

        const validReports = webhookReports.filter(
          (r) =>
            r &&
            typeof r.report_type === "string" &&
            typeof r.report_template === "string" &&
            typeof r.created_at === "string"
        );

        // Normalize HTML templates (handle double-escaped content)
        const processedReports = validReports.map((report) => ({
          ...report,
          report_template: normalizeHtml(report.report_template),
        }));

        const newReportsMap = new Map<string, ReportItem>();
        processedReports.forEach((report) => {
          const key = `${report.report_type}_${report.created_at}`;
          const existing = reportsMapRef.current.get(key);
          if (!existing || JSON.stringify(existing) !== JSON.stringify(report)) {
            newReportsMap.set(key, report);
          } else {
            newReportsMap.set(key, existing);
          }
        });

        reportsMapRef.current = newReportsMap;
        const sortedReports = sortReportsDescending(Array.from(newReportsMap.values()));
        setReports(sortedReports);
        setIsConnected(true);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        const safe = err instanceof Error ? err.message : "We couldn't load reports. Please try again.";
        console.error("[useReports] Fetch error:", err);
        setError(safe);
        setIsConnected(false);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [authenticatedFetch]
  );

  const fetchCustomReports = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) return;

    try {
      setLoading(true);

        const response = await authenticatedFetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
          }),
        });

        const result = await safeParseResponse<ReportItem[]>(response, WEBHOOK_URL);
        if (!result.ok) throw new Error(result.userMessage);

        const webhookReports: ReportItem[] = Array.isArray(result.data) ? result.data : [];

      const validReports = webhookReports.filter(
        (r) =>
          r &&
          typeof r.report_type === "string" &&
          typeof r.report_template === "string" &&
          typeof r.created_at === "string"
      );

      // Normalize HTML templates (handle double-escaped content)
      const processedReports = validReports.map((report) => ({
        ...report,
        report_template: normalizeHtml(report.report_template),
      }));

      const sortedReports = sortReportsDescending(processedReports);
      setReports(sortedReports);
      setIsConnected(true);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const safe = err instanceof Error ? err.message : "We couldn't load custom reports. Please try again.";
      console.error("[useReports] Custom fetch error:", err);
      setError(safe);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, dateRange]);

  const filteredReports = useMemo(() => {
    let result = reports;
    if (selectedType !== "all") {
      result = result.filter((r) => r.report_type === selectedType);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.report_type.toLowerCase().includes(query) ||
          new Date(r.created_at).toLocaleDateString().includes(query)
      );
    }
    return result;
  }, [reports, selectedType, searchQuery]);

  const totalPages = Math.ceil(filteredReports.length / pageSize);

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredReports.slice(startIndex, startIndex + pageSize);
  }, [filteredReports, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  useEffect(() => {
    fetchReports(false);
  }, [fetchReports]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchReports(true);
    }, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchReports]);

  const refresh = useCallback(async () => {
    await fetchReports(false);
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    counts,
    isConnected,
    lastUpdated,
    refresh,
    filteredReports,
    paginatedReports,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    dateRange,
    setDateRange,
    fetchCustomReports,
  };
};

export default useReports;