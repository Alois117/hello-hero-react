/**
 * Super Admin Organization Metrics Hook
 * Fetches per-organization detailed metrics.
 * Uses orgId (Keycloak UUID) as primary identifier.
 * clientId is optional — used only for webhook data filtering.
 * Member count is fetched from Keycloak members API.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { useKeycloakMembers } from "@/hooks/keycloak";
import { OrganizationDetailMetrics } from "./types";
import {
  WEBHOOK_ALERTS_URL,
  WEBHOOK_ZABBIX_HOSTS_URL,
  WEBHOOK_REPORTS_URL,
  WEBHOOK_AI_INSIGHTS_URL,
  WEBHOOK_BACKUP_REPLICATION_URL,
} from "@/config/env";
import { safeParseResponse } from "@/lib/safeFetch";

const ENDPOINTS = {
  alerts: WEBHOOK_ALERTS_URL,
  hosts: WEBHOOK_ZABBIX_HOSTS_URL,
  reports: WEBHOOK_REPORTS_URL,
  insights: WEBHOOK_AI_INSIGHTS_URL,
  veeam: WEBHOOK_BACKUP_REPLICATION_URL,
};

const REFRESH_INTERVAL = 60000;

interface UseOrganizationMetricsOptions {
  /** Keycloak organization UUID — required */
  orgId: string | null;
  /** Webhook correlation ID — optional, used for filtering webhook data */
  clientId?: number | null;
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

// ─────────────────────────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────────────────────────

const toNumberOrNull = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const normalizeClientId = (clientId?: number | null): number | null => {
  const n = toNumberOrNull(clientId);
  return n != null && n > 0 ? n : null;
};

const matchesClientId = (payloadClientId: any, clientId: number | null) => {
  if (clientId == null) return true;
  const n = toNumberOrNull(payloadClientId);
  return n != null && n === clientId;
};

export const useOrganizationMetrics = (
  options: UseOrganizationMetricsOptions
): UseOrganizationMetricsReturn => {
  const { orgId, enabled = true } = options;
  const clientId = normalizeClientId(options.clientId);
  const hasClientId = clientId != null;

  const [metrics, setMetrics] =
    useState<OrganizationDetailMetrics>(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { authenticatedFetch } = useAuthenticatedFetch();

  // Fetch members count from Keycloak
  const { members: keycloakMembers, loading: membersLoading } =
    useKeycloakMembers(enabled && orgId ? orgId : null);

  const fetchMetrics = useCallback(
    async (silent = false) => {
      if (!orgId || !enabled) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (!silent) setLoading(true);

      // If no clientId, webhook metrics won't be filterable — set them to 0 with loading=false
      if (!hasClientId) {
        setMetrics({
          users: { total: keycloakMembers.length, loading: membersLoading },
          alerts: { total: 0, active: 0, critical: 0, loading: false },
          hosts: { total: 0, enabled: 0, disabled: 0, loading: false },
          reports: { total: 0, daily: 0, weekly: 0, monthly: 0, loading: false },
          insights: { total: 0, predictions: 0, anomalies: 0, loading: false },
          veeam: { jobs: 0, success: 0, failed: 0, loading: false },
        });
        setIsConnected(true);
        setLastUpdated(new Date());
        setError(null);
        if (!silent) setLoading(false);
        return;
      }

      try {
        const commonPost = {
          method: "POST" as const,
          headers: { "Content-Type": "application/json" },
          // NOTE: signal is available if your authenticatedFetch forwards it; harmless otherwise
          signal: abortControllerRef.current.signal,
        };

        const fetchPromises = [
          authenticatedFetch(ENDPOINTS.alerts, {
            ...commonPost,
            body: JSON.stringify({ client_id: clientId }),
          }).catch(() => null),

          authenticatedFetch(ENDPOINTS.hosts, {
            ...commonPost,
            body: JSON.stringify({ client_id: clientId }),
          }).catch(() => null),

          authenticatedFetch(ENDPOINTS.reports, {
            ...commonPost,
            body: JSON.stringify({ client_id: clientId }),
          }).catch(() => null),

          authenticatedFetch(ENDPOINTS.insights, {
            ...commonPost,
            body: JSON.stringify({ client_id: clientId }),
          }).catch(() => null),

          // ✅ FIX 1: scope the Veeam webhook request by client_id
          authenticatedFetch(ENDPOINTS.veeam, {
            ...commonPost,
            body: JSON.stringify({ client_id: clientId }),
          }).catch(() => null),
        ];

        const results = await Promise.all(fetchPromises);

        // ── Alerts ────────────────────────────────────────────────────────────
        let alertsMetrics = { total: 0, active: 0, critical: 0, loading: false };
        if (results[0] && results[0].ok) {
          const parsed = await safeParseResponse<any[]>(results[0]);
          if (parsed.ok && Array.isArray(parsed.data)) {
            const orgAlerts = parsed.data.filter((a: any) =>
              matchesClientId(a?.client_id ?? a?.clientId, clientId)
            );
            alertsMetrics = {
              total: orgAlerts.length,
              active: orgAlerts.filter(
                (a: any) => !a.acknowledged && a.status !== "resolved"
              ).length,
              critical: orgAlerts.filter((a: any) => {
                const sev = String(a?.severity ?? "").toLowerCase();
                return sev === "critical" || sev === "disaster";
              }).length,
              loading: false,
            };
          }
        }

        // ── Hosts ─────────────────────────────────────────────────────────────
        let hostsMetrics = { total: 0, enabled: 0, disabled: 0, loading: false };
        if (results[1] && results[1].ok) {
          const parsed = await safeParseResponse<any[]>(results[1]);
          if (parsed.ok && Array.isArray(parsed.data)) {
            const orgHosts = parsed.data.filter((h: any) =>
              matchesClientId(h?.client_id ?? h?.clientId, clientId)
            );
            hostsMetrics = {
              total: orgHosts.length,
              enabled: orgHosts.filter((h: any) => h.status === 0).length,
              disabled: orgHosts.filter((h: any) => h.status !== 0).length,
              loading: false,
            };
          }
        }

        // ── Reports ───────────────────────────────────────────────────────────
        let reportsMetrics = {
          total: 0,
          daily: 0,
          weekly: 0,
          monthly: 0,
          loading: false,
        };
        if (results[2] && results[2].ok) {
          const parsed = await safeParseResponse<any[]>(results[2]);
          if (parsed.ok && Array.isArray(parsed.data)) {
            const reports = parsed.data;

            // If payload contains client_id anywhere, filter by it; otherwise assume backend already scoped.
            const hasAnyClientId = reports.some(
              (r: any) => r?.client_id != null || r?.clientId != null
            );

            const orgReports = hasAnyClientId
              ? reports.filter((r: any) =>
                  matchesClientId(r?.client_id ?? r?.clientId, clientId)
                )
              : reports;

            const typeOf = (r: any) =>
              String(r?.report_type ?? r?.type ?? "").toLowerCase();

            reportsMetrics = {
              total: orgReports.length,
              daily: orgReports.filter((r: any) => typeOf(r) === "daily").length,
              weekly: orgReports.filter((r: any) => typeOf(r) === "weekly").length,
              monthly: orgReports.filter((r: any) => typeOf(r) === "monthly").length,
              loading: false,
            };
          }
        }

        // ── Insights ──────────────────────────────────────────────────────────
        let insightsMetrics = {
          total: 0,
          predictions: 0,
          anomalies: 0,
          loading: false,
        };
        if (results[3] && results[3].ok) {
          const parsed = await safeParseResponse<any[]>(results[3]);
          if (parsed.ok && Array.isArray(parsed.data)) {
            const orgInsights = parsed.data.filter((i: any) =>
              matchesClientId(i?.client_id ?? i?.clientId, clientId)
            );
            const typeOf = (i: any) =>
              String(
                i?.type ?? i?.insight_type ?? i?.category ?? ""
              ).toLowerCase();

            insightsMetrics = {
              total: orgInsights.length,
              predictions: orgInsights.filter((i: any) =>
                typeOf(i).includes("predict")
              ).length,
              anomalies: orgInsights.filter((i: any) =>
                typeOf(i).includes("anomal")
              ).length,
              loading: false,
            };
          }
        }

        // ── Veeam ─────────────────────────────────────────────────────────────
        // Response format: [mainObj, metaObj] — same as User Dashboard
        let veeamMetrics = { jobs: 0, success: 0, failed: 0, loading: false };
        if (results[4] && results[4].ok) {
          const parsed = await safeParseResponse<any[]>(results[4]);
          if (parsed.ok && Array.isArray(parsed.data)) {
            const mainObj = (parsed.data[0] ?? {}) as Record<string, any>;
            const matched = Array.isArray(mainObj.matched) ? mainObj.matched : [];
            const brSummary = mainObj.summary;

            // Use summary if available, otherwise compute from matched
            const totalJobs = brSummary?.overview?.totalJobs
              ?? matched.reduce((acc: number, m: any) => acc + (m.jobs?.length ?? 0), 0);

            const statusOf = (m: any) =>
              String(m?.protectionSummary?.overallStatus ?? "").toLowerCase();

            veeamMetrics = {
              jobs: totalJobs,
              success: brSummary?.backupHealth?.successfulJobs
                ?? matched.filter((m: any) => statusOf(m).includes("success")).length,
              failed: brSummary?.backupHealth?.failedJobs
                ?? matched.filter((m: any) => {
                  const s = statusOf(m);
                  return s.includes("fail") || s.includes("error");
                }).length,
              loading: false,
            };
          }
        }

        setMetrics({
          users: { total: keycloakMembers.length, loading: membersLoading },
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
        console.error("[useOrganizationMetrics] Failed to fetch metrics:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch metrics");
        setIsConnected(false);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [
      orgId,
      enabled,
      hasClientId,
      clientId,
      authenticatedFetch,
      keycloakMembers,
      membersLoading,
    ]
  );

  useEffect(() => {
    if (orgId && enabled) {
      setMetrics(initialMetrics);
      fetchMetrics(false);
    }
  }, [orgId, enabled, fetchMetrics]);

  useEffect(() => {
    if (!orgId || !enabled) return;
    intervalRef.current = setInterval(() => fetchMetrics(true), REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [orgId, enabled, fetchMetrics]);

  // Update user count when members load
  useEffect(() => {
    setMetrics((prev) => ({
      ...prev,
      users: { total: keycloakMembers.length, loading: membersLoading },
    }));
  }, [keycloakMembers, membersLoading]);

  const refresh = useCallback(async () => {
    await fetchMetrics(false);
  }, [fetchMetrics]);

  return { metrics, loading, error, isConnected, lastUpdated, refresh };
};

export default useOrganizationMetrics;
