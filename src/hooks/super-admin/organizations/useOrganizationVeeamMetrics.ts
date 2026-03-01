/**
 * Super Admin Organization Veeam Metrics Hook
 * Fetches combined Veeam data from 3 endpoints:
 * - WEBHOOK_BACKUP_REPLICATION_URL (Backup & Replication)
 * - WEBHOOK_VEEAM_VMS_URL (Infrastructure VMs)
 * - WEBHOOK_VEEAM_ALARMS_URL (Alarms)
 *
 * Provides search, filters, and pagination (8 items/page) for each tab.
 *
 * NOTE:
 * - Always scope requests by client_id
 * - Defensively filter responses by client_id where possible
 * - If no clientId, do NOT fetch global data (return empty state)
 */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { safeParseResponse } from "@/lib/safeFetch";
import {
  WEBHOOK_BACKUP_REPLICATION_URL,
  WEBHOOK_VEEAM_VMS_URL,
  WEBHOOK_VEEAM_ALARMS_URL,
} from "@/config/env";
import type {
  AlarmSeverity,
  AlarmStatus,
  TimeRange,
} from "@/hooks/useVeeamAlarms";

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
    // Sometimes backend might include client_id here:
    client_id?: number;
    clientId?: number;
  };
  client_id?: number;
  clientId?: number;
}

export interface BRUnprotectedVm {
  name: string;
  powerState: string;
  guestOs: string;
  lastSeen?: string;
  client_id?: number;
  clientId?: number;
}

export interface BROrphanJob {
  jobName: string;
  jobType: string;
  platform: string;
  schedule?: string;
  status: string;
  lastRun?: string;
  client_id?: number;
  clientId?: number;
}

export interface BRMultiVmJob {
  jobName: string;
  jobType: string;
  platform: string;
  linkedVMs: string[];
  status: string;
  lastRun?: string;
  client_id?: number;
  clientId?: number;
}

export interface BRReplica {
  name: string;
  sourceVm: string;
  target: string;
  status: string;
  lastSync?: string;
  health?: string;
  client_id?: number;
  clientId?: number;
}

export interface BRChangedJob {
  jobName: string;
  jobType: string;
  platform: string;
  status: string;
  changeType: string;
  changedAt?: string;
  client_id?: number;
  clientId?: number;
}

export interface BackupReplicationData {
  summary: unknown;
  matched: BRMatchedVm[];
  alerts: { warnings: unknown[]; critical: unknown[] } | null;
  statistics: unknown;
  vmsWithoutJobs: BRUnprotectedVm[];
  jobsWithoutVMs: BROrphanJob[];
  multiVMJobs: BRMultiVmJob[];
  replicas: BRReplica[];
  changes: unknown;
  changeSummary: unknown;
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
      [key: string]: unknown;
    };
    [key: string]: unknown;
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

export interface PreloadedVeeamMetricsData {
  brData: BackupReplicationData | null;
  infraVMs: InfraVM[];
  alarmItems: VeeamAlarmItem[];
  loading?: boolean;
  error?: string | null;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
}

// ─── Pagination helper ──────────────────────────────────────────────────────

const PAGE_SIZE = 8;
const EMPTY_INFRA_VMS: InfraVM[] = [];
const EMPTY_ALARM_ITEMS: VeeamAlarmItem[] = [];
type UnknownRecord = Record<string, unknown>;

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

// ─── clientId helpers ───────────────────────────────────────────────────────

const toNumberOrNull = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const normalizeClientId = (clientId: number | null): number | null => {
  const n = toNumberOrNull(clientId);
  return n != null && n > 0 ? n : null;
};

const matchesClientId = (payloadClientId: unknown, clientId: number | null) => {
  if (clientId == null) return true;
  const n = toNumberOrNull(payloadClientId);
  return n != null && n === clientId;
};

/**
 * BR payloads can be nested / inconsistent. Try a few likely places for client_id.
 * If none exists, return null, meaning we can't filter that item client-side.
 */
const extractClientIdFromBRItem = (x: unknown): number | null => {
  const record = (x && typeof x === "object" ? (x as UnknownRecord) : {}) as Record<string, unknown>;
  const vm = (record.vm && typeof record.vm === "object" ? (record.vm as UnknownRecord) : {}) as Record<string, unknown>;
  const parsedJob =
    record.parsedJob && typeof record.parsedJob === "object"
      ? (record.parsedJob as UnknownRecord)
      : ({} as UnknownRecord);
  const firstJob =
    Array.isArray(record.jobs) && record.jobs.length > 0 && typeof record.jobs[0] === "object"
      ? (record.jobs[0] as UnknownRecord)
      : ({} as UnknownRecord);
  const firstParsedJob =
    firstJob.parsedJob && typeof firstJob.parsedJob === "object"
      ? (firstJob.parsedJob as UnknownRecord)
      : ({} as UnknownRecord);

  const candidate =
    record.client_id ??
    record.clientId ??
    vm.client_id ??
    vm.clientId ??
    parsedJob.client_id ??
    parsedJob.clientId ??
    firstJob.client_id ??
    firstJob.clientId ??
    firstParsedJob.client_id ??
    firstParsedJob.clientId;

  return toNumberOrNull(candidate);
};

const defensivelyFilterBRList = <T,>(
  list: T[],
  clientId: number | null
): T[] => {
  if (clientId == null) return list;
  // Only filter when we can actually see a clientId in items;
  // otherwise keep list and rely on backend scoping.
  const hasAnyClientId = list.some(
    (x: unknown) => extractClientIdFromBRItem(x) != null
  );
  if (!hasAnyClientId) return list;

  return list.filter((x: unknown) =>
    matchesClientId(extractClientIdFromBRItem(x), clientId)
  );
};

// ─── Main Hook ──────────────────────────────────────────────────────────────

interface UseOrganizationVeeamMetricsOptions {
  clientId: number | null;
  enabled?: boolean;
  preloadedData?: PreloadedVeeamMetricsData;
}

export const useOrganizationVeeamMetrics = (
  options: UseOrganizationVeeamMetricsOptions
) => {
  const { enabled = true, preloadedData } = options;
  const isPreloadedMode = Boolean(preloadedData);
  const clientId = normalizeClientId(options.clientId);
  const hasClientId = clientId != null;

  const { authenticatedFetch } = useAuthenticatedFetch();

  // ── Loading / Connection ──
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Raw data ──
  const [brData, setBrData] = useState<BackupReplicationData | null>(null);
  const [infraVMs, setInfraVMs] = useState<InfraVM[]>([]);
  const [alarmItems, setAlarmItems] = useState<VeeamAlarmItem[]>([]);

  // ── Search & Filter state ──
  // Backup & Replication tab
  const [brSearch, setBrSearch] = useState("");
  const [brProtectedFilter, setBrProtectedFilter] = useState<
    "all" | "protected" | "unprotected"
  >("all");
  const [brStatusFilter, setBrStatusFilter] = useState<
    "all" | "success" | "warning" | "stale"
  >("all");
  const [brPowerFilter, setBrPowerFilter] = useState<"all" | "running" | "off">(
    "all"
  );

  // Infrastructure tab
  const [infraSearch, setInfraSearch] = useState("");
  const [infraPowerFilter, setInfraPowerFilter] = useState<
    "all" | "PoweredOn" | "PoweredOff"
  >("all");
  const [infraProtectionFilter, setInfraProtectionFilter] = useState<
    "all" | "protected" | "unprotected"
  >("all");

  // Alarms tab
  const [alarmsSearch, setAlarmsSearch] = useState("");
  const [alarmsStatusFilter, setAlarmsStatusFilter] =
    useState<AlarmStatus | null>(null);
  const [alarmsSeverityFilter, setAlarmsSeverityFilter] =
    useState<AlarmSeverity | null>(null);
  const [alarmsEntityTypeFilter, setAlarmsEntityTypeFilter] = useState<
    string | null
  >(null);
  const [alarmsTimeRange, setAlarmsTimeRange] = useState<TimeRange>("24h");
  const [alarmsCustomDateFrom, setAlarmsCustomDateFrom] = useState<
    Date | undefined
  >(undefined);
  const [alarmsCustomDateTo, setAlarmsCustomDateTo] = useState<Date | undefined>(
    undefined
  );

  const effectiveBrData = isPreloadedMode ? preloadedData?.brData ?? null : brData;
  const effectiveInfraVMs = isPreloadedMode
    ? preloadedData?.infraVMs ?? EMPTY_INFRA_VMS
    : infraVMs;
  const effectiveAlarmItems = isPreloadedMode
    ? preloadedData?.alarmItems ?? EMPTY_ALARM_ITEMS
    : alarmItems;
  const effectiveLoading = isPreloadedMode ? Boolean(preloadedData?.loading) : loading;
  const effectiveError = isPreloadedMode ? preloadedData?.error ?? null : error;
  const effectiveLastUpdated = isPreloadedMode
    ? preloadedData?.lastUpdated ?? null
    : lastUpdated;

  // ── Fetch all 3 endpoints ──
  const fetchAll = useCallback(
    async (silent = false) => {
      if (!enabled || isPreloadedMode) return;

      // If no clientId, do not fetch global Veeam data.
      if (!hasClientId) {
        setBrData(null);
        setInfraVMs([]);
        setAlarmItems([]);
        setError(null);
        setLastUpdated(new Date());
        if (!silent) setLoading(false);
        return;
      }

      // Abort in-flight requests to prevent stale org bleed on fast switching
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (!silent) setLoading(true);

      try {
        const commonPost = {
          method: "POST" as const,
          headers: { Accept: "application/json" },
          signal: abortControllerRef.current.signal,
        };

        const [brRes, infraRes, alarmsRes] = await Promise.allSettled([
          authenticatedFetch(WEBHOOK_BACKUP_REPLICATION_URL, {
            ...commonPost,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ client_id: clientId }),
          }),
          authenticatedFetch(WEBHOOK_VEEAM_VMS_URL, {
            ...commonPost,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ client_id: clientId }),
          }),
          authenticatedFetch(WEBHOOK_VEEAM_ALARMS_URL, {
            ...commonPost,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ client_id: clientId }),
          }),
        ]);

        // ── Backup & Replication ──
        // Response format matches User Dashboard: [mainObj, metaObj]
        // mainObj = { summary, matched, alerts, statistics, vmsWithoutJobs, jobsWithoutVMs, multiVMJobs, replicas }
        // metaObj = { changes, summary (changeSummary) }
        if (brRes.status === "fulfilled" && brRes.value.ok) {
          try {
            const result = await safeParseResponse<unknown>(
              brRes.value,
              WEBHOOK_BACKUP_REPLICATION_URL
            );

            if (result.ok && result.data) {
              const arr = Array.isArray(result.data) ? result.data : [];
              const mainObj = (arr[0] ?? {}) as UnknownRecord;
              const metaObj = (arr[1] ?? {}) as UnknownRecord;

              console.log("[BR super-admin] Parsed main keys:", Object.keys(mainObj));

              // Extract lists from the main object (same shape as User Dashboard)
              // Backend already scopes response by client_id (sent in POST body).
              // Do NOT re-filter client-side — items may not carry their own client_id field,
              // which causes defensivelyFilterBRList to drop valid rows.
              const matched: BRMatchedVm[] =
                Array.isArray(mainObj.matched) ? mainObj.matched : [];
              const vmsWithoutJobs: BRUnprotectedVm[] =
                Array.isArray(mainObj.vmsWithoutJobs) ? mainObj.vmsWithoutJobs : [];
              const jobsWithoutVMs: BROrphanJob[] =
                Array.isArray(mainObj.jobsWithoutVMs) ? mainObj.jobsWithoutVMs : [];
              const multiVMJobs: BRMultiVmJob[] =
                Array.isArray(mainObj.multiVMJobs) ? mainObj.multiVMJobs : [];
              const replicas: BRReplica[] =
                Array.isArray(mainObj.replicas) ? mainObj.replicas : [];

              setBrData({
                summary: mainObj.summary ?? null,
                matched,
                alerts: mainObj.alerts ?? null,
                statistics: mainObj.statistics ?? null,
                vmsWithoutJobs,
                jobsWithoutVMs,
                multiVMJobs,
                replicas,
                changes: metaObj.changes ?? null,
                changeSummary: metaObj.summary ?? null,
              });

              console.log("[BR super-admin] Matched VMs:", matched.length, "Unprotected:", vmsWithoutJobs.length, "Orphan:", jobsWithoutVMs.length);
            } else {
              setBrData(null);
            }
          } catch (parseErr) {
            console.error("[BR super-admin] Parse error:", parseErr);
            setBrData(null);
          }
        }

        // ── Infrastructure VMs ── (unchanged)
        if (infraRes.status === "fulfilled" && infraRes.value.ok) {
          try {
            const result = await safeParseResponse<InfraVM[]>(
              infraRes.value,
              WEBHOOK_VEEAM_VMS_URL
            );
            if (result.ok && result.data) {
              const vmsRaw = Array.isArray(result.data)
                ? result.data
                : [result.data as unknown];

              const vms = vmsRaw.filter((vm: unknown) =>
                matchesClientId(
                  (vm && typeof vm === "object"
                    ? (vm as UnknownRecord).client_id ?? (vm as UnknownRecord).clientId
                    : undefined),
                  clientId
                )
              );

              setInfraVMs(vms);
            } else {
              setInfraVMs([]);
            }
          } catch {
            /* parsing error */
          }
        }

        // ── Alarms ── (unchanged)
        if (alarmsRes.status === "fulfilled" && alarmsRes.value.ok) {
          try {
            const result = await safeParseResponse<unknown[]>(
              alarmsRes.value,
              WEBHOOK_VEEAM_ALARMS_URL
            );

            if (result.ok && result.data && Array.isArray(result.data)) {
              const severityMap: Record<string, string> = {
                Error: "Critical",
                Warning: "Warning",
                Information: "Info",
                High: "High",
                Resolved: "Info",
              };

              const alarmsArray = result.data
                .map((item: unknown) => {
                  if (typeof item !== "object" || item === null) return null;
                  const outerKey = Object.keys(item)[0];
                  if (!outerKey) return null;
                  const inner = item[outerKey];
                  if (!inner) return null;

                  const mappedSeverity = severityMap[outerKey] || "Unknown";
                  const isResolved =
                    outerKey === "Resolved" ||
                    (inner.description || "")
                      .toLowerCase()
                      .includes("back to normal");
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
                .filter((a): a is VeeamAlarmItem => Boolean(a))
                .filter((a) => matchesClientId(a?.client_id, clientId));

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
          } catch {
            /* parsing error */
          }
        }

        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        // Abort is not a "real error"
        if ((err as { name?: string })?.name === "AbortError") return;

        console.error("[useOrganizationVeeamMetrics] Fetch error:", err);
        if (!silent) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch Veeam metrics"
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [clientId, hasClientId, enabled, isPreloadedMode, authenticatedFetch]
  );

  // Initial fetch + auto-refresh + reset on org change
  useEffect(() => {
    if (!enabled || isPreloadedMode) return;

    // Reset state on org change so old org data never flashes
    setBrData(null);
    setInfraVMs([]);
    setAlarmItems([]);
    setError(null);

    if (!hasClientId) {
      setLoading(false);
      setLastUpdated(new Date());
      return;
    }

    fetchAll(false);
    intervalRef.current = setInterval(() => fetchAll(true), 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [clientId, hasClientId, enabled, isPreloadedMode, fetchAll]);

  // ── Computed: Summary ──
  const summary = useMemo<VeeamMetricsSummary>(() => {
    const br = effectiveBrData;
    const brSummary = br?.summary;

    return {
      totalVMs: brSummary?.overview?.totalVMs ?? br?.matched?.length ?? 0,
      protectedVMs: brSummary?.protection?.protectedVMs ?? br?.matched?.filter((m) => m.vm?.isProtected).length ?? 0,
      unprotectedVMs: brSummary?.protection?.unprotectedVMs ?? br?.vmsWithoutJobs?.length ?? 0,
      totalJobs: brSummary?.overview?.totalJobs ?? br?.matched?.reduce((acc, m) => acc + (m.jobs?.length ?? 0), 0) ?? 0,
      staleBackups: brSummary?.backupHealth?.staleBackups ?? 0,
      activeAlerts: effectiveAlarmItems.filter((a) => a.status === "Active").length,
      infraVMs: effectiveInfraVMs.length,
      infraPoweredOn: effectiveInfraVMs.filter(
        (vm) => vm.raw_json?.vm_metrics?.powerState === "PoweredOn"
      ).length,
      infraProtected: effectiveInfraVMs.filter(
        (vm) => vm.raw_json?.vm_metrics?.isProtected === true
      ).length,
      loading: effectiveLoading,
    };
  }, [effectiveBrData, effectiveInfraVMs, effectiveAlarmItems, effectiveLoading]);

  // ── Filtered & paginated: Backup & Replication matched VMs ──
  const filteredBRMatched = useMemo(() => {
    let list = effectiveBrData?.matched ?? [];
    const q = brSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          (m.vm?.name ?? "").toLowerCase().includes(q) ||
          (m.vm?.guestOs ?? "").toLowerCase().includes(q)
      );
    }
    if (brProtectedFilter !== "all") {
      list = list.filter((m) =>
        brProtectedFilter === "protected"
          ? m.vm?.isProtected
          : !m.vm?.isProtected
      );
    }
    if (brStatusFilter !== "all") {
      list = list.filter((m) => {
        const s = (m.protectionSummary?.overallStatus ?? "").toLowerCase();
        if (brStatusFilter === "success") return s.includes("success");
        if (brStatusFilter === "warning") return s.includes("warn");
        return s.includes("stale");
      });
    }
    if (brPowerFilter !== "all") {
      list = list.filter((m) => {
        const ps = (m.vm?.powerState ?? "").toLowerCase();
        if (brPowerFilter === "running") return ps.includes("run") || ps.includes("on");
        return ps.includes("off") || ps.includes("stopped");
      });
    }
    return list;
  }, [effectiveBrData, brSearch, brProtectedFilter, brStatusFilter, brPowerFilter]);

  const brPagination = usePaginatedList(filteredBRMatched);

  // Reset pages on filter change
  useEffect(() => {
    brPagination.setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brSearch, brProtectedFilter, brStatusFilter, brPowerFilter]);

  // ── Filtered & paginated: Infrastructure VMs ── (unchanged)
  const filteredInfraVMs = useMemo(() => {
    let list = effectiveInfraVMs.filter((vm) => vm.raw_json?.vm_metrics);
    const q = infraSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((vm) => {
        const name = (vm.raw_json?.vm_name ?? "").toLowerCase();
        const dns = (vm.raw_json?.vm_metrics?.guestDnsName ?? "").toLowerCase();
        const ips = (vm.raw_json?.vm_metrics?.guestIpAddresses ?? [])
          .join(" ")
          .toLowerCase();
        return name.includes(q) || dns.includes(q) || ips.includes(q);
      });
    }
    if (infraPowerFilter !== "all") {
      list = list.filter(
        (vm) => vm.raw_json?.vm_metrics?.powerState === infraPowerFilter
      );
    }
    if (infraProtectionFilter !== "all") {
      list = list.filter((vm) =>
        infraProtectionFilter === "protected"
          ? vm.raw_json?.vm_metrics?.isProtected === true
          : vm.raw_json?.vm_metrics?.isProtected === false
      );
    }
    return list.sort((a, b) =>
      (a.raw_json?.vm_name ?? "").localeCompare(b.raw_json?.vm_name ?? "")
    );
  }, [effectiveInfraVMs, infraSearch, infraPowerFilter, infraProtectionFilter]);

  const infraPagination = usePaginatedList(filteredInfraVMs);

  useEffect(() => {
    infraPagination.setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infraSearch, infraPowerFilter, infraProtectionFilter]);

  // ── Filtered & paginated: Alarms ── (unchanged)
  const alarmsEntityTypes = useMemo(() => {
    const types = new Set(effectiveAlarmItems.map((a) => a.entity_type).filter(Boolean));
    return Array.from(types).sort();
  }, [effectiveAlarmItems]);

  const alarmsCounts = useMemo(
    () => ({
      total: effectiveAlarmItems.length,
      active: effectiveAlarmItems.filter((a) => a.status === "Active").length,
      acknowledged: effectiveAlarmItems.filter((a) => a.status === "Acknowledged").length,
      resolved: effectiveAlarmItems.filter((a) => a.status === "Resolved").length,
      suppressed: effectiveAlarmItems.filter((a) => a.status === "Suppressed").length,
    }),
    [effectiveAlarmItems]
  );

  const filteredAlarms = useMemo(() => {
    let list = effectiveAlarmItems;
    const q = alarmsSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.name?.toLowerCase().includes(q) ||
          a.entity_name?.toLowerCase().includes(q) ||
          a.entity_type?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
      );
    }
    if (alarmsStatusFilter) {
      list = list.filter((a) => a.status === alarmsStatusFilter);
    }
    if (alarmsSeverityFilter) {
      list = list.filter((a) => a.severity === alarmsSeverityFilter);
    }
    if (alarmsEntityTypeFilter) {
      list = list.filter((a) => a.entity_type === alarmsEntityTypeFilter);
    }

    // Time range filter
    if (alarmsTimeRange !== "custom") {
      list = list.filter((a) => {
        const alarmTime = a.last_seen || a.triggered_at;
        if (!alarmTime) return true;
        const alarmDate = new Date(alarmTime).getTime();
        let cutoff = 0;
        switch (alarmsTimeRange) {
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
        return cutoff === 0 || alarmDate >= cutoff;
      });
    } else {
      list = list.filter((a) => {
        const alarmTime = a.last_seen || a.triggered_at;
        if (!alarmTime) return true;
        const alarmDate = new Date(alarmTime).getTime();
        if (alarmsCustomDateFrom && alarmDate < alarmsCustomDateFrom.getTime())
          return false;
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
  }, [
    effectiveAlarmItems,
    alarmsSearch,
    alarmsStatusFilter,
    alarmsSeverityFilter,
    alarmsEntityTypeFilter,
    alarmsTimeRange,
    alarmsCustomDateFrom,
    alarmsCustomDateTo,
  ]);

  const alarmsPagination = usePaginatedList(filteredAlarms);

  useEffect(() => {
    alarmsPagination.setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    alarmsSearch,
    alarmsStatusFilter,
    alarmsSeverityFilter,
    alarmsEntityTypeFilter,
    alarmsTimeRange,
    alarmsCustomDateFrom,
    alarmsCustomDateTo,
  ]);

  const refresh = useCallback(() => {
    if (isPreloadedMode) {
      preloadedData?.onRefresh?.();
      return;
    }
    void fetchAll(false);
  }, [isPreloadedMode, preloadedData, fetchAll]);

  return {
    // Summary
    summary,
    loading: effectiveLoading,
    error: effectiveError,
    lastUpdated: effectiveLastUpdated,
    refresh,

    // Backup & Replication
    brData: effectiveBrData,
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
    infraVMs: effectiveInfraVMs,
    filteredInfraVMs,
    infraPagination,
    infraSearch,
    setInfraSearch,
    infraPowerFilter,
    setInfraPowerFilter,
    infraProtectionFilter,
    setInfraProtectionFilter,

    // Alarms
    alarmItems: effectiveAlarmItems,
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

export default useOrganizationVeeamMetrics;
