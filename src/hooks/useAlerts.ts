import { useState, useEffect, useCallback, useRef } from "react";
import { Alert } from "@/components/alerts/AlertsTable";
import { AlertSeverity } from "@/components/alerts/SeverityBadge";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { WEBHOOK_ALERTS_URL } from "@/config/env";
import { safeParseResponse, networkError } from "@/lib/safeFetch";

const WEBHOOK_URL = WEBHOOK_ALERTS_URL;
const REFRESH_INTERVAL = 5000; // 5 seconds

// ────────────────────────────────────────────────
// Updated interface – all nested fields are optional
// ────────────────────────────────────────────────
export interface WebhookAlert {
  client_id: number;
  first_ai_response: string;
  created_at: string;
  updated_at: string;
  zbx_raw?: {
    clock?: number;
    eventid?: string;
    started?: string;
    objectid?: string;
    severity?: string;
    client_id?: number;
    raw_event?: {
      name?: string;
      clock?: string;
      eventid?: string;
      r_clock?: string;
      objectid?: string;
      severity?: string;
    };
    dedupe_key?: string;
    description?: string;
    problem_name?: string;
    severity_num?: number;
    update_fetch_time?: number;
  };
  first_seen: string;
  seen_count: number;
  last_seen_at: string;
  times_sent: number;
  reminder_interval_hours?: number;
  // Direct top-level fallbacks (sometimes present)
  dedupe_key?: string;
  description?: string;
  name?: string;
  severity?: string;
  eventid?: string;
  clock?: number;
}

// Map severity string → our AlertSeverity enum
const mapSeverity = (severity: string | undefined): AlertSeverity => {
  if (!severity) return "info";
  const s = severity.toLowerCase();
  if (s.includes("disaster")) return "disaster";
  if (s.includes("high")) return "high";
  if (s.includes("average")) return "average";
  if (s.includes("warning")) return "warning";
  return "info";
};

// Calculate duration using last_seen_at
const calculateDuration = (lastSeen: string): string => {
  const last = new Date(lastSeen);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins}m`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
};

// Extract category from name/description
const extractCategory = (name: string = "", description: string = ""): string => {
  const text = (name + " " + description).toLowerCase();
  if (text.includes("vmware")) return "VMware";
  if (text.includes("disk")) return "Disk";
  if (text.includes("cpu")) return "CPU";
  if (text.includes("memory")) return "Memory";
  if (text.includes("network")) return "Network";
  if (text.includes("database") || text.includes("db")) return "Database";
  if (text.includes("service")) return "Service";
  return "System";
};

// Extract host – prefer AI response pattern **Host:** …
const extractHost = (aiResponse: string, dedupeKey: string = ""): string => {
  const hostMatch = aiResponse.match(/\*\*Host:\*\*\s*([^\n.]+)/i);
  if (hostMatch) return hostMatch[1].trim();

  // Fallback: first meaningful part of dedupe_key
  const parts = dedupeKey.split(/[_-]/);
  return parts[0] && parts[0] !== "" ? parts[0] : "unknown-host";
};

// ────────────────────────────────────────────────
// Transform webhook → our Alert format
// ────────────────────────────────────────────────
const transformWebhookAlert = (webhook: WebhookAlert): Alert => {
  const raw      = webhook.zbx_raw ?? {};
  const rawEvent = raw.raw_event ?? {};

  // Gather name/problem from multiple possible locations
  const name =
    raw.problem_name ??
    raw.description ??
    rawEvent.name ??
    webhook.description ??
    webhook.name ??
    "Unknown Problem";

  // Severity – prefer most specific source
  const severityStr =
    raw.severity ??
    rawEvent.severity ??
    webhook.severity ??
    "info";

  const dedupeKey =
    webhook.dedupe_key ??
    raw.dedupe_key ??
    "";

  const eventId =
    webhook.eventid ??
    raw.eventid ??
    rawEvent.eventid ??
    "0";

  const clock =
    webhook.clock ??
    raw.clock ??
    rawEvent.clock ??
    0;

  const severity = mapSeverity(severityStr);
  const acknowledged = !!(rawEvent.r_clock && rawEvent.r_clock !== "0");

  return {
    id: parseInt(eventId, 10),
    severity,
    host: extractHost(webhook.first_ai_response, dedupeKey),
    category: extractCategory(name, webhook.description ?? raw.description ?? rawEvent.name ?? ""),
    problem: name,
    duration: calculateDuration(webhook.last_seen_at),
    scope: "Production",
    acknowledged,
    status: acknowledged ? "acknowledged" : "active",
    timestamp: new Date(webhook.created_at).toLocaleString(),
    // Extended fields for drawer / details
    aiInsights: webhook.first_ai_response,
    timesSent: webhook.times_sent,
    seenCount: webhook.seen_count,
    firstSeen: webhook.first_seen,
    lastSeen: webhook.last_seen_at,
    dedupeKey,
    rawMetadata: { ...raw, ...rawEvent },
  };
};

// Sort newest → oldest (prefer last_seen_at > created_at > clock)
const sortAlertsDescending = (alerts: Alert[]): Alert[] => {
  return [...alerts].sort((a, b) => {
    const getTime = (alert: Alert): number => {
      // 1. Prefer lastSeen
      if (alert.lastSeen) {
        const d = new Date(alert.lastSeen);
        if (!isNaN(d.getTime())) return d.getTime();
      }
      // 2. Then timestamp (created_at)
      if (alert.timestamp) {
        const d = new Date(alert.timestamp);
        if (!isNaN(d.getTime())) return d.getTime();
      }
      // 3. Fallback to raw clock (epoch seconds → ms)
      const rawClock = (alert.rawMetadata as any)?.clock;
      if (rawClock) {
        const epoch = typeof rawClock === "number" ? rawClock : parseInt(rawClock, 10);
        if (!isNaN(epoch)) return epoch * 1000;
      }
      return 0;
    };

    return getTime(b) - getTime(a);
  });
};

export interface AlertCounts {
  disaster: number;
  high: number;
  average: number;
  warning: number;
  acknowledged: number;
  total: number;
}

export interface UseAlertsReturn {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  counts: AlertCounts;
  isConnected: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export const useAlerts = (): UseAlertsReturn => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const alertsMapRef = useRef<Map<number, Alert>>(new Map());

  const counts: AlertCounts = {
    disaster: alerts.filter((a) => a.severity === "disaster").length,
    high: alerts.filter((a) => a.severity === "high").length,
    average: alerts.filter((a) => a.severity === "average").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    acknowledged: alerts.filter((a) => a.acknowledged).length,
    total: alerts.length,
  };

  const { authenticatedFetch } = useAuthenticatedFetch();

  const fetchAlerts = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await authenticatedFetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await safeParseResponse<WebhookAlert[]>(response, WEBHOOK_URL);
      if (!result.ok) {
        throw new Error(result.userMessage);
      }

      // Empty response → treat as no alerts
      if (!result.data) {
        setAlerts([]);
        setIsConnected(true);
        setLastUpdated(new Date());
        setError(null);
        if (!silent) setLoading(false);
        return;
      }

      const webhookAlerts: WebhookAlert[] = Array.isArray(result.data) ? result.data : [result.data];

      // Transform & filter out obviously invalid entries
      const transformed = webhookAlerts
        .filter((w) => w.first_ai_response && w.last_seen_at)
        .map(transformWebhookAlert);

      // Merge strategy – only update changed items (prevents UI flicker)
      const newMap = new Map<number, Alert>();
      transformed.forEach((alert) => {
        const existing = alertsMapRef.current.get(alert.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(alert)) {
          newMap.set(alert.id, alert);
        } else {
          newMap.set(alert.id, existing);
        }
      });

      alertsMapRef.current = newMap;
      const sorted = sortAlertsDescending(Array.from(newMap.values()));

      setAlerts(sorted);
      setIsConnected(true);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const safe = err instanceof Error ? err.message : "We couldn't load alerts. Please try again.";
      console.error("[useAlerts] Fetch error:", err);
      if (!silent) setError(safe);
      setIsConnected(false);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [authenticatedFetch]);

  // Initial fetch
  useEffect(() => {
    fetchAlerts(false);
  }, [fetchAlerts]);

  // Auto-refresh
  useEffect(() => {
    intervalRef.current = setInterval(() => fetchAlerts(true), REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAlerts]);

  const refresh = useCallback(async () => {
    await fetchAlerts(false);
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    counts,
    isConnected,
    lastUpdated,
    refresh,
  };
};

export default useAlerts;