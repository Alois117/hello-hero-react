/**
 * Super Admin Organization Veeam Metrics Hook
 * Fetches combined Veeam data from 3 endpoints:
 * - WEBHOOK_BACKUP_REPLICATION_URL (Backup & Replication)
 * - WEBHOOK_VEEAM_VMS_URL (Infrastructure VMs)
 * - WEBHOOK_VEEAM_ALARMS_URL (Alarms)
 *
 * Provides search, filters, and pagination (8 items/page) for each tab.
 */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { safeParseResponse } from "@/lib/safeFetch";
import {
  WEBHOOK_BACKUP_REPLICATION_URL,
  WEBHOOK_VEEAM_VMS_URL,
  WEBHOOK_VEEAM_ALARMS_URL,
} from "@/config/env";
import type { AlarmSeverity, AlarmStatus, TimeRange } from "@/hooks/useVeeamAlarms";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VeeamMetricsSummary {
  totalVMs: number;
  protectedVMs: number;
  unprotectedVMs: number;
  totalJobs: number;
  staleBackups: number;
  activeAlerts: number;
  infraVMs: number;
  infraPoweredOn: number;
  infraProtected: number;
  loading: boolean;
}

// Backup & Replication data (mirrors user dashboard types)
export interface BRMatchedVm {
  vm: {
    name: string;
    powerState: string;
    guestOs: string;
    isProtected: boolean;
    lastProtectedDate: string;
  };
  protectionSummary: {
    totalJobs: number;
    overallStatus: string;
    backupCurrent: boolean;
  };
  jobs: BRJob[];
}

export interface BRJob {
  jobName: string;
  jobType: string;
  lastRun: string;
  lastRunDurationSec: number;
  avgDurationSec: number;
  lastTransferredBytes: number;
  platform: string;
  backupStatus: {
    status: string;
    jobStatus: string;
    backupAgeHours: number;
    ranWithinLast24Hours: boolean;
  };
  parsedJob: {
    schedule: string;
    target: string;
    targetPlatform: string;
    client: string;
    location: string;
    source_host: string;
  };
}

export interface BRUnprotectedVm {
  name: string;
  powerState: string;
  guestOs: string;
  lastSeen?: string;
}

export interface BROrphanJob {
  jobName: string;
  jobType: string;
  platform: string;
  schedule?: string;
  status: string;
  lastRun?: string;
}

export interface BRMultiVmJob {
  jobName: string;
  jobType: string;
  platform: string;
  linkedVMs: string[];
  status: string;
  lastRun?: string;
}

export interface BRReplica {
  name: string;
  sourceVm: string;
  target: string;
  status: string;
  lastSync?: string;
  health?: string;
}

export interface BRChangedJob {
  jobName: string;
  jobType: string;
  platform: string;
  status: string;
  changeType: string;
  changedAt?: string;
}

export interface BackupReplicationData {
  summary: any;
  matched: BRMatchedVm[];
  alerts: { warnings: any[]; critical: any[] } | null;
  statistics: any;
  vmsWithoutJobs: BRUnprotectedVm[];
  jobsWithoutVMs: BROrphanJob[];
  multiVMJobs: BRMultiVmJob[];
  replicas: BRReplica[];
  changes: any;
  changeSummary: any;
}

// Infrastructure VM (mirrors useVeeamInfrastructure)
export interface InfraVM {
  client_id: number;
  vmid: string;
  Category: string;
  raw_json: {
    vm_name: string;
    vm_metrics: {
      powerState: string;
      isProtected: boolean;
      cpuCount: number;
      memorySizeHuman: string;
      totalCommittedHuman: string;
      totalAllocatedHuman: string;
      connectionState: string;
      guestOs: string;
      guestDnsName: string | null;
      guestIpAddresses: string[];
      lastProtectedDate: string | null;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

// Alarm item (from WEBHOOK_VEEAM_ALARMS_URL)
export interface VeeamAlarmItem {
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

// ─── Pagination helper ──────────────────────────────────────────────────────

const PAGE_SIZE = 8;

function usePaginatedList<T>(items: T[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, currentPage]);

  return {
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems: items.length,
    pageSize: PAGE_SIZE,
    startIndex: (currentPage - 1) * PAGE_SIZE,
    endIndex: Math.min(currentPage * PAGE_SIZE, items.length),
  };
}

// ─── Main Hook ──────────────────────────────────────────────────────────────

interface UseOrganizationVeeamMetricsOptions {
  clientId: number | null;
  enabled?: boolean;
}

export const useOrganizationVeeamMetrics = (options: UseOrganizationVeeamMetricsOptions) => {
  const { clientId, enabled = true } = options;
  const { authenticatedFetch } = useAuthenticatedFetch();

  // ── Loading / Connection ──
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Raw data ──
  const [brData, setBrData] = useState<BackupReplicationData | null>(null);
  const [infraVMs, setInfraVMs] = useState<InfraVM[]>([]);
  const [alarmItems, setAlarmItems] = useState<VeeamAlarmItem[]>([]);

  // ── Search & Filter state ──
  // Backup & Replication tab
  const [brSearch, setBrSearch] = useState("");
  const [brProtectedFilter, setBrProtectedFilter] = useState<"all" | "protected" | "unprotected">("all");
  const [brStatusFilter, setBrStatusFilter] = useState<"all" | "success" | "warning" | "stale">("all");
  const [brPowerFilter, setBrPowerFilter] = useState<"all" | "running" | "off">("all");

  // Infrastructure tab
  const [infraSearch, setInfraSearch] = useState("");
  const [infraPowerFilter, setInfraPowerFilter] = useState<"all" | "PoweredOn" | "PoweredOff">("all");
  const [infraProtectionFilter, setInfraProtectionFilter] = useState<"all" | "protected" | "unprotected">("all");

  // Alarms tab
  const [alarmsSearch, setAlarmsSearch] = useState("");
  const [alarmsStatusFilter, setAlarmsStatusFilter] = useState<AlarmStatus | null>(null);
  const [alarmsSeverityFilter, setAlarmsSeverityFilter] = useState<AlarmSeverity | null>(null);
  const [alarmsEntityTypeFilter, setAlarmsEntityTypeFilter] = useState<string | null>(null);
  const [alarmsTimeRange, setAlarmsTimeRange] = useState<TimeRange>("24h");
  const [alarmsCustomDateFrom, setAlarmsCustomDateFrom] = useState<Date | undefined>(undefined);
  const [alarmsCustomDateTo, setAlarmsCustomDateTo] = useState<Date | undefined>(undefined);

  // ── Fetch all 3 endpoints ──
  const fetchAll = useCallback(async (silent = false) => {
    if (!clientId || !enabled) return;
    if (!silent) setLoading(true);

    try {
      const [brRes, infraRes, alarmsRes] = await Promise.allSettled([
        authenticatedFetch(WEBHOOK_BACKUP_REPLICATION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        }),
        authenticatedFetch(WEBHOOK_VEEAM_VMS_URL, {
          method: "POST",
          headers: { Accept: "application/json" },
        }),
        authenticatedFetch(WEBHOOK_VEEAM_ALARMS_URL, {
          method: "POST",
          headers: { Accept: "application/json" },
        }),
      ]);

      // Process Backup & Replication
      if (brRes.status === "fulfilled" && brRes.value.ok) {
        try {
          const result = await safeParseResponse<unknown>(brRes.value, WEBHOOK_BACKUP_REPLICATION_URL);
          if (result.ok && result.data) {
            const arr = Array.isArray(result.data) ? result.data : [];
            const mainObj = (arr[0] ?? {}) as any;
            const metaObj = (arr[1] ?? {}) as any;
            setBrData({
              summary: mainObj.summary ?? null,
              matched: (mainObj.matched ?? []) as BRMatchedVm[],
              alerts: mainObj.alerts ?? null,
              statistics: mainObj.statistics ?? null,
              vmsWithoutJobs: mainObj.vmsWithoutJobs ?? [],
              jobsWithoutVMs: mainObj.jobsWithoutVMs ?? [],
              multiVMJobs: mainObj.multiVMJobs ?? [],
              replicas: mainObj.replicas ?? [],
              changes: metaObj.changes ?? null,
              changeSummary: metaObj.summary ?? null,
            });
          }
        } catch { /* parsing error */ }
      }

      // Process Infrastructure VMs
      if (infraRes.status === "fulfilled" && infraRes.value.ok) {
        try {
          const result = await safeParseResponse<InfraVM[]>(infraRes.value, WEBHOOK_VEEAM_VMS_URL);
          if (result.ok && result.data) {
            const vms = Array.isArray(result.data) ? result.data : [result.data];
            setInfraVMs(vms);
          }
        } catch { /* parsing error */ }
      }

      // Process Alarms
      if (alarmsRes.status === "fulfilled" && alarmsRes.value.ok) {
        try {
          const result = await safeParseResponse<any[]>(alarmsRes.value, WEBHOOK_VEEAM_ALARMS_URL);
          if (result.ok && result.data && Array.isArray(result.data)) {
            const severityMap: Record<string, string> = {
              Error: "Critical",
              Warning: "Warning",
              Information: "Info",
              High: "High",
              Resolved: "Info",
            };

            const alarmsArray = result.data
              .map((item: any) => {
                if (typeof item !== "object" || item === null) return null;
                const outerKey = Object.keys(item)[0];
                if (!outerKey) return null;
                const inner = item[outerKey];
                if (!inner) return null;

                const mappedSeverity = severityMap[outerKey] || "Unknown";
                const isResolved =
                  outerKey === "Resolved" ||
                  (inner.description || "").toLowerCase().includes("back to normal");
                const mappedStatus: string = isResolved ? "Resolved" : "Active";

                return {
                  client_id: inner.client_id,
                  alarm_id: inner.triggered_alarm_id || "",
                  dedupe_key: inner.dedupe_key || "",
                  name: inner.alarm_name || "",
                  description: inner.description || "",
                  severity: mappedSeverity,
                  status: mappedStatus,
                  entity_type: inner.object_type || "",
                  entity_name: inner.object_name || "",
                  triggered_at: inner.triggered_time || null,
                  resolved_at: inner.resolved_at || null,
                  first_seen: inner.first_seen || null,
                  last_seen: inner.last_seen || null,
                  seen_count: inner.repeat_count || 0,
                  times_sent: 0,
                  reminder_interval: undefined,
                  first_ai_response: inner.comment || undefined,
                } as VeeamAlarmItem;
              })
              .filter((a): a is VeeamAlarmItem => Boolean(a));

            // Deduplicate by dedupe_key
            const uniqueMap = new Map<string, VeeamAlarmItem>();
            alarmsArray.forEach((alarm) => {
              if (alarm.dedupe_key && !uniqueMap.has(alarm.dedupe_key)) {
                uniqueMap.set(alarm.dedupe_key, alarm);
              }
            });

            setAlarmItems(Array.from(uniqueMap.values()));
          } else {
            setAlarmItems([]);
          }
        } catch { /* parsing error */ }
      }

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("[useOrganizationVeeamMetrics] Fetch error:", err);
      if (!silent) setError(err instanceof Error ? err.message : "Failed to fetch Veeam metrics");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [clientId, enabled, authenticatedFetch]);

  // Initial fetch + auto-refresh
  useEffect(() => {
    if (clientId && enabled) {
      fetchAll(false);
      intervalRef.current = setInterval(() => fetchAll(true), 30000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [clientId, enabled, fetchAll]);

  // ── Computed: Summary ──
  const summary = useMemo<VeeamMetricsSummary>(() => {
    const br = brData;
    return {
      totalVMs: br?.summary?.overview?.totalVMs ?? br?.matched?.length ?? 0,
      protectedVMs: br?.summary?.protection?.protectedVMs ?? br?.matched?.filter(m => m.vm?.isProtected).length ?? 0,
      unprotectedVMs: br?.summary?.protection?.unprotectedVMs ?? br?.vmsWithoutJobs?.length ?? 0,
      totalJobs: br?.summary?.overview?.totalJobs ?? br?.matched?.reduce((acc, m) => acc + (m.jobs?.length ?? 0), 0) ?? 0,
      staleBackups: br?.summary?.backupHealth?.staleBackups ?? 0,
      activeAlerts: alarmItems.filter(a => a.status === "Active").length,
      infraVMs: infraVMs.length,
      infraPoweredOn: infraVMs.filter(vm => vm.raw_json?.vm_metrics?.powerState === "PoweredOn").length,
      infraProtected: infraVMs.filter(vm => vm.raw_json?.vm_metrics?.isProtected === true).length,
      loading,
    };
  }, [brData, infraVMs, alarmItems, loading]);

  // ── Filtered & paginated: Backup & Replication matched VMs ──
  const filteredBRMatched = useMemo(() => {
    let list = brData?.matched ?? [];
    const q = brSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(m =>
        (m.vm?.name ?? "").toLowerCase().includes(q) ||
        (m.vm?.guestOs ?? "").toLowerCase().includes(q)
      );
    }
    if (brProtectedFilter !== "all") {
      list = list.filter(m => brProtectedFilter === "protected" ? m.vm?.isProtected : !m.vm?.isProtected);
    }
    if (brStatusFilter !== "all") {
      list = list.filter(m => {
        const s = (m.protectionSummary?.overallStatus ?? "").toLowerCase();
        if (brStatusFilter === "success") return s.includes("success");
        if (brStatusFilter === "warning") return s.includes("warn");
        return s.includes("stale");
      });
    }
    if (brPowerFilter !== "all") {
      list = list.filter(m => {
        const ps = (m.vm?.powerState ?? "").toLowerCase();
        if (brPowerFilter === "running") return ps.includes("run") || ps.includes("on");
        return ps.includes("off") || ps.includes("stopped");
      });
    }
    return list;
  }, [brData, brSearch, brProtectedFilter, brStatusFilter, brPowerFilter]);

  const brPagination = usePaginatedList(filteredBRMatched);

  // Reset pages on filter change
  useEffect(() => { brPagination.setCurrentPage(1); }, [brSearch, brProtectedFilter, brStatusFilter, brPowerFilter]);

  // ── Filtered & paginated: Infrastructure VMs ──
  const filteredInfraVMs = useMemo(() => {
    let list = infraVMs.filter(vm => vm.raw_json?.vm_metrics);
    const q = infraSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(vm => {
        const name = (vm.raw_json?.vm_name ?? "").toLowerCase();
        const dns = (vm.raw_json?.vm_metrics?.guestDnsName ?? "").toLowerCase();
        const ips = (vm.raw_json?.vm_metrics?.guestIpAddresses ?? []).join(" ").toLowerCase();
        return name.includes(q) || dns.includes(q) || ips.includes(q);
      });
    }
    if (infraPowerFilter !== "all") {
      list = list.filter(vm => vm.raw_json?.vm_metrics?.powerState === infraPowerFilter);
    }
    if (infraProtectionFilter !== "all") {
      list = list.filter(vm =>
        infraProtectionFilter === "protected"
          ? vm.raw_json?.vm_metrics?.isProtected === true
          : vm.raw_json?.vm_metrics?.isProtected === false
      );
    }
    return list.sort((a, b) => (a.raw_json?.vm_name ?? "").localeCompare(b.raw_json?.vm_name ?? ""));
  }, [infraVMs, infraSearch, infraPowerFilter, infraProtectionFilter]);

  const infraPagination = usePaginatedList(filteredInfraVMs);

  useEffect(() => { infraPagination.setCurrentPage(1); }, [infraSearch, infraPowerFilter, infraProtectionFilter]);

  // ── Filtered & paginated: Alarms ──
  const alarmsEntityTypes = useMemo(() => {
    const types = new Set(alarmItems.map(a => a.entity_type).filter(Boolean));
    return Array.from(types).sort();
  }, [alarmItems]);

  const alarmsCounts = useMemo(() => ({
    total: alarmItems.length,
    active: alarmItems.filter(a => a.status === "Active").length,
    acknowledged: alarmItems.filter(a => a.status === "Acknowledged").length,
    resolved: alarmItems.filter(a => a.status === "Resolved").length,
    suppressed: alarmItems.filter(a => a.status === "Suppressed").length,
  }), [alarmItems]);

  const filteredAlarms = useMemo(() => {
    let list = alarmItems;
    const q = alarmsSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(a =>
        a.name?.toLowerCase().includes(q) ||
        a.entity_name?.toLowerCase().includes(q) ||
        a.entity_type?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
      );
    }
    if (alarmsStatusFilter) {
      list = list.filter(a => a.status === alarmsStatusFilter);
    }
    if (alarmsSeverityFilter) {
      list = list.filter(a => a.severity === alarmsSeverityFilter);
    }
    if (alarmsEntityTypeFilter) {
      list = list.filter(a => a.entity_type === alarmsEntityTypeFilter);
    }

    // Time range filter
    if (alarmsTimeRange !== "custom") {
      list = list.filter(a => {
        const alarmTime = a.last_seen || a.triggered_at;
        if (!alarmTime) return true;
        const alarmDate = new Date(alarmTime).getTime();
        let cutoff = 0;
        switch (alarmsTimeRange) {
          case "1h": cutoff = Date.now() - 60 * 60 * 1000; break;
          case "24h": cutoff = Date.now() - 24 * 60 * 60 * 1000; break;
          case "7d": cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; break;
        }
        return cutoff === 0 || alarmDate >= cutoff;
      });
    } else {
      list = list.filter(a => {
        const alarmTime = a.last_seen || a.triggered_at;
        if (!alarmTime) return true;
        const alarmDate = new Date(alarmTime).getTime();
        if (alarmsCustomDateFrom && alarmDate < alarmsCustomDateFrom.getTime()) return false;
        if (alarmsCustomDateTo) {
          const toEnd = new Date(alarmsCustomDateTo);
          toEnd.setHours(23, 59, 59, 999);
          if (alarmDate > toEnd.getTime()) return false;
        }
        return true;
      });
    }

    return list.sort((a, b) => {
      const aTime = a.last_seen || a.triggered_at || "";
      const bTime = b.last_seen || b.triggered_at || "";
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [alarmItems, alarmsSearch, alarmsStatusFilter, alarmsSeverityFilter, alarmsEntityTypeFilter, alarmsTimeRange, alarmsCustomDateFrom, alarmsCustomDateTo]);

  const alarmsPagination = usePaginatedList(filteredAlarms);

  useEffect(() => { alarmsPagination.setCurrentPage(1); }, [alarmsSearch, alarmsStatusFilter, alarmsSeverityFilter, alarmsEntityTypeFilter, alarmsTimeRange, alarmsCustomDateFrom, alarmsCustomDateTo]);

  return {
    // Summary
    summary,
    loading,
    error,
    lastUpdated,
    refresh: () => fetchAll(false),

    // Backup & Replication
    brData,
    filteredBRMatched,
    brPagination,
    brSearch,
    setBrSearch,
    brProtectedFilter,
    setBrProtectedFilter,
    brStatusFilter,
    setBrStatusFilter,
    brPowerFilter,
    setBrPowerFilter,

    // Infrastructure
    infraVMs,
    filteredInfraVMs,
    infraPagination,
    infraSearch,
    setInfraSearch,
    infraPowerFilter,
    setInfraPowerFilter,
    infraProtectionFilter,
    setInfraProtectionFilter,

    // Alarms
    alarmItems,
    filteredAlarms,
    alarmsPagination,
    alarmsCounts,
    alarmsEntityTypes,
    alarmsSearch,
    setAlarmsSearch,
    alarmsStatusFilter,
    setAlarmsStatusFilter,
    alarmsSeverityFilter,
    setAlarmsSeverityFilter,
    alarmsEntityTypeFilter,
    setAlarmsEntityTypeFilter,
    alarmsTimeRange,
    setAlarmsTimeRange,
    alarmsCustomDateFrom,
    setAlarmsCustomDateFrom,
    alarmsCustomDateTo,
    setAlarmsCustomDateTo,
  };
};
