import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { safeParseResponse } from "@/lib/safeFetch";
import {
  WEBHOOK_AI_INSIGHTS_URL,
  WEBHOOK_ALERTS_URL,
  WEBHOOK_BACKUP_REPLICATION_URL,
  WEBHOOK_REPORTS_URL,
  WEBHOOK_VEEAM_ALARMS_URL,
  WEBHOOK_VEEAM_VMS_URL,
  WEBHOOK_ZABBIX_HOSTS_URL,
} from "@/config/env";
import type { Organization } from "./types";
import type {
  AlertItem,
  HostItem,
  InsightItem,
  ReportItem,
  VeeamJobItem,
} from "./useOrganizationDetails";
import type {
  BackupReplicationData,
  InfraVM,
  VeeamAlarmItem,
  PreloadedVeeamMetricsData,
} from "./useOrganizationVeeamMetrics";

export type GlobalScope = "all" | "specific";
export type GlobalTimeRange = "24h" | "7d" | "30d" | "custom" | "all";

export type GlobalAlertItem = AlertItem & {
  organizationId: string | null;
  organizationName: string;
  clientId: number | null;
};

export type GlobalHostItem = HostItem & {
  organizationId: string | null;
  organizationName: string;
  clientId: number | null;
};

export type GlobalReportItem = ReportItem & {
  organizationId: string | null;
  organizationName: string;
  clientId: number | null;
};

export type GlobalInsightItem = InsightItem & {
  organizationId: string | null;
  organizationName: string;
  clientId: number | null;
};

export type GlobalVeeamJobItem = VeeamJobItem & {
  organizationId: string | null;
  organizationName: string;
  clientId: number | null;
};

export type VeeamBreakdownSection = "backup" | "infrastructure" | "alarms";

export interface VeeamSectionBreakdowns {
  backup: CategoryBreakdownRow[];
  infrastructure: CategoryBreakdownRow[];
  alarms: CategoryBreakdownRow[];
}

export type GlobalVeeamDrilldownData = PreloadedVeeamMetricsData & {
  sectionBreakdowns?: VeeamSectionBreakdowns;
};

export interface GlobalMetricSummary {
  alerts: { total: number; active: number; critical: number };
  hosts: { total: number; enabled: number; disabled: number };
  reports: { total: number; daily: number; weekly: number; monthly: number };
  insights: { total: number; predictions: number; anomalies: number };
  veeam: { jobs: number; success: number; failed: number };
}

export interface CategoryBreakdownRow {
  organizationId: string;
  organizationName: string;
  total: number;
  secondary: number;
  tertiary: number;
}

interface GlobalReportLiteItem {
  id: string;
  organizationId: string | null;
  organizationName: string;
  clientId: number | null;
  reportType: string;
  createdAtMs: number;
}

interface UseGlobalInfrastructureMetricsOptions {
  organizations: Organization[];
  scope: GlobalScope;
  selectedOrgIds: string[];
  timeRange: GlobalTimeRange;
  customDateFrom?: Date;
  customDateTo?: Date;
  enabled?: boolean;
}

const REFRESH_INTERVAL = 60_000;
type UnknownRecord = Record<string, unknown>;

let reportsDetailsRequestedGlobal = false;
const reportsDetailsSubscribers = new Set<() => void>();

export const requestGlobalReportsDetails = () => {
  if (reportsDetailsRequestedGlobal) return;
  reportsDetailsRequestedGlobal = true;
  reportsDetailsSubscribers.forEach((notify) => notify());
};

const toNumberOrNull = (value: unknown): number | null => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const inferSeverity = (value: unknown): string => {
  const raw = String(value ?? "").toLowerCase();
  if (!raw) return "info";
  return raw;
};

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const extractReportsRecords = (value: unknown): UnknownRecord[] => {
  if (Array.isArray(value)) {
    return value.map(asRecord);
  }
  const root = asRecord(value);
  const candidates = [root.reports, root.items, root.data, root.results];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map(asRecord);
    }
  }
  return [];
};

const extractClientIdFromRecord = (record: UnknownRecord): number | null => {
  const meta = asRecord(record.meta);
  const org = asRecord(record.organization);
  const nestedOrg = asRecord(record.org);
  return (
    toNumberOrNull(record.client_id ?? record.clientId) ??
    toNumberOrNull(meta.client_id ?? meta.clientId) ??
    toNumberOrNull(org.client_id ?? org.clientId) ??
    toNumberOrNull(nestedOrg.client_id ?? nestedOrg.clientId)
  );
};

const normalizeReportType = (record: UnknownRecord): string => {
  const raw = String(
    record.report_type ?? record.type ?? record.frequency ?? record.period ?? "daily"
  )
    .trim()
    .toLowerCase();
  if (raw === "day") return "daily";
  if (raw === "week") return "weekly";
  if (raw === "month") return "monthly";
  return raw;
};

const extractReportTimestamp = (record: UnknownRecord): number => {
  const value =
    record.created_at ??
    record.createdAt ??
    record.generated_at ??
    record.generatedAt ??
    record.timestamp ??
    record.time ??
    record.date;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 1_000_000_000_000 ? value : value * 1000;
  }
  const parsed = value ? new Date(String(value)).getTime() : NaN;
  if (Number.isFinite(parsed)) return parsed;
  return Date.now();
};

const extractReportId = (
  record: UnknownRecord,
  fallbackIndex: number,
  reportType: string,
  createdAtMs: number,
  clientId: number | null
): string =>
  String(
    record.id ??
    record.report_id ??
    record.uuid ??
    record.guid ??
    `${clientId ?? "na"}-${reportType}-${createdAtMs}-${fallbackIndex}`
  );

const normalizeReportTemplate = (record: UnknownRecord): string | undefined => {
  const template = record.report_template;
  if (typeof template === "string") return template;
  return undefined;
};

const mapReportRecord = (
  record: UnknownRecord,
  index: number,
  orgMapByClientId: Map<number, Organization>
): { lite: GlobalReportLiteItem; detail: GlobalReportItem } => {
  const clientId = extractClientIdFromRecord(record);
  const org = clientId != null ? orgMapByClientId.get(clientId) : undefined;
  const reportType = normalizeReportType(record);
  const createdAtMs = extractReportTimestamp(record);
  const id = extractReportId(record, index, reportType, createdAtMs, clientId);
  const name = String(
    record.name ??
    record.title ??
    record.report_name ??
    record.reportTitle ??
    `${reportType} report`
  );
  const status = String(record.status ?? record.state ?? "completed");
  const createdAt = new Date(createdAtMs);
  const organizationId = org?.id ?? null;
  const organizationName = org?.name ?? "Unknown Organization";
  const template = normalizeReportTemplate(record);

  return {
    lite: {
      id,
      organizationId,
      organizationName,
      clientId,
      reportType,
      createdAtMs,
    },
    detail: {
      id,
      name,
      report_type: reportType,
      report_template: template,
      status,
      created_at: createdAt,
      client_id: clientId ?? undefined,
      organizationId,
      organizationName,
      clientId,
    },
  };
};

const toDateOrUndefined = (value: unknown): Date | undefined => {
  if (value == null || value === "") return undefined;
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : undefined;
  }
  if (typeof value === "number") {
    const ms = value > 1_000_000_000_000 ? value : value * 1000;
    const date = new Date(ms);
    return Number.isFinite(date.getTime()) ? date : undefined;
  }
  const date = new Date(String(value));
  return Number.isFinite(date.getTime()) ? date : undefined;
};

const extractClientIdFromBRPayload = (value: unknown): number | null => {
  const item = asRecord(value);
  const vm = asRecord(item.vm);
  const parsedJob = asRecord(item.parsedJob);
  const firstJob = Array.isArray(item.jobs) ? asRecord(item.jobs[0]) : {};
  const firstParsedJob = asRecord(firstJob.parsedJob);
  return (
    toNumberOrNull(item.client_id ?? item.clientId) ??
    toNumberOrNull(vm.client_id ?? vm.clientId) ??
    toNumberOrNull(parsedJob.client_id ?? parsedJob.clientId) ??
    toNumberOrNull(firstJob.client_id ?? firstJob.clientId) ??
    toNumberOrNull(firstParsedJob.client_id ?? firstParsedJob.clientId)
  );
};

const mapVeeamJobFromMatchedEntry = (
  vmEntry: unknown,
  vmIndex: number,
  orgMapByClientId: Map<number, Organization>
): GlobalVeeamJobItem[] => {
  const vm = asRecord(vmEntry);
  const vmJobs = Array.isArray(vm.jobs) ? vm.jobs : [];
  const jobs: GlobalVeeamJobItem[] = [];

  for (let jobIndex = 0; jobIndex < vmJobs.length; jobIndex += 1) {
    const job = asRecord(vmJobs[jobIndex]);
    const parsedJob = asRecord(job.parsedJob);
    const vmMeta = asRecord(vm.vm);
    const protectionSummary = asRecord(vm.protectionSummary);
    const backupStatus = asRecord(job.backupStatus);
    const clientId = toNumberOrNull(
      job.client_id ??
        job.clientId ??
        parsedJob.client_id ??
        parsedJob.clientId ??
        vm.client_id ??
        vm.clientId
    );
    const org = clientId ? orgMapByClientId.get(clientId) : undefined;
    const statusRaw = String(
      backupStatus.status ??
        backupStatus.jobStatus ??
        protectionSummary.overallStatus ??
        "unknown"
    ).toLowerCase();
    const severity = statusRaw.includes("success")
      ? "success"
      : statusRaw.includes("warn")
      ? "warning"
      : statusRaw.includes("fail") || statusRaw.includes("error")
      ? "failed"
      : "unknown";

    jobs.push({
      id: `${clientId ?? "na"}-${vmIndex}-${jobIndex}`,
      name: String(job.jobName ?? vmMeta.name ?? "Veeam Job"),
      type: String(job.jobType ?? ""),
      severity,
      status: severity,
      lastRun: toDateOrUndefined(job.lastRun),
      organizationId: org?.id ?? null,
      organizationName: org?.name ?? "Unknown Organization",
      clientId,
    });
  }

  return jobs;
};

const mapVeeamJobSeverity = (rawStatus: unknown): string => {
  const status = String(rawStatus ?? "").toLowerCase();
  if (status.includes("success")) return "success";
  if (status.includes("warn")) return "warning";
  if (status.includes("fail") || status.includes("error")) return "failed";
  return "unknown";
};

const mapStandaloneVeeamJob = (
  item: unknown,
  index: number,
  orgMapByClientId: Map<number, Organization>,
  fallbackName: string
): GlobalVeeamJobItem => {
  const record = asRecord(item);
  const clientId = extractClientIdFromBRPayload(record);
  const org = clientId != null ? orgMapByClientId.get(clientId) : undefined;
  const severity = mapVeeamJobSeverity(record.status);

  return {
    id: String(
      record.id ??
        record.jobId ??
        record.jobName ??
        `${clientId ?? "na"}-${fallbackName}-${index}`
    ),
    name: String(record.jobName ?? record.name ?? fallbackName),
    type: String(record.jobType ?? record.platform ?? ""),
    severity,
    status: severity,
    lastRun: toDateOrUndefined(record.lastRun ?? record.lastRunAt ?? record.updated_at),
    organizationId: org?.id ?? null,
    organizationName: org?.name ?? "Unknown Organization",
    clientId,
  };
};

const getTimeCutoff = (
  timeRange: GlobalTimeRange,
  customDateFrom?: Date,
  customDateTo?: Date
) => {
  const now = Date.now();

  if (timeRange === "all") {
    return { from: undefined, to: undefined }; 
  }

  if (timeRange === "24h") return { from: new Date(now - 24 * 60 * 60 * 1000), to: undefined };
  if (timeRange === "7d")  return { from: new Date(now - 7 * 24 * 60 * 60 * 1000), to: undefined };
  if (timeRange === "30d") return { from: new Date(now - 30 * 24 * 60 * 60 * 1000), to: undefined };

  return { from: customDateFrom, to: customDateTo };
};

const isWithinTimeRange = (date: Date | undefined, from?: Date, to?: Date) => {
  if (!date) return true;
  const ts = date.getTime();
  if (from && ts < from.getTime()) return false;
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (ts > end.getTime()) return false;
  }
  return true;
};

const typeOfInsight = (value: unknown) => String(value ?? "").toLowerCase();

const getOrgScope = (
  organizations: Organization[],
  scope: GlobalScope,
  selectedOrgIds: string[]
) => {
  if (scope === "specific") {
    // ───────────────────────────────────────────────────────────────
    // CHANGED: previously limited to first org → now includes all selected
    return selectedOrgIds;
    // If you want to keep single-org behavior in some views, consider
    // renaming this scope or handling it in the calling component instead.
  }
  return selectedOrgIds;
};

export const useGlobalInfrastructureMetrics = ({
  organizations,
  scope,
  selectedOrgIds,
  timeRange,
  customDateFrom,
  customDateTo,
  enabled = true,
}: UseGlobalInfrastructureMetricsOptions) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [rawAlerts, setRawAlerts] = useState<GlobalAlertItem[]>([]);
  const [rawHosts, setRawHosts] = useState<GlobalHostItem[]>([]);
  const [rawReportLiteItems, setRawReportLiteItems] = useState<GlobalReportLiteItem[]>([]);
  const [rawReportRecords, setRawReportRecords] = useState<UnknownRecord[]>([]);
  const [rawReportDetails, setRawReportDetails] = useState<GlobalReportItem[]>([]);
  const [rawInsights, setRawInsights] = useState<GlobalInsightItem[]>([]);
  const [rawVeeamBackupData, setRawVeeamBackupData] = useState<BackupReplicationData | null>(null);
  const [rawVeeamInfraVMs, setRawVeeamInfraVMs] = useState<InfraVM[]>([]);
  const [rawVeeamAlarmItems, setRawVeeamAlarmItems] = useState<VeeamAlarmItem[]>([]);

  const [reportsDetailsRequested, setReportsDetailsRequested] = useState(
    reportsDetailsRequestedGlobal
  );

  const orgMapByClientId = useMemo(() => {
    const map = new Map<number, Organization>();
    organizations.forEach((org) => {
      if (org.clientId > 0) map.set(org.clientId, org);
    });
    return map;
  }, [organizations]);

  const orgMapById = useMemo(() => {
    const map = new Map<string, Organization>();
    organizations.forEach((org) => map.set(org.id, org));
    return map;
  }, [organizations]);

  useEffect(() => {
    const notify = () => setReportsDetailsRequested(true);
    reportsDetailsSubscribers.add(notify);
    return () => {
      reportsDetailsSubscribers.delete(notify);
    };
  }, []);

  const fetchAll = useCallback(
    async (silent = false) => {
      if (!enabled) return;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (!silent) setLoading(true);
      setError(null);

      try {
        const commonPost = {
          method: "POST" as const,
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({}),
          signal: abortControllerRef.current.signal,
        };

        const [
          alertsRes,
          hostsRes,
          reportsRes,
          insightsRes,
          veeamBackupRes,
          veeamInfraRes,
          veeamAlarmsRes,
        ] = await Promise.all([
          authenticatedFetch(WEBHOOK_ALERTS_URL, commonPost).catch(() => null),
          authenticatedFetch(WEBHOOK_ZABBIX_HOSTS_URL, commonPost).catch(() => null),
          authenticatedFetch(WEBHOOK_REPORTS_URL, commonPost).catch(() => null),
          authenticatedFetch(WEBHOOK_AI_INSIGHTS_URL, commonPost).catch(() => null),
          authenticatedFetch(WEBHOOK_BACKUP_REPLICATION_URL, commonPost).catch(() => null),
          authenticatedFetch(WEBHOOK_VEEAM_VMS_URL, commonPost).catch(() => null),
          authenticatedFetch(WEBHOOK_VEEAM_ALARMS_URL, commonPost).catch(() => null),
        ]);

        // ───────────────────────────────────────────────────────────────
        // Alerts parsing (unchanged)
        // ───────────────────────────────────────────────────────────────
        if (alertsRes?.ok) {
          const parsed = await safeParseResponse<unknown[]>(alertsRes, WEBHOOK_ALERTS_URL);
          if (parsed.ok && Array.isArray(parsed.data)) {
            const mapped: GlobalAlertItem[] = parsed.data.map((entry, index) => {
              const item = asRecord(entry);
              const zbxRaw = asRecord(item.zbx_raw);
              const clientId = toNumberOrNull(item?.client_id ?? item?.clientId);
              const org = clientId ? orgMapByClientId.get(clientId) : undefined;
              const timestampValue = item.created_at ?? item.first_seen ?? item.last_seen_at;
              const timestamp = toDateOrUndefined(timestampValue) ?? new Date();
              return {
                id: String(item?.eventid ?? item?.id ?? `global-alert-${index}`),
                title: String(item?.problem_name ?? item?.description ?? item?.title ?? "Alert"),
                message: String(item?.first_ai_response ?? item?.response_content ?? ""),
                severity: inferSeverity(item?.severity ?? zbxRaw.severity),
                status: String(item?.status ?? (item?.acknowledged ? "acknowledged" : "active")),
                host: String(item?.host ?? ""),
                timestamp,
                acknowledged: Boolean(item?.acknowledged),
                eventid: String(item?.eventid ?? ""),
                organizationId: org?.id ?? null,
                organizationName: org?.name ?? "Unknown Organization",
                clientId,
              };
            });
            setRawAlerts(mapped);
          } else {
            setRawAlerts([]);
          }
        } else {
          setRawAlerts([]);
        }

        // Hosts parsing (unchanged)
        if (hostsRes?.ok) {
          const parsed = await safeParseResponse<unknown[]>(hostsRes, WEBHOOK_ZABBIX_HOSTS_URL);
          if (parsed.ok && Array.isArray(parsed.data)) {
            const mapped: GlobalHostItem[] = parsed.data.map((entry, index) => {
              const item = asRecord(entry);
              const groupsJson = asRecord(item.groups_json);
              const clientId = toNumberOrNull(item?.client_id ?? item?.clientId);
              const org = clientId ? orgMapByClientId.get(clientId) : undefined;
              const groups = Array.isArray(groupsJson.groups)
                ? groupsJson.groups.map((groupItem: unknown) => {
                    const groupRecord = asRecord(groupItem);
                    return String(groupRecord.name ?? groupItem ?? "");
                  })
                : [];
              return {
                hostid: String(item?.hostid ?? item?.id ?? `global-host-${index}`),
                host: String(groupsJson.ip ?? item?.host ?? "Unknown"),
                name: String(groupsJson.name ?? item?.name ?? "Host"),
                status: typeof item?.status === "number" ? item.status : Number(item?.status ?? 0),
                available: toNumberOrNull(item?.available) ?? undefined,
                groups,
                organizationId: org?.id ?? null,
                organizationName: org?.name ?? "Unknown Organization",
                clientId,
              };
            });
            setRawHosts(mapped);
          } else {
            setRawHosts([]);
          }
        } else {
          setRawHosts([]);
        }

        // Reports parsing ────────────────────────────────────────────────
        if (reportsRes?.ok) {
          const parsed = await safeParseResponse<unknown>(reportsRes, WEBHOOK_REPORTS_URL);
          if (parsed.ok && parsed.data != null) {
            const records = extractReportsRecords(parsed.data);
            const liteItems: GlobalReportLiteItem[] = [];
            const detailedItems: GlobalReportItem[] = [];

            for (let index = 0; index < records.length; index += 1) {
              const mapped = mapReportRecord(records[index], index, orgMapByClientId);
              liteItems.push(mapped.lite);
              if (reportsDetailsRequested) {
                detailedItems.push(mapped.detail);
              }
            }

            setRawReportRecords(records);
            setRawReportLiteItems(liteItems);
            if (reportsDetailsRequested) {
              setRawReportDetails(detailedItems);
            } else {
              setRawReportDetails([]);
            }
          } else {
            setRawReportRecords([]);
            setRawReportLiteItems([]);
            setRawReportDetails([]);
          }
        } else {
          setRawReportRecords([]);
          setRawReportLiteItems([]);
          setRawReportDetails([]);
        }

        // Insights parsing (unchanged)
        if (insightsRes?.ok) {
          const parsed = await safeParseResponse<unknown[]>(insightsRes, WEBHOOK_AI_INSIGHTS_URL);
          if (parsed.ok && Array.isArray(parsed.data)) {
            const mapped: GlobalInsightItem[] = parsed.data.map((entry, index) => {
              const item = asRecord(entry);
              const meta = asRecord(item.meta);
              const clientId = toNumberOrNull(
                item.client_id ?? item.clientId ?? meta.client_id ?? meta.clientId
              );
              const effectiveClientId = clientId ?? toNumberOrNull(meta.client_id ?? meta.clientId);
              const org = effectiveClientId ? orgMapByClientId.get(effectiveClientId) : undefined;
              const timestampValue = item.created_at ?? item.timestamp ?? item.time;
              const timestamp = toDateOrUndefined(timestampValue) ?? new Date();
              return {
                id: String(item?.id ?? item?.insight_id ?? `global-insight-${index}`),
                type: String(item?.type ?? item?.insight_type ?? item?.category ?? "insight"),
                title: String(item?.title ?? item?.name ?? "AI Insight"),
                summary: String(item?.summary ?? item?.description ?? item?.message ?? ""),
                severity: inferSeverity(item?.severity),
                timestamp,
                client_id: effectiveClientId ?? undefined,
                organizationId: org?.id ?? null,
                organizationName: org?.name ?? "Unknown Organization",
                clientId: effectiveClientId,
              };
            });
            setRawInsights(mapped);
          } else {
            setRawInsights([]);
          }
        } else {
          setRawInsights([]);
        }

        // Veeam Backup & Replication parsing
        if (veeamBackupRes?.ok) {
          const parsed = await safeParseResponse<unknown>(
            veeamBackupRes,
            WEBHOOK_BACKUP_REPLICATION_URL
          );
          if (parsed.ok && parsed.data) {
            const arr = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
            const mainObj = asRecord(arr[0]);
            const metaObj = asRecord(arr[1]);
            const matched = Array.isArray(mainObj.matched)
              ? (mainObj.matched as BackupReplicationData["matched"])
              : [];
            const warnings = Array.isArray(asRecord(mainObj.alerts).warnings)
              ? (asRecord(mainObj.alerts).warnings as unknown[])
              : [];
            const critical = Array.isArray(asRecord(mainObj.alerts).critical)
              ? (asRecord(mainObj.alerts).critical as unknown[])
              : [];
            setRawVeeamBackupData({
              summary: mainObj.summary ?? null,
              matched,
              alerts: { warnings, critical },
              statistics: mainObj.statistics ?? null,
              vmsWithoutJobs: Array.isArray(mainObj.vmsWithoutJobs)
                ? (mainObj.vmsWithoutJobs as BackupReplicationData["vmsWithoutJobs"])
                : [],
              jobsWithoutVMs: Array.isArray(mainObj.jobsWithoutVMs)
                ? (mainObj.jobsWithoutVMs as BackupReplicationData["jobsWithoutVMs"])
                : [],
              multiVMJobs: Array.isArray(mainObj.multiVMJobs)
                ? (mainObj.multiVMJobs as BackupReplicationData["multiVMJobs"])
                : [],
              replicas: Array.isArray(mainObj.replicas)
                ? (mainObj.replicas as BackupReplicationData["replicas"])
                : [],
              changes: metaObj.changes ?? null,
              changeSummary: metaObj.summary ?? null,
            });
          } else {
            setRawVeeamBackupData(null);
          }
        } else {
          setRawVeeamBackupData(null);
        }

        // Veeam Infrastructure parsing
        if (veeamInfraRes?.ok) {
          const parsed = await safeParseResponse<InfraVM[]>(
            veeamInfraRes,
            WEBHOOK_VEEAM_VMS_URL
          );
          if (parsed.ok && parsed.data) {
            const vms = Array.isArray(parsed.data) ? parsed.data : [parsed.data as unknown as InfraVM];
            setRawVeeamInfraVMs(vms);
          } else {
            setRawVeeamInfraVMs([]);
          }
        } else {
          setRawVeeamInfraVMs([]);
        }

        // Veeam Alarms parsing
        if (veeamAlarmsRes?.ok) {
          const parsed = await safeParseResponse<unknown[]>(
            veeamAlarmsRes,
            WEBHOOK_VEEAM_ALARMS_URL
          );
          if (parsed.ok && Array.isArray(parsed.data)) {
            const severityMap: Record<string, string> = {
              Error: "Critical",
              Warning: "Warning",
              Information: "Info",
              High: "High",
              Resolved: "Info",
            };

            const mappedAlarms: VeeamAlarmItem[] = [];
            for (let index = 0; index < parsed.data.length; index += 1) {
              const item = asRecord(parsed.data[index]);
              const outerKey = Object.keys(item)[0];
              if (!outerKey) continue;
              const inner = asRecord(item[outerKey]);
              if (!Object.keys(inner).length) continue;

              const rawDedupeKey = String(inner.dedupe_key ?? "").trim();
              const rawAlarmId = String(inner.triggered_alarm_id ?? "").trim();
              const dedupeKey = rawDedupeKey || rawAlarmId || `alarm-${outerKey}-${index}`;
              const alarmId = rawAlarmId || `${dedupeKey}-${index}`;

              const mappedSeverity = severityMap[outerKey] || "Unknown";
              const description = String(inner.description ?? "");
              const innerStatus = String(inner.status ?? "").trim();
              const isResolved =
                outerKey === "Resolved" ||
                innerStatus.toLowerCase() === "resolved" ||
                description.toLowerCase().includes("back to normal");

              mappedAlarms.push({
                client_id: toNumberOrNull(inner.client_id) ?? 0,
                alarm_id: alarmId,
                dedupe_key: `${dedupeKey}-${index}`,
                name: String(inner.alarm_name ?? ""),
                description,
                severity: mappedSeverity,
                status: isResolved ? "Resolved" : "Active",
                entity_type: String(inner.object_type ?? ""),
                entity_name: String(inner.object_name ?? ""),
                triggered_at: inner.triggered_time ? String(inner.triggered_time) : null,
                resolved_at: inner.resolved_at ? String(inner.resolved_at) : null,
                first_seen: inner.first_seen ? String(inner.first_seen) : null,
                last_seen: inner.last_seen ? String(inner.last_seen) : null,
                seen_count: toNumberOrNull(inner.repeat_count) ?? 0,
                times_sent: 0,
                reminder_interval: undefined,
                first_ai_response: inner.comment ? String(inner.comment) : undefined,
              });
            }

            setRawVeeamAlarmItems(mappedAlarms);
          } else {
            setRawVeeamAlarmItems([]);
          }
        } else {
          setRawVeeamAlarmItems([]);
        }

        setIsConnected(true);
        setLastUpdated(new Date());
      } catch (err) {
        if (!(err instanceof Error && err.name === "AbortError")) {
          setError(err instanceof Error ? err.message : "Failed to load global infrastructure metrics");
          setIsConnected(false);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [authenticatedFetch, enabled, orgMapByClientId, reportsDetailsRequested]
  );

  useEffect(() => {
    fetchAll(false);
  }, [fetchAll]);

  useEffect(() => {
    if (!enabled) return;
    intervalRef.current = setInterval(() => fetchAll(true), REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [enabled, fetchAll]);

  useEffect(() => {
    if (!reportsDetailsRequested) return;
    if (rawReportRecords.length === 0) {
      setRawReportDetails([]);
      return;
    }
    const detailedItems = new Array<GlobalReportItem>(rawReportRecords.length);
    for (let index = 0; index < rawReportRecords.length; index += 1) {
      detailedItems[index] = mapReportRecord(rawReportRecords[index], index, orgMapByClientId).detail;
    }
    setRawReportDetails(detailedItems);
  }, [reportsDetailsRequested, rawReportRecords, orgMapByClientId]);

  const orgScopeIds = useMemo(
    () => getOrgScope(organizations, scope, selectedOrgIds),
    [organizations, scope, selectedOrgIds]
  );

  const scopedOrgIdsSet = useMemo(() => {
    if (orgScopeIds.length === 0) return null;
    return new Set(orgScopeIds);
  }, [orgScopeIds]);

  const { from: rangeFrom, to: rangeTo } = useMemo(
    () => getTimeCutoff(timeRange, customDateFrom, customDateTo),
    [timeRange, customDateFrom, customDateTo]
  );

  const rangeFromMs = rangeFrom?.getTime();
  const rangeToMs = useMemo(() => {
    if (!rangeTo) return undefined;
    const end = new Date(rangeTo);
    end.setHours(23, 59, 59, 999);
    return end.getTime();
  }, [rangeTo]);

  const inScope = useCallback(
    (organizationId: string | null) => {
      if (!scopedOrgIdsSet) return true;
      if (!organizationId) return false;
      return scopedOrgIdsSet.has(organizationId);
    },
    [scopedOrgIdsSet]
  );

  const alerts = useMemo(
    () =>
      rawAlerts.filter(
        (item) => inScope(item.organizationId) && isWithinTimeRange(item.timestamp, rangeFrom, rangeTo)
      ),
    [rawAlerts, inScope, rangeFrom, rangeTo]
  );

  const hosts = useMemo(() => rawHosts.filter((item) => inScope(item.organizationId)), [rawHosts, inScope]);

  const filteredReportsMeta = useMemo(() => {
    const selectedIds = new Set<string>();
    const breakdownByOrg = new Map<
      string,
      { organizationName: string; total: number; daily: number; weekly: number }
    >();
    let total = 0;
    let daily = 0;
    let weekly = 0;
    let monthly = 0;

    for (let index = 0; index < rawReportLiteItems.length; index += 1) {
      const item = rawReportLiteItems[index];
      if (!inScope(item.organizationId)) continue;
      if (rangeFromMs != null && item.createdAtMs < rangeFromMs) continue;
      if (rangeToMs != null && item.createdAtMs > rangeToMs) continue;

      total += 1;
      selectedIds.add(item.id);

      if (item.reportType === "daily") daily += 1;
      else if (item.reportType === "weekly") weekly += 1;
      else if (item.reportType === "monthly") monthly += 1;

      const key = item.organizationId ?? "unknown";
      const existing = breakdownByOrg.get(key);
      if (!existing) {
        breakdownByOrg.set(key, {
          organizationName: item.organizationName,
          total: 1,
          daily: item.reportType === "daily" ? 1 : 0,
          weekly: item.reportType === "weekly" ? 1 : 0,
        });
      } else {
        existing.total += 1;
        if (item.reportType === "daily") existing.daily += 1;
        if (item.reportType === "weekly") existing.weekly += 1;
      }
    }

    return { total, daily, weekly, monthly, selectedIds, breakdownByOrg };
  }, [rawReportLiteItems, inScope, rangeFromMs, rangeToMs]);

  const reports = useMemo(() => {
    if (!reportsDetailsRequested) return [];
    if (filteredReportsMeta.selectedIds.size === 0) return [];

    const items: GlobalReportItem[] = [];
    for (let index = 0; index < rawReportDetails.length; index += 1) {
      const report = rawReportDetails[index];
      if (filteredReportsMeta.selectedIds.has(report.id)) {
        items.push(report);
      }
    }
    return items;
  }, [reportsDetailsRequested, rawReportDetails, filteredReportsMeta]);

  const insights = useMemo(
    () =>
      rawInsights.filter(
        (item) => inScope(item.organizationId) && isWithinTimeRange(item.timestamp, rangeFrom, rangeTo)
      ),
    [rawInsights, inScope, rangeFrom, rangeTo]
  );

  const filteredVeeam = useMemo(() => {
    const includeClientId = (clientId: number | null) => {
      if (!scopedOrgIdsSet) return true;
      if (clientId == null) return false;
      const org = orgMapByClientId.get(clientId);
      return Boolean(org && scopedOrgIdsSet.has(org.id));
    };

    const includeTimestamp = (value: unknown) => {
      const dt = toDateOrUndefined(value);
      if (!dt) return true;
      const ms = dt.getTime();
      if (rangeFromMs != null && ms < rangeFromMs) return false;
      if (rangeToMs != null && ms > rangeToMs) return false;
      return true;
    };

    const filterBrList = <T,>(list: T[], timeKeys: string[] = []) => {
      const next: T[] = [];
      for (let index = 0; index < list.length; index += 1) {
        const item = list[index];
        const clientId = extractClientIdFromBRPayload(item);
        if (!includeClientId(clientId)) continue;

        if (timeKeys.length > 0) {
          const record = asRecord(item);
          let hasTimeValue = false;
          let includeByTime = true;
          for (let i = 0; i < timeKeys.length; i += 1) {
            const rawTime = record[timeKeys[i]];
            if (rawTime == null || rawTime === "") continue;
            hasTimeValue = true;
            if (!includeTimestamp(rawTime)) includeByTime = false;
            break;
          }
          if (hasTimeValue && !includeByTime) continue;
        }

        next.push(item);
      }
      return next;
    };

    const jobs: GlobalVeeamJobItem[] = [];
    let brData: BackupReplicationData | null = null;

    if (rawVeeamBackupData) {
      const matchedRaw = Array.isArray(rawVeeamBackupData.matched)
        ? rawVeeamBackupData.matched
        : [];
      const matched: BackupReplicationData["matched"] = [];

      for (let vmIndex = 0; vmIndex < matchedRaw.length; vmIndex += 1) {
        const vmEntry = matchedRaw[vmIndex];
        const vmRecord = asRecord(vmEntry);
        const vmJobsRaw = Array.isArray(vmRecord.jobs) ? vmRecord.jobs : [];
        const vmClientId = extractClientIdFromBRPayload(vmEntry);
        const filteredJobs: unknown[] = [];

        for (let jobIndex = 0; jobIndex < vmJobsRaw.length; jobIndex += 1) {
          const job = vmJobsRaw[jobIndex];
          const jobRecord = asRecord(job);
          const jobClientId = extractClientIdFromBRPayload(job) ?? vmClientId;
          if (!includeClientId(jobClientId)) continue;
          if (!includeTimestamp(jobRecord.lastRun)) continue;
          filteredJobs.push(job);
        }

        if (filteredJobs.length === 0) continue;

        const nextVm = { ...vmRecord, jobs: filteredJobs } as unknown as BackupReplicationData["matched"][number];
        matched.push(nextVm);

        const vmJobs = mapVeeamJobFromMatchedEntry(nextVm, vmIndex, orgMapByClientId);
        for (let i = 0; i < vmJobs.length; i += 1) {
          jobs.push(vmJobs[i]);
        }
      }

      const brAlerts = asRecord(rawVeeamBackupData.alerts);
      const warnings = Array.isArray(brAlerts.warnings) ? brAlerts.warnings : [];
      const critical = Array.isArray(brAlerts.critical) ? brAlerts.critical : [];
      const jobsWithoutVMs = Array.isArray(rawVeeamBackupData.jobsWithoutVMs)
        ? rawVeeamBackupData.jobsWithoutVMs
        : [];
      const multiVMJobs = Array.isArray(rawVeeamBackupData.multiVMJobs)
        ? rawVeeamBackupData.multiVMJobs
        : [];

      brData = {
        ...rawVeeamBackupData,
        summary: null,
        matched,
        vmsWithoutJobs: filterBrList(
          Array.isArray(rawVeeamBackupData.vmsWithoutJobs)
            ? rawVeeamBackupData.vmsWithoutJobs
            : [],
          ["lastSeen"]
        ),
        jobsWithoutVMs: filterBrList(
          Array.isArray(rawVeeamBackupData.jobsWithoutVMs)
            ? rawVeeamBackupData.jobsWithoutVMs
            : [],
          ["lastRun"]
        ),
        multiVMJobs: filterBrList(
          Array.isArray(rawVeeamBackupData.multiVMJobs)
            ? rawVeeamBackupData.multiVMJobs
            : [],
          ["lastRun"]
        ),
        replicas: filterBrList(
          Array.isArray(rawVeeamBackupData.replicas) ? rawVeeamBackupData.replicas : [],
          ["lastSync"]
        ),
        alerts: {
          warnings: filterBrList(warnings, ["timestamp", "lastSeen", "created_at"]),
          critical: filterBrList(critical, ["timestamp", "lastSeen", "created_at"]),
        },
      };

      const filteredOrphanJobs = filterBrList(jobsWithoutVMs, ["lastRun"]);
      const filteredMultiVmJobs = filterBrList(multiVMJobs, ["lastRun"]);

      for (let index = 0; index < filteredOrphanJobs.length; index += 1) {
        jobs.push(
          mapStandaloneVeeamJob(
            filteredOrphanJobs[index],
            index,
            orgMapByClientId,
            "Orphan Veeam Job"
          )
        );
      }

      for (let index = 0; index < filteredMultiVmJobs.length; index += 1) {
        jobs.push(
          mapStandaloneVeeamJob(
            filteredMultiVmJobs[index],
            index,
            orgMapByClientId,
            "Multi-VM Veeam Job"
          )
        );
      }
    }

    const infraVMs: InfraVM[] = [];
    for (let index = 0; index < rawVeeamInfraVMs.length; index += 1) {
      const vm = rawVeeamInfraVMs[index] as unknown;
      const record = asRecord(vm);
      const clientId = toNumberOrNull(record.client_id ?? record.clientId);
      if (!includeClientId(clientId)) continue;
      infraVMs.push(vm as InfraVM);
    }

    const alarmItems: VeeamAlarmItem[] = [];
    for (let index = 0; index < rawVeeamAlarmItems.length; index += 1) {
      const alarm = rawVeeamAlarmItems[index];
      const clientId = toNumberOrNull(alarm.client_id);
      if (!includeClientId(clientId)) continue;
      if (!includeTimestamp(alarm.last_seen ?? alarm.triggered_at ?? alarm.first_seen)) continue;
      alarmItems.push(alarm);
    }

    return { brData, infraVMs, alarmItems, jobs };
  }, [
    rawVeeamBackupData,
    rawVeeamInfraVMs,
    rawVeeamAlarmItems,
    orgMapByClientId,
    scopedOrgIdsSet,
    rangeFromMs,
    rangeToMs,
  ]);

  const veeamJobs = filteredVeeam.jobs;

  const veeamAggregates = useMemo(() => {
    const ensureRow = (
      map: Map<
        string,
        {
          organizationId: string;
          organizationName: string;
          total: number;
          secondary: number;
          tertiary: number;
        }
      >,
      clientId: number | null
    ) => {
      const orgRef = resolveOrg(clientId);
      let row = map.get(orgRef.key);
      if (!row) {
        row = {
          organizationId: orgRef.organizationId,
          organizationName: orgRef.organizationName,
          total: 0,
          secondary: 0,
          tertiary: 0,
        };
        map.set(orgRef.key, row);
      }
      return row;
    };

    const rowsFromMap = (
      map: Map<
        string,
        {
          organizationId: string;
          organizationName: string;
          total: number;
          secondary: number;
          tertiary: number;
        }
      >
    ): CategoryBreakdownRow[] =>
      Array.from(map.values())
        .map((row) => ({
          organizationId: row.organizationId,
          organizationName: row.organizationName,
          total: row.total,
          secondary: row.secondary,
          tertiary: row.tertiary,
        }))
        .sort((a, b) => b.total - a.total || a.organizationName.localeCompare(b.organizationName));

    const sumRows = (rows: CategoryBreakdownRow[]) => {
      let total = 0;
      let secondary = 0;
      let tertiary = 0;
      for (let index = 0; index < rows.length; index += 1) {
        total += rows[index].total;
        secondary += rows[index].secondary;
        tertiary += rows[index].tertiary;
      }
      return { total, secondary, tertiary };
    };

    const resolveOrg = (clientId: number | null) => {
      if (clientId == null) {
        return {
          key: "unknown",
          organizationId: "unknown",
          organizationName: "Unknown Organization",
        };
      }

      const org = orgMapByClientId.get(clientId);
      if (org) {
        return {
          key: org.id,
          organizationId: org.id,
          organizationName: org.name,
        };
      }

      return {
        key: `unknown-${clientId}`,
        organizationId: `unknown-${clientId}`,
        organizationName: `Unknown Organization (${clientId})`,
      };
    };

    const backupMap = new Map<
      string,
      {
        organizationId: string;
        organizationName: string;
        total: number;
        secondary: number;
        tertiary: number;
      }
    >();
    const infrastructureMap = new Map<
      string,
      {
        organizationId: string;
        organizationName: string;
        total: number;
        secondary: number;
        tertiary: number;
      }
    >();
    const alarmsMap = new Map<
      string,
      {
        organizationId: string;
        organizationName: string;
        total: number;
        secondary: number;
        tertiary: number;
      }
    >();
    const combinedMap = new Map<
      string,
      {
        organizationId: string;
        organizationName: string;
        total: number;
        secondary: number;
        tertiary: number;
      }
    >();

    // Backup & Replication: Total / Success / Failed
    for (let index = 0; index < filteredVeeam.jobs.length; index += 1) {
      const job = filteredVeeam.jobs[index];
      const severity = String(job.severity).toLowerCase();
      const isSuccess = severity === "success";
      const row = ensureRow(backupMap, job.clientId ?? null);
      row.total += 1;
      row.secondary += isSuccess ? 1 : 0;
      row.tertiary += isSuccess ? 0 : 1;
    }

    // Infrastructure: Total / Protected / Unprotected
    for (let index = 0; index < filteredVeeam.infraVMs.length; index += 1) {
      const vm = filteredVeeam.infraVMs[index] as unknown as Record<string, unknown>;
      const clientId = toNumberOrNull(vm.client_id ?? vm.clientId);
      const metrics = asRecord(asRecord(vm.raw_json).vm_metrics);
      const isProtected = Boolean(metrics.isProtected);
      const row = ensureRow(infrastructureMap, clientId);
      row.total += 1;
      row.secondary += isProtected ? 1 : 0;
      row.tertiary += isProtected ? 0 : 1;
    }

    // Alarms: Total / Active / Resolved
    for (let index = 0; index < filteredVeeam.alarmItems.length; index += 1) {
      const alarm = filteredVeeam.alarmItems[index];
      const isResolved = String(alarm.status).toLowerCase() === "resolved";
      const row = ensureRow(alarmsMap, toNumberOrNull(alarm.client_id));
      row.total += 1;
      row.secondary += isResolved ? 0 : 1;
      row.tertiary += isResolved ? 1 : 0;
    }

    const backupRows = rowsFromMap(backupMap);
    const infrastructureRows = rowsFromMap(infrastructureMap);
    const alarmsRows = rowsFromMap(alarmsMap);

    // Combined summary for card: merge the three section row sets
    const mergeRows = (rows: CategoryBreakdownRow[]) => {
      for (let index = 0; index < rows.length; index += 1) {
        const row = rows[index];
        const existing = combinedMap.get(row.organizationId);
        if (!existing) {
          combinedMap.set(row.organizationId, {
            organizationId: row.organizationId,
            organizationName: row.organizationName,
            total: row.total,
            secondary: row.secondary,
            tertiary: row.tertiary,
          });
          continue;
        }
        existing.total += row.total;
        existing.secondary += row.secondary;
        existing.tertiary += row.tertiary;
      }
    };

    mergeRows(backupRows);
    mergeRows(infrastructureRows);
    mergeRows(alarmsRows);

    const combinedRows = rowsFromMap(combinedMap);
    const combined = sumRows(combinedRows);

    return {
      sectionBreakdowns: {
        backup: backupRows,
        infrastructure: infrastructureRows,
        alarms: alarmsRows,
      } as VeeamSectionBreakdowns,
      rows: combinedRows,
      total: combined.total,
      success: combined.secondary,
      failed: combined.tertiary,
    }
  }, [filteredVeeam, orgMapByClientId]);

  const veeamDrilldownData = useMemo<GlobalVeeamDrilldownData>(
    () => ({
      brData: filteredVeeam.brData,
      infraVMs: filteredVeeam.infraVMs,
      alarmItems: filteredVeeam.alarmItems,
      sectionBreakdowns: veeamAggregates.sectionBreakdowns,
      loading,
      error,
      lastUpdated,
    }),
    [filteredVeeam, veeamAggregates, loading, error, lastUpdated]
  );

  const summary = useMemo<GlobalMetricSummary>(
    () => ({
      alerts: {
        total: alerts.length,
        active: alerts.filter((a) => !a.acknowledged && a.status !== "resolved").length,
        critical: alerts.filter((a) => {
          const sev = a.severity.toLowerCase();
          return sev === "critical" || sev === "disaster";
        }).length,
      },
      hosts: {
        total: hosts.length,
        enabled: hosts.filter((h) => h.status === 0).length,
        disabled: hosts.filter((h) => h.status !== 0).length,
      },
      reports: {
        total: filteredReportsMeta.total,
        daily: filteredReportsMeta.daily,
        weekly: filteredReportsMeta.weekly,
        monthly: filteredReportsMeta.monthly,
      },
      insights: {
        total: insights.length,
        predictions: insights.filter((i) => typeOfInsight(i.type).includes("predict")).length,
        anomalies: insights.filter((i) => typeOfInsight(i.type).includes("anomal")).length,
      },
      veeam: {
        jobs: veeamAggregates.total,
        success: veeamAggregates.success,
        failed: veeamAggregates.failed,
      },
    }),
    [alerts, hosts, filteredReportsMeta, insights, veeamAggregates]
  );

  const buildBreakdown = useCallback(
    <T extends { organizationId: string | null; organizationName: string }>(
      rows: T[],
      mapper: (items: T[]) => { total: number; secondary: number; tertiary: number }
    ): CategoryBreakdownRow[] => {
      const grouped = new Map<string, T[]>();

      rows.forEach((row) => {
        const orgId = row.organizationId ?? "unknown";
        if (!grouped.has(orgId)) grouped.set(orgId, []);
        grouped.get(orgId)!.push(row);
      });

      return Array.from(grouped.entries())
        .map(([orgId, items]) => {
          const baseOrg =
            orgMapById.get(orgId) ??
            organizations.find((o) => o.name === items[0]?.organizationName);

          const metrics = mapper(items);

          return {
            organizationId: baseOrg?.id ?? orgId,
            organizationName:
              baseOrg?.name ?? String(items[0]?.organizationName ?? "Unknown Organization"),
            ...metrics,
          };
        })
        .sort((a, b) => b.total - a.total || a.organizationName.localeCompare(b.organizationName));
    },
    [orgMapById, organizations]
  );

  const alertsBreakdown = useMemo(
    () =>
      buildBreakdown(alerts, (items) => ({
        total: items.length,
        secondary: items.filter((a) => !a.acknowledged && a.status !== "resolved").length,
        tertiary: items.filter((a) => {
          const sev = String(a.severity).toLowerCase();
          return sev === "critical" || sev === "disaster";
        }).length,
      })),
    [alerts, buildBreakdown]
  );

  const hostsBreakdown = useMemo(
    () =>
      buildBreakdown(hosts, (items) => ({
        total: items.length,
        secondary: items.filter((h) => h.status === 0).length,
        tertiary: items.filter((h) => h.status !== 0).length,
      })),
    [hosts, buildBreakdown]
  );

  const reportsBreakdown = useMemo(() => {
    const rows: CategoryBreakdownRow[] = [];
    filteredReportsMeta.breakdownByOrg.forEach((metrics, orgIdKey) => {
      const baseOrg = orgMapById.get(orgIdKey);
      rows.push({
        organizationId: baseOrg?.id ?? orgIdKey,
        organizationName: baseOrg?.name ?? metrics.organizationName,
        total: metrics.total,
        secondary: metrics.daily,
        tertiary: metrics.weekly,
      });
    });
    return rows.sort((a, b) => b.total - a.total || a.organizationName.localeCompare(b.organizationName));
  }, [filteredReportsMeta, orgMapById]);

  const insightsBreakdown = useMemo(
    () =>
      buildBreakdown(insights, (items) => ({
        total: items.length,
        secondary: items.filter((i) => typeOfInsight(i.type).includes("predict")).length,
        tertiary: items.filter((i) => typeOfInsight(i.type).includes("anomal")).length,
      })),
    [insights, buildBreakdown]
  );

  const veeamBreakdown = useMemo(() => veeamAggregates.rows, [veeamAggregates]);

  return {
    loading,
    error,
    isConnected,
    lastUpdated,
    refresh: () => fetchAll(false),
    summary,
    alerts,
    hosts,
    reports,
    insights,
    veeamJobs,
    veeamDrilldownData,
    alertsBreakdown,
    hostsBreakdown,
    reportsBreakdown,
    insightsBreakdown,
    veeamBreakdown,
  };
};

export default useGlobalInfrastructureMetrics;
