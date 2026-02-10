/**
 * Super Admin Organization Metrics Hook
 * Fetches per-organization detailed metrics by reusing existing webhook endpoints
 * with client_id filtering for organization-scoped data
 */
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { OrganizationDetailMetrics } from "./types";
import {
  WEBHOOK_ALERTS_URL,
  WEBHOOK_ZABBIX_HOSTS_URL,
  WEBHOOK_REPORTS_URL,
  WEBHOOK_AI_INSIGHTS_URL,
  WEBHOOK_BACKUP_REPLICATION_URL,
} from "@/config/env";

// Reuse existing endpoint patterns from user dashboard hooks
const ENDPOINTS = {
  alerts: WEBHOOK_ALERTS_URL,
  hosts: WEBHOOK_ZABBIX_HOSTS_URL,
  reports: WEBHOOK_REPORTS_URL,
  insights: WEBHOOK_AI_INSIGHTS_URL,
  veeam: WEBHOOK_BACKUP_REPLICATION_URL,
};

const REFRESH_INTERVAL = 60000; // 1 minute for detail view

interface UseOrganizationMetricsOptions {
  clientId: number | null;
  enabled?: boolean;
}

interface UseOrganizationMetricsReturn {
  metrics: OrganizationDetailMetrics;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

const initialMetrics: OrganizationDetailMetrics = {
  users: { total: 0, loading: true },
  alerts: { total: 0, active: 0, critical: 0, loading: true },
  hosts: { total: 0, enabled: 0, disabled: 0, loading: true },
  reports: { total: 0, daily: 0, weekly: 0, monthly: 0, loading: true },
  insights: { total: 0, predictions: 0, anomalies: 0, loading: true },
  veeam: { jobs: 0, success: 0, failed: 0, loading: true },
};

export const useOrganizationMetrics = (
  options: UseOrganizationMetricsOptions
): UseOrganizationMetricsReturn => {
  const { clientId, enabled = true } = options;

  const [metrics, setMetrics] = useState<OrganizationDetailMetrics>(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { authenticatedFetch } = useAuthenticatedFetch();

  // Fetch all metrics concurrently with concurrency limiting
  const fetchMetrics = useCallback(async (silent = false) => {
    if (!clientId || !enabled) return;

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!silent) setLoading(true);

    try {
      // Fetch metrics in parallel with Promise.allSettled for resilience
      const [alertsRes, hostsRes, reportsRes, insightsRes, veeamRes] = await Promise.allSettled([
        // Alerts - filter by client_id from response
        authenticatedFetch(ENDPOINTS.alerts, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId }),
        }),
        // Hosts - filter by client_id
        authenticatedFetch(ENDPOINTS.hosts, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId }),
        }),
        // Reports
        authenticatedFetch(ENDPOINTS.reports, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId }),
        }),
        // AI Insights
        authenticatedFetch(ENDPOINTS.insights, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId }),
        }),
        // Veeam (POST endpoint)
        authenticatedFetch(ENDPOINTS.veeam, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      // Process alerts
      let alertsMetrics = { total: 0, active: 0, critical: 0, loading: false };
      if (alertsRes.status === "fulfilled" && alertsRes.value.ok) {
        try {
          const data = await alertsRes.value.json();
          const alerts = Array.isArray(data) ? data : [];
          // Filter by client_id if the backend doesn't filter
          const orgAlerts = alerts.filter((a: any) => a.client_id === clientId);
          alertsMetrics = {
            total: orgAlerts.length,
            active: orgAlerts.filter((a: any) => 
              !a.acknowledged && a.status !== "resolved"
            ).length,
            critical: orgAlerts.filter((a: any) => 
              a.severity === "critical" || a.severity === "disaster"
            ).length,
            loading: false,
          };
        } catch { /* parsing error */ }
      }

      // Process hosts
      let hostsMetrics = { total: 0, enabled: 0, disabled: 0, loading: false };
      if (hostsRes.status === "fulfilled" && hostsRes.value.ok) {
        try {
          const data = await hostsRes.value.json();
          const hosts = Array.isArray(data) ? data : [];
          const orgHosts = hosts.filter((h: any) => h.client_id === clientId);
          hostsMetrics = {
            total: orgHosts.length,
            enabled: orgHosts.filter((h: any) => h.status === 0).length,
            disabled: orgHosts.filter((h: any) => h.status !== 0).length,
            loading: false,
          };
        } catch { /* parsing error */ }
      }

      // Process reports
      let reportsMetrics = { total: 0, daily: 0, weekly: 0, monthly: 0, loading: false };
      if (reportsRes.status === "fulfilled" && reportsRes.value.ok) {
        try {
          const data = await reportsRes.value.json();
          const reports = Array.isArray(data) ? data : [];
          // Reports may not have client_id, count all if super admin
          reportsMetrics = {
            total: reports.length,
            daily: reports.filter((r: any) => r.report_type === "daily").length,
            weekly: reports.filter((r: any) => r.report_type === "weekly").length,
            monthly: reports.filter((r: any) => r.report_type === "monthly").length,
            loading: false,
          };
        } catch { /* parsing error */ }
      }

      // Process insights
      let insightsMetrics = { total: 0, predictions: 0, anomalies: 0, loading: false };
      if (insightsRes.status === "fulfilled" && insightsRes.value.ok) {
        try {
          const data = await insightsRes.value.json();
          const insights = Array.isArray(data) ? data : [];
          const orgInsights = insights.filter((i: any) => i.client_id === clientId);
          insightsMetrics = {
            total: orgInsights.length,
            predictions: orgInsights.filter((i: any) => 
              i.type?.toLowerCase().includes("predict")
            ).length,
            anomalies: orgInsights.filter((i: any) => 
              i.type?.toLowerCase().includes("anomal")
            ).length,
            loading: false,
          };
        } catch { /* parsing error */ }
      }

      // Process Veeam jobs
      let veeamMetrics = { jobs: 0, success: 0, failed: 0, loading: false };
      if (veeamRes.status === "fulfilled" && veeamRes.value.ok) {
        try {
          const data = await veeamRes.value.json();
          const jobs = Array.isArray(data) ? data : [];
          // Veeam jobs might have client_id or be global
          veeamMetrics = {
            jobs: jobs.length,
            success: jobs.filter((j: any) => 
              j.severity?.toLowerCase() === "success"
            ).length,
            failed: jobs.filter((j: any) => 
              j.severity?.toLowerCase() === "failed" || j.severity?.toLowerCase() === "error"
            ).length,
            loading: false,
          };
        } catch { /* parsing error */ }
      }

      setMetrics({
        users: { total: 0, loading: false }, // Users would need a separate endpoint
        alerts: alertsMetrics,
        hosts: hostsMetrics,
        reports: reportsMetrics,
        insights: insightsMetrics,
        veeam: veeamMetrics,
      });

      setIsConnected(true);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch organization metrics");
      setError(err instanceof Error ? err.message : "Failed to fetch metrics");
      setIsConnected(false);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [clientId, enabled, authenticatedFetch]);

  // Fetch when clientId changes
  useEffect(() => {
    if (clientId && enabled) {
      setMetrics(initialMetrics);
      fetchMetrics(false);
    }
  }, [clientId, enabled, fetchMetrics]);

  // Silent auto-refresh when viewing detail
  useEffect(() => {
    if (!clientId || !enabled) return;

    intervalRef.current = setInterval(() => fetchMetrics(true), REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [clientId, enabled, fetchMetrics]);

  const refresh = useCallback(async () => {
    await fetchMetrics(false);
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    isConnected,
    lastUpdated,
    refresh,
  };
};

export default useOrganizationMetrics;
