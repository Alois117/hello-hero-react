/**
 * Super Admin Organization Veeam Metrics Hook
 * Fetches combined Veeam data from 3 endpoints:
 * - WEBHOOK_BACKUP_REPLICATION_URL (Backup & Replication)
 * - WEBHOOK_VEEAM_VMS_URL (Infrastructure VMs)
 * - WEBHOOK_JARVIS_ASSISTANT_URL (Jarvis Assistant)
 *
 * Provides search, filters, and pagination (8 items/page) for each tab.
 */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { safeParseResponse } from "@/lib/safeFetch";
import {
  WEBHOOK_BACKUP_REPLICATION_URL,
  WEBHOOK_VEEAM_VMS_URL,
  WEBHOOK_JARVIS_ASSISTANT_URL,
} from "@/config/env";

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

// Jarvis Assistant item
export interface JarvisItem {
  id: string;
  type: string;
  title: string;
  content: string;
  timestamp: Date;
  severity?: string;
  status?: string;
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
  const [jarvisItems, setJarvisItems] = useState<JarvisItem[]>([]);

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

  // Jarvis tab
  const [jarvisSearch, setJarvisSearch] = useState("");

  // ── Fetch all 3 endpoints ──
  const fetchAll = useCallback(async (silent = false) => {
    if (!clientId || !enabled) return;
    if (!silent) setLoading(true);

    try {
      const [brRes, infraRes, jarvisRes] = await Promise.allSettled([
        authenticatedFetch(WEBHOOK_BACKUP_REPLICATION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        }),
        authenticatedFetch(WEBHOOK_VEEAM_VMS_URL, {
          method: "POST",
          headers: { Accept: "application/json" },
        }),
        authenticatedFetch(WEBHOOK_JARVIS_ASSISTANT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ client_id: clientId }),
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

      // Process Jarvis Assistant
      if (jarvisRes.status === "fulfilled" && jarvisRes.value.ok) {
        try {
          const data = await jarvisRes.value.json();
          const rawItems = Array.isArray(data) ? data : [];
          const items: JarvisItem[] = rawItems.map((item: any, idx: number) => ({
            id: item.id || item.dedupe_key || `jarvis-${idx}`,
            type: item.type || item.category || "assistant",
            title: item.title || item.name || item.subject || "Jarvis Response",
            content: item.content || item.message || item.response || item.first_ai_response || "",
            timestamp: item.created_at ? new Date(item.created_at) : new Date(),
            severity: item.severity,
            status: item.status,
          }));
          setJarvisItems(items);
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
      activeAlerts: (br?.alerts?.warnings?.length ?? 0) + (br?.alerts?.critical?.length ?? 0),
      infraVMs: infraVMs.length,
      infraPoweredOn: infraVMs.filter(vm => vm.raw_json?.vm_metrics?.powerState === "PoweredOn").length,
      infraProtected: infraVMs.filter(vm => vm.raw_json?.vm_metrics?.isProtected === true).length,
      loading,
    };
  }, [brData, infraVMs, loading]);

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

  // ── Filtered & paginated: Jarvis items ──
  const filteredJarvis = useMemo(() => {
    let list = jarvisItems;
    const q = jarvisSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [jarvisItems, jarvisSearch]);

  const jarvisPagination = usePaginatedList(filteredJarvis);

  useEffect(() => { jarvisPagination.setCurrentPage(1); }, [jarvisSearch]);

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

    // Jarvis
    jarvisItems,
    filteredJarvis,
    jarvisPagination,
    jarvisSearch,
    setJarvisSearch,
  };
};
