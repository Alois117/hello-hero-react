import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";

// ============================================================================
// AI INSIGHTS HOOK
// Fetches AI-generated insights from backend webhook with:
// - Silent 5-second refresh (no UI flicker)
// - Client-side pagination
// - Time-based filtering
// - Sorted by created_at descending (newest first)
// ============================================================================

const AI_INSIGHTS_ENDPOINT = "https://10.100.12.141:5678/webhook/agent-insights";
const REFRESH_INTERVAL = 5000; // 5 seconds

// Response structure from the webhook
export interface AiInsightRaw {
  id?: string | number;
  entity_type?: string;
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
  [key: string]: unknown; // Allow additional fields
}

// Normalized insight for UI consumption
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
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  // Time Filters
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  customDateFrom: Date | undefined;
  setCustomDateFrom: (date: Date | undefined) => void;
  customDateTo: Date | undefined;
  setCustomDateTo: (date: Date | undefined) => void;
  // Counts by type
  counts: {
    total: number;
    predictions: number;
    anomalies: number;
    optimizations: number;
    alerts: number;
  };
  // Manual refresh
  refresh: () => Promise<void>;
}

// Normalize severity values
const normalizeSeverity = (severity?: string): AiInsight["severity"] => {
  if (!severity) return "info";
  const lower = severity.toLowerCase();
  if (lower === "critical" || lower === "disaster") return "critical";
  if (lower === "high" || lower === "error") return "high";
  if (lower === "medium" || lower === "average" || lower === "warning") return "medium";
  if (lower === "low") return "low";
  return "info";
};

// Normalize impact values
const normalizeImpact = (impact?: string): AiInsight["impact"] => {
  if (!impact) return "medium";
  const lower = impact.toLowerCase();
  if (lower === "critical") return "critical";
  if (lower === "high") return "high";
  if (lower === "low") return "low";
  return "medium";
};

// Normalize type values
const normalizeType = (type?: string): AiInsight["type"] => {
  if (!type) return "info";
  const lower = type.toLowerCase();
  if (lower.includes("predict")) return "prediction";
  if (lower.includes("anomal")) return "anomaly";
  if (lower.includes("optim")) return "optimization";
  if (lower.includes("alert")) return "alert";
  return "info";
};

// Transform raw API response to normalized insight
const transformInsight = (raw: AiInsightRaw, index: number): AiInsight => {
  const id = raw.id?.toString() || `insight-${Date.now()}-${index}`;
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
    type: normalizeType(raw.type),
    impact: normalizeImpact(raw.impact),
    confidence: typeof raw.confidence === "number" ? raw.confidence : 85,
    recommendation: raw.recommendation || extractRecommendation(raw.response_content),
  };
};

// Extract summary from response content
const extractSummary = (content?: string): string => {
  if (!content) return "No summary available";
  // Take first sentence or first 150 chars
  const firstSentence = content.split(/[.!?]/)[0];
  if (firstSentence.length <= 150) return firstSentence.trim();
  return content.substring(0, 147).trim() + "...";
};

// Generate title from raw data
const generateTitle = (raw: AiInsightRaw): string => {
  if (raw.title) return raw.title;
  if (raw.entity_type && raw.host) return `${raw.entity_type} - ${raw.host}`;
  if (raw.entity_type) return `${raw.entity_type} Insight`;
  return "AI Insight";
};

// Extract recommendation from response content
const extractRecommendation = (content?: string): string => {
  if (!content) return "Review the insight details for recommendations";
  // Try to find recommendation patterns
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

// Sort insights by created_at descending (newest first)
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Time filter state
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d");
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>(undefined);
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>(undefined);

  // Refs for smart merge and cleanup
  const insightsMapRef = useRef<Map<string, AiInsight>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { authenticatedFetch } = useAuthenticatedFetch();

  // Fetch insights from webhook
  const fetchInsights = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await authenticatedFetch(AI_INSIGHTS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Empty body for POST request
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle both array and single object responses
      const rawInsights: AiInsightRaw[] = Array.isArray(data) ? data : [data];
      
      // Transform to normalized format
      const transformedInsights = rawInsights.map((raw, idx) => transformInsight(raw, idx));

      // Smart merge: only update changed insights to avoid UI flicker
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
      const sortedInsights = sortInsights(Array.from(newInsightsMap.values()));
      setInsights(sortedInsights);
      setIsConnected(true);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      // Only set error on initial load, not on silent refresh failures
      if (!silent) {
        console.error("Failed to fetch AI insights:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch insights");
      }
      setIsConnected(false);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [authenticatedFetch]);

  // Initial fetch
  useEffect(() => {
    fetchInsights(false);
  }, [fetchInsights]);

  // Silent refresh every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchInsights(true);
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchInsights]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, customDateFrom, customDateTo]);

  // Apply time filters
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

  // Calculate pagination
  const totalCount = filteredInsights.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);

  // Paginated insights
  const paginatedInsights = useMemo(() => {
    return filteredInsights.slice(startIndex, endIndex);
  }, [filteredInsights, startIndex, endIndex]);

  // Counts by type
  const counts = useMemo(() => ({
    total: insights.length,
    predictions: insights.filter((i) => i.type === "prediction").length,
    anomalies: insights.filter((i) => i.type === "anomaly").length,
    optimizations: insights.filter((i) => i.type === "optimization").length,
    alerts: insights.filter((i) => i.type === "alert").length,
  }), [insights]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await fetchInsights(false);
  }, [fetchInsights]);

  // Ensure current page is valid when total pages changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
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
    refresh,
  };
};

// Utility: Format date for display
export const formatInsightDate = (date: Date): string => {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Utility: Get relative time string
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
