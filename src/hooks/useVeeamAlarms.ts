import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { safeParseResponse } from "@/lib/safeFetch";

export interface VeeamAlarm {
  client_id: number;
  alarm_id: string;
  dedupe_key: string;
  name: string;
  description: string;
  severity: string;
  status: string;
  entity_type: string;
  entity_name: string;
  triggered_at: string | null;
  resolved_at: string | null;
  first_seen: string | null;
  last_seen: string | null;
  seen_count: number;
  times_sent: number;
  reminder_interval?: number;
  first_ai_response?: string;
}

export type AlarmStatus = "Active" | "Acknowledged" | "Resolved" | "Suppressed";
export type AlarmSeverity = "Critical" | "Warning" | "High" | "Info" | "Unknown";
export type TimeRange = "1h" | "24h" | "7d" | "custom";

interface UseVeeamAlarmsOptions {
  pageSize?: number;
}

interface UseVeeamAlarmsReturn {
  alarms: VeeamAlarm[];
  filteredAlarms: VeeamAlarm[];
  paginatedAlarms: VeeamAlarm[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdated: Date | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: AlarmStatus | null;
  setFilterStatus: (status: AlarmStatus | null) => void;
  filterSeverity: AlarmSeverity | null;
  setFilterSeverity: (severity: AlarmSeverity | null) => void;
  filterEntityType: string | null;
  setFilterEntityType: (entityType: string | null) => void;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  customDateFrom: Date | undefined;
  setCustomDateFrom: (date: Date | undefined) => void;
  customDateTo: Date | undefined;
  setCustomDateTo: (date: Date | undefined) => void;
  // Pagination
  loadMore: () => void;
  resetPagination: () => void;
  // Counts
  counts: {
    total: number;
    active: number;
    acknowledged: number;
    resolved: number;
    suppressed: number;
  };
  // Entity types for filter dropdown
  entityTypes: string[];
}

import { WEBHOOK_VEEAM_ALARMS_URL } from "@/config/env";

const VEEAM_ALARMS_ENDPOINT = WEBHOOK_VEEAM_ALARMS_URL;
const REFRESH_INTERVAL = 5000;

export const useVeeamAlarms = (options: UseVeeamAlarmsOptions = {}): UseVeeamAlarmsReturn => {
  const { pageSize = 10 } = options;

  const [alarms, setAlarms] = useState<VeeamAlarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<AlarmStatus | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<AlarmSeverity | null>(null);
  const [filterEntityType, setFilterEntityType] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>(undefined);
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>(undefined);

  // Pagination state
  const [displayCount, setDisplayCount] = useState(pageSize);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayCount(pageSize);
  }, [debouncedSearch, filterStatus, filterSeverity, filterEntityType, timeRange, customDateFrom, customDateTo, pageSize]);

  const { authenticatedFetch } = useAuthenticatedFetch();

  const fetchAlarms = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const response = await authenticatedFetch(VEEAM_ALARMS_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      const result = await safeParseResponse<any[]>(response, VEEAM_ALARMS_ENDPOINT);
      if (!result.ok) {
        throw new Error(result.userMessage);
      }

      if (!result.data || !Array.isArray(result.data)) {
        setAlarms([]);
        setIsConnected(true);
        setLastUpdated(new Date());
        setError(null);
        if (!silent) setLoading(false);
        return;
      }

      const alarmsArray = result.data
        .map((item: any) => {
          if (typeof item !== "object" || item === null) return null;
          const outerKey = Object.keys(item)[0];
          if (!outerKey) return null;
          const inner = item[outerKey];
          if (!inner) return null;

          const severityMap: { [key: string]: AlarmSeverity } = {
            Error: "Critical",
            Warning: "Warning",
            Information: "Info",
            High: "High",
            Resolved: "Info",
          };

          const mappedSeverity = severityMap[outerKey] || "Unknown";

          const isResolved =
            outerKey === "Resolved" ||
            (inner.description || "").toLowerCase().includes("back to normal");

          const mappedStatus: AlarmStatus = isResolved ? "Resolved" : "Active";

          return {
            client_id: inner.client_id,
            alarm_id: inner.triggered_alarm_id,
            dedupe_key: inner.dedupe_key,
            name: inner.alarm_name,
            description: inner.description,
            severity: mappedSeverity,
            status: mappedStatus,
            entity_type: inner.object_type,
            entity_name: inner.object_name,
            triggered_at: inner.triggered_time,
            resolved_at: inner.resolved_at,
            first_seen: inner.first_seen,
            last_seen: inner.last_seen,
            seen_count: inner.repeat_count,
            times_sent: 0,
            reminder_interval: undefined,
            first_ai_response: inner.comment || undefined,
          } as VeeamAlarm;
        })
        .filter((alarm): alarm is VeeamAlarm => Boolean(alarm));

      // ────────────────────────────────────────────────
      // DEDUPLICATION: Keep only one alarm per dedupe_key
      // ────────────────────────────────────────────────
      const uniqueAlarmsMap = new Map<string, VeeamAlarm>();
      alarmsArray.forEach((alarm) => {
        if (alarm.dedupe_key && !uniqueAlarmsMap.has(alarm.dedupe_key)) {
          uniqueAlarmsMap.set(alarm.dedupe_key, alarm);
        }
      });

      const uniqueAlarms = Array.from(uniqueAlarmsMap.values());

      setAlarms(uniqueAlarms);
      setIsConnected(true);
      setLastUpdated(new Date());
      setError(null);

      // Optional: log for debugging
      // console.log(`Fetched: ${alarmsArray.length} alarms → Unique: ${uniqueAlarms.length}`);
    } catch (err) {
      const safe = err instanceof Error ? err.message : "We couldn't load Veeam alarms. Please try again.";
      console.error("[useVeeamAlarms] Fetch error:", err);
      if (!silent) setError(safe);
      setIsConnected(false);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [authenticatedFetch]);

  // Initial fetch + polling
  useEffect(() => {
    fetchAlarms();
    const interval = setInterval(() => fetchAlarms(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAlarms]);

  // Unique entity types for dropdown
  const entityTypes = useMemo(() => {
    const types = new Set(alarms.map((a) => a.entity_type).filter(Boolean));
    return Array.from(types).sort();
  }, [alarms]);

  // Filtered & sorted alarms
  const filteredAlarms = useMemo(() => {
    return alarms
      .filter((alarm) => {
        // Search
        if (debouncedSearch) {
          const search = debouncedSearch.toLowerCase();
          return (
            alarm.name?.toLowerCase().includes(search) ||
            alarm.entity_name?.toLowerCase().includes(search) ||
            alarm.entity_type?.toLowerCase().includes(search) ||
            alarm.description?.toLowerCase().includes(search) ||
            alarm.alarm_id?.toLowerCase().includes(search)
          );
        }

        if (filterStatus && alarm.status !== filterStatus) return false;
        if (filterSeverity && alarm.severity !== filterSeverity) return false;
        if (filterEntityType && alarm.entity_type !== filterEntityType) return false;

        // Time range filter
        const alarmTime = alarm.last_seen || alarm.triggered_at;
        if (alarmTime && timeRange !== "custom") {
          const alarmDate = new Date(alarmTime).getTime();
          let cutoff = 0;
          switch (timeRange) {
            case "1h":
              cutoff = Date.now() - 60 * 60 * 1000;
              break;
            case "24h":
              cutoff = Date.now() - 24 * 60 * 60 * 1000;
              break;
            case "7d":
              cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
              break;
          }
          if (cutoff > 0 && alarmDate < cutoff) return false;
        }

        // Custom range
        if (timeRange === "custom" && alarmTime) {
          const alarmDate = new Date(alarmTime).getTime();
          if (customDateFrom && alarmDate < customDateFrom.getTime()) return false;
          if (customDateTo) {
            const toEnd = new Date(customDateTo);
            toEnd.setHours(23, 59, 59, 999);
            if (alarmDate > toEnd.getTime()) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const aTime = a.last_seen || a.triggered_at || "";
        const bTime = b.last_seen || b.triggered_at || "";
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
  }, [alarms, debouncedSearch, filterStatus, filterSeverity, filterEntityType, timeRange, customDateFrom, customDateTo]);

  const paginatedAlarms = useMemo(() => {
    return filteredAlarms.slice(0, displayCount);
  }, [filteredAlarms, displayCount]);

  const counts = useMemo(() => {
    return {
      total: alarms.length,
      active: alarms.filter((a) => a.status === "Active").length,
      acknowledged: alarms.filter((a) => a.status === "Acknowledged").length,
      resolved: alarms.filter((a) => a.status === "Resolved").length,
      suppressed: alarms.filter((a) => a.status === "Suppressed").length,
    };
  }, [alarms]);

  const loadMore = useCallback(() => {
    setDisplayCount((prev) => prev + pageSize);
  }, [pageSize]);

  const resetPagination = useCallback(() => {
    setDisplayCount(pageSize);
  }, [pageSize]);

  return {
    alarms,
    filteredAlarms,
    paginatedAlarms,
    loading,
    error,
    isConnected,
    lastUpdated,
    totalCount: filteredAlarms.length,
    currentPage: Math.ceil(displayCount / pageSize),
    totalPages: Math.ceil(filteredAlarms.length / pageSize),
    hasMore: displayCount < filteredAlarms.length,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterSeverity,
    setFilterSeverity,
    filterEntityType,
    setFilterEntityType,
    timeRange,
    setTimeRange,
    customDateFrom,
    setCustomDateFrom,
    customDateTo,
    setCustomDateTo,
    loadMore,
    resetPagination,
    counts,
    entityTypes,
  };
};

export const formatAlarmTime = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString();
};

export const getRelativeTime = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
};