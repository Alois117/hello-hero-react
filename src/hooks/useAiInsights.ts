import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { WEBHOOK_AI_INSIGHTS_URL } from "@/config/env";
import { safeParseResponse } from "@/lib/safeFetch";

const AI_INSIGHTS_ENDPOINT = WEBHOOK_AI_INSIGHTS_URL;
const REFRESH_INTERVAL = 5000; // 5 seconds

export interface AiInsightRaw {
  id?: string | number;
  ai_response_id?: string;
  entity_type?: string;
  entity_uid?: string; 
  entity_id?: string;
  host?: string;
  event_reference?: string;
  severity?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  response_content?: string;
  summary?: string;
  title?: string;
  type?: string;
  impact?: string;
  confidence?: number;
  recommendation?: string;
  [key: string]: unknown;
}

export interface AiInsight {
  id: string;
  entityType: string;
  entityId: string;
  host: string;
  eventReference: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
  responseContent: string;
  summary: string;
  title: string;
  type: "prediction" | "anomaly" | "optimization" | "alert" | "info";
  impact: "critical" | "high" | "medium" | "low";
  confidence: number;
  recommendation: string;
}

export type TimeFilter = "today" | "24h" | "7d" | "30d" | "custom";

interface UseAiInsightsOptions {
  pageSize?: number;
}

interface UseAiInsightsReturn {
  insights: AiInsight[];
  filteredInsights: AiInsight[];
  paginatedInsights: AiInsight[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdated: Date | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  customDateFrom: Date | undefined;
  setCustomDateFrom: (date: Date | undefined) => void;
  customDateTo: Date | undefined;
  setCustomDateTo: (date: Date | undefined) => void;
  counts: {
    total: number;
    predictions: number;
    anomalies: number;
    optimizations: number;
    alerts: number;
  };
  // ── New fields for summary cards ───────────────
  highPriorityCount: number;
  last24hCount: number;
  mostAffectedHost: string;
  // ────────────────────────────────────────────────
  refresh: () => Promise<void>;
}

const normalizeSeverity = (severity?: string): AiInsight["severity"] => {
  if (!severity) return "info";
  const lower = severity.toLowerCase();
  if (lower === "critical" || lower === "disaster") return "critical";
  if (lower === "high" || lower === "error") return "high";
  if (lower === "medium" || lower === "average" || lower === "warning") return "medium";
  if (lower === "low") return "low";
  return "info";
};

const normalizeImpact = (impact?: string): AiInsight["impact"] => {
  if (!impact) return "medium";
  const lower = impact.toLowerCase();
  if (lower === "critical") return "critical";
  if (lower === "high") return "high";
  if (lower === "low") return "low";
  return "medium";
};

const normalizeType = (
  type?: string,
  severity?: string,
  content?: string
): AiInsight["type"] => {
  const combined = `${type ?? ""} ${severity ?? ""} ${content ?? ""}`.toLowerCase();

  if (combined.includes("predict") || combined.includes("forecast"))
    return "prediction";

  if (combined.includes("anomal") || combined.includes("outlier"))
    return "anomaly";

  if (combined.includes("optimi") || combined.includes("improve"))
    return "optimization";

  if (combined.includes("alert") || combined.includes("critical") || combined.includes("warning"))
    return "alert";

  return "info";
};

const transformInsight = (raw: AiInsightRaw, index: number): AiInsight => {
  const id =
    raw.ai_response_id ??
    raw.event_reference ??
    `${raw.entity_type}-${raw.entity_uid}-${raw.created_at}`;

  const createdAt = raw.created_at ? new Date(raw.created_at) : new Date();
  const updatedAt = raw.updated_at ? new Date(raw.updated_at) : null;

  return {
    id,
    entityType: raw.entity_type || "Unknown",
    entityId: raw.entity_id || "",
    host: raw.host || raw.event_reference?.split("_")[0] || "Unknown Host",
    eventReference: raw.event_reference || "",
    severity: normalizeSeverity(raw.severity),
    status: raw.status || "active",
    createdAt,
    updatedAt,
    responseContent: raw.response_content || "",
    summary: raw.summary || raw.title || extractSummary(raw.response_content),
    title: raw.title || generateTitle(raw),
    type: normalizeType(raw.type, raw.severity, raw.response_content), 
    impact: normalizeImpact(raw.impact),
    confidence: typeof raw.confidence === "number" ? raw.confidence : 85,
    recommendation: raw.recommendation || extractRecommendation(raw.response_content),
  };
};

const extractSummary = (content?: string): string => {
  if (!content) return "No summary available";
  const firstSentence = content.split(/[.!?]/)[0];
  if (firstSentence.length <= 150) return firstSentence.trim();
  return content.substring(0, 147).trim() + "...";
};

const generateTitle = (raw: AiInsightRaw): string => {
  if (raw.title) return raw.title;
  if (raw.entity_type && raw.host) return `${raw.entity_type} - ${raw.host}`;
  if (raw.entity_type) return `${raw.entity_type} Insight`;
  return "AI Insight";
};

const extractRecommendation = (content?: string): string => {
  if (!content) return "Review the insight details for recommendations";
  const patterns = [
    /recommend[ation]*[s]?:?\s*(.+?)(?:\.|$)/i,
    /suggest[ion]*[s]?:?\s*(.+?)(?:\.|$)/i,
    /action[s]?:?\s*(.+?)(?:\.|$)/i,
  ];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return "Review the insight details for recommendations";
};

const sortInsights = (insights: AiInsight[]): AiInsight[] => {
  return [...insights].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const useAiInsights = (options: UseAiInsightsOptions = {}): UseAiInsightsReturn => {
  const { pageSize = 8 } = options;

  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d");
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>(undefined);
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>(undefined);

  const insightsMapRef = useRef<Map<string, AiInsight>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { authenticatedFetch } = useAuthenticatedFetch();

  const fetchInsights = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await authenticatedFetch(AI_INSIGHTS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const result = await safeParseResponse<AiInsightRaw[]>(response, AI_INSIGHTS_ENDPOINT);
      if (!result.ok) {
        throw new Error(result.userMessage);
      }

      if (!result.data) {
        setInsights([]);
        setIsConnected(true);
        setLastUpdated(new Date());
        setError(null);
        if (!silent) setLoading(false);
        return;
      }

      const rawInsights: AiInsightRaw[] = Array.isArray(result.data) ? result.data : [result.data];

      const transformedInsights = rawInsights.map((raw, idx) => transformInsight(raw, idx));

      const newInsightsMap = new Map<string, AiInsight>();
      transformedInsights.forEach((insight) => {
        const existing = insightsMapRef.current.get(insight.id);
        if (!existing || existing.createdAt.getTime() !== insight.createdAt.getTime()) {
          newInsightsMap.set(insight.id, insight);
        } else {
          newInsightsMap.set(insight.id, existing);
        }
      });

      insightsMapRef.current = newInsightsMap;

      const newSorted = sortInsights(Array.from(newInsightsMap.values()));

      setInsights((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(newSorted)) {
          return prev;
        }
        return newSorted;
      });

      setIsConnected(true);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const safe = err instanceof Error ? err.message : "We couldn't load AI insights. Please try again.";
      console.error("[useAiInsights] Fetch error:", err);
      if (!silent) setError(safe);
      setIsConnected(false);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    fetchInsights(false);
  }, [fetchInsights]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchInsights(true);
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchInsights]);

  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, customDateFrom, customDateTo]);

  const filteredInsights = useMemo(() => {
    return insights.filter((insight) => {
      const insightTime = insight.createdAt.getTime();
      const now = Date.now();

      switch (timeFilter) {
        case "today": {
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          return insightTime >= startOfDay.getTime();
        }
        case "24h": {
          const cutoff = now - 24 * 60 * 60 * 1000;
          return insightTime >= cutoff;
        }
        case "7d": {
          const cutoff = now - 7 * 24 * 60 * 60 * 1000;
          return insightTime >= cutoff;
        }
        case "30d": {
          const cutoff = now - 30 * 24 * 60 * 60 * 1000;
          return insightTime >= cutoff;
        }
        case "custom": {
          if (customDateFrom && insightTime < customDateFrom.getTime()) return false;
          if (customDateTo) {
            const endOfDay = new Date(customDateTo);
            endOfDay.setHours(23, 59, 59, 999);
            if (insightTime > endOfDay.getTime()) return false;
          }
          return true;
        }
        default:
          return true;
      }
    });
  }, [insights, timeFilter, customDateFrom, customDateTo]);

  const totalCount = filteredInsights.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);

  const paginatedInsights = useMemo(() => {
    return filteredInsights.slice(startIndex, endIndex);
  }, [filteredInsights, startIndex, endIndex]);

  const counts = useMemo(() => ({
    total: insights.length,
    predictions: insights.filter((i) => i.type === "prediction").length,
    anomalies: insights.filter((i) => i.type === "anomaly").length,
    optimizations: insights.filter((i) => i.type === "optimization").length,
    alerts: insights.filter((i) => i.type === "alert").length,
  }), [insights]);

  // ── New summary metrics ───────────────────────────────────────────────────
  const highPriorityCount = useMemo(() => {
    return insights.filter(i => 
      i.severity === "critical" || 
      i.severity === "high" || 
      i.impact === "critical" || 
      i.impact === "high"
    ).length;
  }, [insights]);

  const last24hCount = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return insights.filter(i => i.createdAt.getTime() >= cutoff).length;
  }, [insights]);

  const mostAffectedHost = useMemo(() => {
    if (insights.length === 0) return "—";

    const hostCounts = new Map<string, number>();

    insights.forEach(i => {
      let host = (i.host || "unknown").trim().toLowerCase();
      if (host && host !== "unknown" && host !== "") {
        hostCounts.set(host, (hostCounts.get(host) || 0) + 1);
      }
    });

    if (hostCounts.size === 0) return "—";

    let maxCount = 0;
    let topHost = "";

    hostCounts.forEach((count, host) => {
      if (count > maxCount) {
        maxCount = count;
        topHost = host;
      }
    });

    // Nice capitalization
    return topHost
      .split(/[-_.]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join("-");
  }, [insights]);
  // ───────────────────────────────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    await fetchInsights(false);
  }, [fetchInsights]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [currentPage, totalPages]);

  return {
    insights,
    filteredInsights,
    paginatedInsights,
    loading,
    error,
    isConnected,
    lastUpdated,
    currentPage,
    totalPages,
    totalCount,
    setCurrentPage,
    pageSize,
    startIndex,
    endIndex,
    timeFilter,
    setTimeFilter,
    customDateFrom,
    setCustomDateFrom,
    customDateTo,
    setCustomDateTo,
    counts,
    highPriorityCount,
    last24hCount,
    mostAffectedHost,
    refresh,
  };
};

export const formatInsightDate = (date: Date): string => {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getRelativeTime = (date: Date): string => {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatInsightDate(date);
};

export default useAiInsights;