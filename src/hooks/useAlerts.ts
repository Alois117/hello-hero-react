import { useState, useEffect, useCallback, useRef } from "react";
import { Alert } from "@/components/alerts/AlertsTable";
import { AlertSeverity } from "@/components/alerts/SeverityBadge";

const WEBHOOK_URL = "http://10.100.12.54:5678/webhook/ai/insights";
// const WEBHOOK_URL = "http://localhost:5678/webhook/ai/insights";
const REFRESH_INTERVAL = 5000; // 5 seconds

export interface WebhookAlert {
  zbx_event_id: string;
  raw: {
    name: string;
    clock: string;
    eventid: string;
    r_clock: string;
    objectid: string;
    severity: string;
  };
  created_at: string;
  dedupe_key: string;
  first_seen: string;
  last_seen: string;
  first_event_id: string;
  latest_event_id: string;
  last_sent_at: string;
  times_sent: number;
  first_ai_response: string;
  reminder_interval_hours?: number;
}

// Map Zabbix severity (0-5) to our AlertSeverity
const mapSeverity = (zbxSeverity: string): AlertSeverity => {
  const level = parseInt(zbxSeverity, 10);
  switch (level) {
    case 5: return "disaster";
    case 4: return "high";
    case 3: return "average";
    case 2: return "warning";
    case 1: return "info";
    case 0: return "info";
    default: return "info";
  }
};

// Parse duration from timestamps (uses lastSeen for reoccurring alerts)
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

// Extract category from problem name
const extractCategory = (name: string): string => {
  if (name.toLowerCase().includes("vmware")) return "VMware";
  if (name.toLowerCase().includes("disk")) return "Disk";
  if (name.toLowerCase().includes("cpu")) return "CPU";
  if (name.toLowerCase().includes("memory")) return "Memory";
  if (name.toLowerCase().includes("network")) return "Network";
  if (name.toLowerCase().includes("database") || name.toLowerCase().includes("db")) return "Database";
  if (name.toLowerCase().includes("service")) return "Service";
  return "System";
};

// Extract host from AI response or use default
const extractHost = (aiResponse: string, dedupeKey: string): string => {
  // Try to extract host from AI response
  const hostMatch = aiResponse.match(/\*\*Host:\*\*\s*([^\n.]+)/i);
  if (hostMatch) return hostMatch[1].trim();
  
  // Fallback: use dedupe_key prefix
  const parts = dedupeKey.split("_");
  return parts[0] || "unknown-host";
};

// Transform webhook data to our Alert format
const transformWebhookAlert = (webhook: WebhookAlert): Alert => {
  const severity = mapSeverity(webhook.raw.severity);
  const acknowledged = webhook.raw.r_clock !== "0";
  
  return {
    id: parseInt(webhook.zbx_event_id, 10),
    severity,
    host: extractHost(webhook.first_ai_response, webhook.dedupe_key),
    category: extractCategory(webhook.raw.name),
    problem: webhook.raw.name,
    duration: calculateDuration(webhook.last_seen),
    scope: "Production",
    acknowledged,
    status: acknowledged ? "acknowledged" : "active",
    timestamp: new Date(webhook.created_at).toLocaleString(),
    // Extended fields for detail drawer
    aiInsights: webhook.first_ai_response,
    timesSent: webhook.times_sent,
    firstSeen: webhook.first_seen,
    lastSeen: webhook.last_seen,
    dedupeKey: webhook.dedupe_key,
    rawMetadata: webhook.raw,
  };
};

// Sort alerts by timestamp descending (newest first)
const sortAlertsDescending = (alerts: Alert[]): Alert[] => {
  return [...alerts].sort((a, b) => {
    // Use lastSeen, fallback to firstSeen, then timestamp
    const getTime = (alert: Alert): number => {
      if (alert.lastSeen) {
        const date = new Date(alert.lastSeen);
        if (!isNaN(date.getTime())) return date.getTime();
      }
      if (alert.firstSeen) {
        const date = new Date(alert.firstSeen);
        if (!isNaN(date.getTime())) return date.getTime();
      }
      // Fallback to raw clock (epoch seconds)
      if (alert.rawMetadata?.clock) {
        const epoch = parseInt(alert.rawMetadata.clock, 10);
        if (!isNaN(epoch)) return epoch * 1000;
      }
      return 0; // Preserve order if no valid timestamp
    };
    
    return getTime(b) - getTime(a); // Descending order
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

  // Calculate counts from alerts
  const counts: AlertCounts = {
    disaster: alerts.filter(a => a.severity === "disaster").length,
    high: alerts.filter(a => a.severity === "high").length,
    average: alerts.filter(a => a.severity === "average").length,
    warning: alerts.filter(a => a.severity === "warning").length,
    acknowledged: alerts.filter(a => a.acknowledged).length,
    total: alerts.length,
  };

  // Fetch alerts from webhook
  const fetchAlerts = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const response = await fetch(WEBHOOK_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle both array and single object responses
      const webhookAlerts: WebhookAlert[] = Array.isArray(data) ? data : [data];
      
      // Transform to our format
      const transformedAlerts = webhookAlerts.map(transformWebhookAlert);
      
      // Smart merge: only update changed alerts to avoid flicker
      const newAlertsMap = new Map<number, Alert>();
      transformedAlerts.forEach(alert => {
        const existing = alertsMapRef.current.get(alert.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(alert)) {
          newAlertsMap.set(alert.id, alert);
        } else {
          newAlertsMap.set(alert.id, existing);
        }
      });
      
      alertsMapRef.current = newAlertsMap;
      // Sort by timestamp descending (newest first) before setting state
      const sortedAlerts = sortAlertsDescending(Array.from(newAlertsMap.values()));
      setAlerts(sortedAlerts);
      setIsConnected(true);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch alerts");
      setIsConnected(false);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAlerts(false);
  }, [fetchAlerts]);

  // Set up auto-refresh every 5 seconds (silent refresh)
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchAlerts(true);
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAlerts]);

  // WebSocket simulation layer - ready for future upgrade
  useEffect(() => {
    // When endpoint supports WebSocket, implement here:
    // const ws = new WebSocket('ws://10.100.12.54:5678/ws/alerts');
    // ws.onmessage = (event) => {
    //   const newAlert = JSON.parse(event.data);
    //   // Smart merge into alerts
    // };
    
    // For now, polling simulates real-time behavior
    console.log("[WebSocket] Simulated connection active - using polling fallback");
    
    return () => {
      console.log("[WebSocket] Simulated connection closed");
    };
  }, []);

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
