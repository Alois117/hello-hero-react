/**
 * Global Infrastructure Metrics Hook
 * Fetches aggregated metrics across ALL organizations for Super Admin Global Overview.
 * Calls each webhook endpoint once (unscoped) and groups results by client_id.
 * Avoids N+1 by using single requests per metric type.
 */
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { safeParseResponse } from "@/lib/safeFetch";
import {
  WEBHOOK_ALERTS_URL,
  WEBHOOK_ZABBIX_HOSTS_URL,
  WEBHOOK_REPORTS_URL,
  WEBHOOK_AI_INSIGHTS_URL,
  WEBHOOK_BACKUP_REPLICATION_URL,
} from "@/config/env";
import type { Organization } from "./types";

// ── Types ────────────────────────────────────────────────────────────────────

export interface GlobalMetricsSummary {
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  totalHosts: number;
  enabledHosts: number;
  disabledHosts: number;
  totalReports: number;
  dailyReports: number;
  weeklyReports: number;
  monthlyReports: number;
  totalInsights: number;
  predictions: number;
  anomalies: number;
  totalVeeamJobs: number;
  veeamSuccess: number;
  veeamFailed: number;
}

export interface OrgMetricsRow {
  orgId: string;
  orgName: string;
  clientId: number;
  status: string;
  alerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  hosts: number;
  enabledHosts: number;
  reports: number;
  insights: number;
  veeamJobs: number;
  veeamSuccess: number;
  veeamFailed: number;
}

export type TimeRange = "24h" | "7d" | "30d" | "custom";

export interface GlobalFilters {
  timeRange: TimeRange;
  searchQuery: string;
  selectedOrgIds: string[];
}

interface UseGlobalInfrastructureMetricsOptions {
  organizations: Organization[];
  enabled?: boolean;
}

interface UseGlobalInfrastructureMetricsReturn {
  summary: GlobalMetricsSummary;
  orgRows: OrgMetricsRow[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  filters: GlobalFilters;
  setSearchQuery: (q: string) => void;
  setTimeRange: (t: TimeRange) => void;
  setSelectedOrgIds: (ids: string[]) => void;
  clearFilters: () => void;
  filteredOrgRows: OrgMetricsRow[];
  refresh: () => Promise<void>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const toNumber = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getClientId = (obj: Record<string, unknown>): number => {
  return toNumber(obj?.client_id ?? obj?.clientId ?? 0);
};

const normSev = (v: unknown): string => String(v ?? "").toLowerCase().trim();

const REFRESH_INTERVAL = 60_000;

const emptySummary: GlobalMetricsSummary = {
  totalAlerts: 0, activeAlerts: 0, criticalAlerts: 0,
  totalHosts: 0, enabledHosts: 0, disabledHosts: 0,
  totalReports: 0, dailyReports: 0, weeklyReports: 0, monthlyReports: 0,
  totalInsights: 0, predictions: 0, anomalies: 0,
  totalVeeamJobs: 0, veeamSuccess: 0, veeamFailed: 0,
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useGlobalInfrastructureMetrics = (
  options: UseGlobalInfrastructureMetricsOptions
): UseGlobalInfrastructureMetricsReturn => {
  const { organizations, enabled = true } = options;
  const { authenticatedFetch } = useAuthenticatedFetch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Raw per-org data keyed by clientId
  const [orgMetricsMap, setOrgMetricsMap] = useState<Map<number, {
    alerts: number; activeAlerts: number; criticalAlerts: number;
    hosts: number; enabledHosts: number;
    reports: number;
    insights: number;
    veeamJobs: number; veeamSuccess: number; veeamFailed: number;
  }>>(new Map());

  // Filters
  const [filters, setFilters] = useState<GlobalFilters>({
    timeRange: "7d",
    searchQuery: "",
    selectedOrgIds: [],
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Build clientId→org lookup
  const clientIdToOrg = useMemo(() => {
    const map = new Map<number, Organization>();
    organizations.forEach((o) => {
      if (o.clientId > 0) map.set(o.clientId, o);
    });
    return map;
  }, [organizations]);

  const orgsWithClientId = useMemo(
    () => organizations.filter((o) => o.clientId > 0),
    [organizations]
  );

  const fetchAll = useCallback(
    async (silent = false) => {
      if (!enabled || orgsWithClientId.length === 0) return;

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      if (!silent) setLoading(true);

      try {
        const post = (url: string) =>
          authenticatedFetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
            signal: abortRef.current!.signal,
          }).catch(() => null);

        const [alertsRes, hostsRes, reportsRes, insightsRes, veeamRes] =
          await Promise.all([
            post(WEBHOOK_ALERTS_URL),
            post(WEBHOOK_ZABBIX_HOSTS_URL),
            post(WEBHOOK_REPORTS_URL),
            post(WEBHOOK_AI_INSIGHTS_URL),
            post(WEBHOOK_BACKUP_REPLICATION_URL),
          ]);

        const newMap = new Map<number, {
          alerts: number; activeAlerts: number; criticalAlerts: number;
          hosts: number; enabledHosts: number;
          reports: number; insights: number;
          veeamJobs: number; veeamSuccess: number; veeamFailed: number;
        }>();

        // Initialize entries for all known orgs
        orgsWithClientId.forEach((o) => {
          newMap.set(o.clientId, {
            alerts: 0, activeAlerts: 0, criticalAlerts: 0,
            hosts: 0, enabledHosts: 0,
            reports: 0, insights: 0,
            veeamJobs: 0, veeamSuccess: 0, veeamFailed: 0,
          });
        });

        const ensureEntry = (cid: number) => {
          if (!newMap.has(cid) && clientIdToOrg.has(cid)) {
            newMap.set(cid, {
              alerts: 0, activeAlerts: 0, criticalAlerts: 0,
              hosts: 0, enabledHosts: 0,
              reports: 0, insights: 0,
              veeamJobs: 0, veeamSuccess: 0, veeamFailed: 0,
            });
          }
        };

        // Alerts
        if (alertsRes?.ok) {
          const parsed = await safeParseResponse<any[]>(alertsRes);
          if (parsed.ok && Array.isArray(parsed.data)) {
            parsed.data.forEach((a: any) => {
              const cid = getClientId(a);
              if (cid <= 0) return;
              ensureEntry(cid);
              const entry = newMap.get(cid);
              if (!entry) return;
              entry.alerts++;
              const isActive = !a.acknowledged && a.status !== "resolved";
              if (isActive) entry.activeAlerts++;
              const sev = normSev(a.severity);
              if (sev === "critical" || sev === "disaster") entry.criticalAlerts++;
            });
          }
        }

        // Hosts
        if (hostsRes?.ok) {
          const parsed = await safeParseResponse<any[]>(hostsRes);
          if (parsed.ok && Array.isArray(parsed.data)) {
            parsed.data.forEach((h: any) => {
              const cid = getClientId(h);
              if (cid <= 0) return;
              ensureEntry(cid);
              const entry = newMap.get(cid);
              if (!entry) return;
              entry.hosts++;
              if (h.status === 0) entry.enabledHosts++;
            });
          }
        }

        // Reports
        if (reportsRes?.ok) {
          const parsed = await safeParseResponse<any[]>(reportsRes);
          if (parsed.ok && Array.isArray(parsed.data)) {
            parsed.data.forEach((r: any) => {
              const cid = getClientId(r);
              if (cid <= 0) return;
              ensureEntry(cid);
              const entry = newMap.get(cid);
              if (entry) entry.reports++;
            });
          }
        }

        // Insights
        if (insightsRes?.ok) {
          const parsed = await safeParseResponse<any[]>(insightsRes);
          if (parsed.ok && Array.isArray(parsed.data)) {
            parsed.data.forEach((i: any) => {
              const cid = getClientId(i);
              if (cid <= 0) return;
              ensureEntry(cid);
              const entry = newMap.get(cid);
              if (entry) entry.insights++;
            });
          }
        }

        // Veeam - response format [mainObj, metaObj]
        if (veeamRes?.ok) {
          const parsed = await safeParseResponse<any[]>(veeamRes);
          if (parsed.ok && Array.isArray(parsed.data)) {
            const mainObj = (parsed.data[0] ?? {}) as Record<string, any>;
            const matched = Array.isArray(mainObj.matched) ? mainObj.matched : [];
            // Veeam data is typically already org-scoped in response, aggregate what we can
            matched.forEach((m: any) => {
              const cid = getClientId(m);
              if (cid <= 0) return;
              ensureEntry(cid);
              const entry = newMap.get(cid);
              if (!entry) return;
              entry.veeamJobs += Array.isArray(m.jobs) ? m.jobs.length : 0;
              const status = String(m?.protectionSummary?.overallStatus ?? "").toLowerCase();
              if (status.includes("success")) entry.veeamSuccess++;
              if (status.includes("fail") || status.includes("error")) entry.veeamFailed++;
            });
          }
        }

        setOrgMetricsMap(newMap);
        setError(null);
        setLastUpdated(new Date());
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Failed to fetch global metrics");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [enabled, orgsWithClientId, clientIdToOrg, authenticatedFetch]
  );

  // Initial fetch
  useEffect(() => {
    if (enabled && orgsWithClientId.length > 0) {
      fetchAll(false);
    }
  }, [enabled, fetchAll, orgsWithClientId.length]);

  // Auto-refresh
  useEffect(() => {
    if (!enabled) return;
    intervalRef.current = setInterval(() => fetchAll(true), REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [enabled, fetchAll]);

  // Compute summary and rows
  const orgRows = useMemo<OrgMetricsRow[]>(() => {
    const rows: OrgMetricsRow[] = [];
    orgMetricsMap.forEach((metrics, clientId) => {
      const org = clientIdToOrg.get(clientId);
      if (!org) return;
      rows.push({
        orgId: org.id,
        orgName: org.name,
        clientId: org.clientId,
        status: org.status,
        alerts: metrics.alerts,
        activeAlerts: metrics.activeAlerts,
        criticalAlerts: metrics.criticalAlerts,
        hosts: metrics.hosts,
        enabledHosts: metrics.enabledHosts,
        reports: metrics.reports,
        insights: metrics.insights,
        veeamJobs: metrics.veeamJobs,
        veeamSuccess: metrics.veeamSuccess,
        veeamFailed: metrics.veeamFailed,
      });
    });
    // Include orgs without clientId as zero-value rows
    organizations.forEach((o) => {
      if (o.clientId <= 0 && !rows.find((r) => r.orgId === o.id)) {
        rows.push({
          orgId: o.id, orgName: o.name, clientId: 0, status: o.status,
          alerts: 0, activeAlerts: 0, criticalAlerts: 0,
          hosts: 0, enabledHosts: 0, reports: 0, insights: 0,
          veeamJobs: 0, veeamSuccess: 0, veeamFailed: 0,
        });
      }
    });
    return rows.sort((a, b) => a.orgName.localeCompare(b.orgName));
  }, [orgMetricsMap, clientIdToOrg, organizations]);

  const summary = useMemo<GlobalMetricsSummary>(() => {
    const s = { ...emptySummary };
    orgRows.forEach((r) => {
      s.totalAlerts += r.alerts;
      s.activeAlerts += r.activeAlerts;
      s.criticalAlerts += r.criticalAlerts;
      s.totalHosts += r.hosts;
      s.enabledHosts += r.enabledHosts;
      s.disabledHosts += r.hosts - r.enabledHosts;
      s.totalReports += r.reports;
      s.totalInsights += r.insights;
      s.totalVeeamJobs += r.veeamJobs;
      s.veeamSuccess += r.veeamSuccess;
      s.veeamFailed += r.veeamFailed;
    });
    return s;
  }, [orgRows]);

  // Filtered rows
  const filteredOrgRows = useMemo(() => {
    let rows = orgRows;
    const q = filters.searchQuery.toLowerCase().trim();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.orgName.toLowerCase().includes(q) ||
          r.orgId.toLowerCase().includes(q)
      );
    }
    if (filters.selectedOrgIds.length > 0) {
      rows = rows.filter((r) => filters.selectedOrgIds.includes(r.orgId));
    }
    return rows;
  }, [orgRows, filters]);

  // Filter setters
  const setSearchQuery = useCallback((q: string) => {
    setFilters((p) => ({ ...p, searchQuery: q }));
  }, []);
  const setTimeRange = useCallback((t: TimeRange) => {
    setFilters((p) => ({ ...p, timeRange: t }));
  }, []);
  const setSelectedOrgIds = useCallback((ids: string[]) => {
    setFilters((p) => ({ ...p, selectedOrgIds: ids }));
  }, []);
  const clearFilters = useCallback(() => {
    setFilters({ timeRange: "7d", searchQuery: "", selectedOrgIds: [] });
  }, []);

  const refresh = useCallback(async () => {
    await fetchAll(false);
  }, [fetchAll]);

  return {
    summary, orgRows, loading, error, lastUpdated,
    filters, setSearchQuery, setTimeRange, setSelectedOrgIds, clearFilters,
    filteredOrgRows, refresh,
  };
};
