/**
 * Super Admin Organization Details Hook
 * Provides detailed data for each drilldown category
 * Lazy-loads data only when a category is selected
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import {
  WEBHOOK_ALERTS_URL,
  WEBHOOK_ZABBIX_HOSTS_URL,
  WEBHOOK_REPORTS_URL,
  WEBHOOK_AI_INSIGHTS_URL,
  WEBHOOK_BACKUP_REPLICATION_URL,
} from "@/config/env";

// Reuse existing endpoint patterns
const ENDPOINTS = {
  alerts: WEBHOOK_ALERTS_URL,
  hosts: WEBHOOK_ZABBIX_HOSTS_URL,
  reports: WEBHOOK_REPORTS_URL,
  insights: WEBHOOK_AI_INSIGHTS_URL,
  veeam: WEBHOOK_BACKUP_REPLICATION_URL,
};

export type DrilldownCategory =
  | "alerts"
  | "hosts"
  | "reports"
  | "insights"
  | "veeam"
  | "users"
  | null;

export interface AlertItem {
  id: string;
  eventid?: string;
  title: string;
  message?: string;
  severity: string;
  status: string;
  host?: string;
  timestamp: Date;
  acknowledged?: boolean;
}
export interface HostItem {
  hostid: string;
  host: string; // hostname/ip
  name: string; // display name
  status: number;
  available?: number;
  groups?: string[];
  lastAccess?: Date;
}

export interface ReportItem {
  id: string;
  name: string;
  report_type: string;
  status: string;
  created_at: Date;
  client_id?: number;
}

export interface InsightItem {
  id: string;
  type: string;
  title: string;
  summary: string;
  severity?: string;
  timestamp: Date;
  client_id?: number;
}

export interface VeeamJobItem {
  id: string;
  name: string;
  type?: string;
  severity: string;
  lastRun?: Date;
  nextRun?: Date;
  status?: string;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: Date;
}

interface CategoryData<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

interface UseOrganizationDetailsOptions {
  clientId: number | null;
  enabled?: boolean;
}

interface UseOrganizationDetailsReturn {
  selectedCategory: DrilldownCategory;
  setSelectedCategory: (category: DrilldownCategory) => void;
  alerts: CategoryData<AlertItem>;
  hosts: CategoryData<HostItem>;
  reports: CategoryData<ReportItem>;
  insights: CategoryData<InsightItem>;
  veeam: CategoryData<VeeamJobItem>;
  users: CategoryData<UserItem>;
  refreshCategory: (category: DrilldownCategory) => Promise<void>;
}

const initialCategoryData = <T,>(): CategoryData<T> => ({
  items: [],
  loading: false,
  error: null,
  lastFetched: null,
});

// --- helpers (alerts mapping) ---
const normalizeSeverity = (value: any): string => {
  const s = String(value ?? "").trim();
  if (!s) return "info";
  return s.toLowerCase();
};

const extractHostFromAiText = (text?: string): string | undefined => {
  if (!text) return undefined;

  // Matches: **Host:** MXO_VMASTER
  const m = text.match(/\*\*Host:\*\*\s*([^\n\r]+)/i);
  if (m?.[1]) return m[1].trim();

  // Fallback: "Host:" MXO_VMASTER
  const m2 = text.match(/Host:\s*([^\n\r]+)/i);
  if (m2?.[1]) return m2[1].trim();

  return undefined;
};

const safeDate = (value: any): Date => {
  if (!value) return new Date();
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
};

const safeString = (v: unknown): string => (typeof v === "string" ? v : "");

const decodeCommonEntities = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const extractHtmlTitle = (htmlRaw: unknown): string | null => {
  const html = decodeCommonEntities(safeString(htmlRaw));
  if (!html) return null;

  const titleMatch = html.match(/<title>([^<]{1,200})<\/title>/i);
  if (titleMatch?.[1]?.trim()) return titleMatch[1].trim();

  const h2Match = html.match(
    /class=["']report-title["'][^>]*>\s*([^<]{1,200})\s*</i
  );
  if (h2Match?.[1]?.trim()) return h2Match[1].trim();

  const h1Company = html
    .match(/class=["']company-name["'][^>]*>\s*([^<]{1,200})\s*</i)?.[1]
    ?.trim();
  if (h1Company) return `${h1Company} Report`;

  return null;
};

// --- helpers (insights mapping) ---
const toNumberOrNull = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const getClientIdFromAny = (obj: any): number | null => {
  if (!obj) return null;
  // direct
  const direct = toNumberOrNull(obj.client_id ?? obj.clientId);
  if (direct != null) return direct;

  // nested common patterns
  const nested =
    toNumberOrNull(obj.meta?.client_id) ??
    toNumberOrNull(obj.meta?.clientId) ??
    toNumberOrNull(obj.organization?.client_id) ??
    toNumberOrNull(obj.organization?.clientId) ??
    toNumberOrNull(obj.org?.client_id) ??
    toNumberOrNull(obj.org?.clientId);

  return nested ?? null;
};

const inferInsightType = (rawType: string, text: string): string => {
  const t = (rawType || "").toLowerCase();
  const blob = `${t} ${text}`.toLowerCase();

  if (blob.includes("predict")) return "prediction";
  if (blob.includes("anomal")) return "anomaly";
  if (blob.includes("recommend")) return "recommendation";
  return t || "insight";
};

const pickInsightTimestamp = (i: any): Date => {
  // supports clock seconds (zabbix-like), or normal timestamps
  const clock =
    i?.clock ??
    i?.zbx_raw?.clock ??
    i?.zabbix?.clock ??
    i?.raw_event?.clock ??
    i?.event?.clock;

  if (clock && Number.isFinite(Number(clock))) {
    return new Date(Number(clock) * 1000);
  }

  return safeDate(
    i?.created_at ??
      i?.timestamp ??
      i?.time ??
      i?.updated_at ??
      i?.first_seen ??
      i?.last_seen_at
  );
};

export const useOrganizationDetails = (
  options: UseOrganizationDetailsOptions
): UseOrganizationDetailsReturn => {
  const { clientId, enabled = true } = options;
  const { authenticatedFetch } = useAuthenticatedFetch();

  const [selectedCategory, setSelectedCategory] =
    useState<DrilldownCategory>(null);

  const [alerts, setAlerts] =
    useState<CategoryData<AlertItem>>(initialCategoryData);
  const [hosts, setHosts] =
    useState<CategoryData<HostItem>>(initialCategoryData);
  const [reports, setReports] =
    useState<CategoryData<ReportItem>>(initialCategoryData);
  const [insights, setInsights] =
    useState<CategoryData<InsightItem>>(initialCategoryData);
  const [veeam, setVeeam] =
    useState<CategoryData<VeeamJobItem>>(initialCategoryData);
  const [users, setUsers] =
    useState<CategoryData<UserItem>>(initialCategoryData);

  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ Fetch alerts details (fixed mapping for /webhook/ai/insights)
  const fetchAlerts = useCallback(async () => {
    if (!clientId || !enabled) return;

    setAlerts((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authenticatedFetch(ENDPOINTS.alerts, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });

      if (!response.ok) throw new Error("Failed to fetch alerts");

      const data = await response.json();
      const rawAlerts = Array.isArray(data) ? data : [];
      const orgAlerts = rawAlerts.filter((a: any) => a?.client_id === clientId);

      const items: AlertItem[] = orgAlerts.map((a: any) => {
        const zbx = a?.zbx_raw ?? {};
        const rawEvent = zbx?.raw_event ?? {};

        const eventId =
          String(
            zbx?.eventid ??
              rawEvent?.eventid ??
              a?.eventid ??
              a?.id ??
              a?.ai_response_id ??
              ""
          ).trim() ||
          `alert_${clientId}_${Math.random().toString(16).slice(2)}`;

        const hostFromAi =
          extractHostFromAiText(a?.first_ai_response) ||
          extractHostFromAiText(a?.response_content);

        const title =
          String(
            zbx?.problem_name ??
              zbx?.description ??
              rawEvent?.name ??
              a?.problem_name ??
              a?.description ??
              a?.title ??
              a?.name ??
              ""
          ).trim() || "Alert";

        const severity = normalizeSeverity(
          zbx?.severity ?? rawEvent?.severity ?? a?.severity ?? "info"
        );

        // Prefer zabbix clock if present, else created/first_seen/last_seen
        const ts = zbx?.clock
          ? new Date(Number(zbx.clock) * 1000)
          : safeDate(
              a?.created_at ?? a?.first_seen ?? a?.last_seen_at ?? a?.updated_at
            );

        return {
          id: eventId,
          eventid: String(zbx?.eventid ?? rawEvent?.eventid ?? a?.eventid ?? ""),
          title,
          // keep raw AI response searchable (but UI only displays title + host)
          message: (
            a?.first_ai_response ??
            a?.response_content ??
            a?.zbx_raw?.description ??
            ""
          ).toString(),
          severity,
          // No explicit "resolved" field in sample; default to active unless user has ack logic
          status: a?.acknowledged ? "acknowledged" : a?.status ?? "active",
          host: hostFromAi,
          timestamp: ts,
          acknowledged: Boolean(a?.acknowledged),
        };
      });

      setAlerts({
        items,
        loading: false,
        error: null,
        lastFetched: new Date(),
      });
    } catch (err) {
      setAlerts((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch alerts",
      }));
    }
  }, [clientId, enabled, authenticatedFetch]);

  // ✅ Fetch hosts details (FIXED: map from groups_json)
  const fetchHosts = useCallback(async () => {
    if (!clientId || !enabled) return;

    setHosts((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authenticatedFetch(ENDPOINTS.hosts, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });

      if (!response.ok) throw new Error("Failed to fetch hosts");

      const data = await response.json();
      const rawHosts = Array.isArray(data) ? data : [];
      const orgHosts = rawHosts.filter((h: any) => h?.client_id === clientId);

      const items: HostItem[] = orgHosts.map((h: any, idx: number) => {
        const gj = h?.groups_json || {};
        const hostId =
          safeString(gj.hostId) || safeString(h.hostid) || safeString(h.id);
        const ip =
          safeString(gj.ip) ||
          safeString(h.ip) ||
          safeString(h.host) ||
          safeString(h.hostname);
        const name = safeString(gj.name) || safeString(h.name) || ip || "Host";

        const groupsArr = Array.isArray(gj.groups)
          ? gj.groups
          : Array.isArray(h.groups)
          ? h.groups
          : [];
        const groups = groupsArr
          .map((g: any) => (typeof g === "string" ? g : safeString(g?.name)))
          .filter(Boolean);

        return {
          hostid: hostId || `${clientId}-${idx}`,
          host: ip || "Unknown",
          name,
          status: typeof h.status === "number" ? h.status : 0,
          available: h.available,
          groups,
          lastAccess: h.last_access ? new Date(h.last_access) : undefined,
        };
      });

      setHosts({ items, loading: false, error: null, lastFetched: new Date() });
    } catch (err) {
      setHosts((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch hosts",
      }));
    }
  }, [clientId, enabled, authenticatedFetch]);

  // Fetch reports details (already fixed)
  const fetchReports = useCallback(async () => {
    if (!clientId || !enabled) return;

    setReports((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authenticatedFetch(ENDPOINTS.reports, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });

      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();
      const rawReports = Array.isArray(data) ? data : [];

      const orgReports = rawReports.some((r: any) => r?.client_id != null)
        ? rawReports.filter((r: any) => r.client_id === clientId)
        : rawReports;

      const items: ReportItem[] = orgReports.map((r: any, idx: number) => {
        const htmlTitle = extractHtmlTitle(r.report_template);
        const fallbackName =
          safeString(r.name).trim() ||
          safeString(r.title).trim() ||
          htmlTitle ||
          "Report";

        const createdAt = r.created_at ? new Date(r.created_at) : new Date();

        return {
          id:
            safeString(r.id).trim() ||
            safeString(r.report_id).trim() ||
            `${clientId}-${safeString(r.report_type) || "report"}-${createdAt.getTime()}-${idx}`,
          name: fallbackName,
          report_type: safeString(r.report_type) || "daily",
          status: safeString(r.status) || "completed",
          created_at: createdAt,
          client_id: r.client_id,
        };
      });

      setReports({ items, loading: false, error: null, lastFetched: new Date() });
    } catch (err) {
      setReports((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch reports",
      }));
    }
  }, [clientId, enabled, authenticatedFetch]);

  // ✅ Fetch insights details (UPDATED mapping for /webhook/agent-insights)
  const fetchInsights = useCallback(async () => {
    if (!clientId || !enabled) return;

    setInsights((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authenticatedFetch(ENDPOINTS.insights, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });

      if (!response.ok) throw new Error("Failed to fetch insights");

      const data = await response.json();
      const rawInsights = Array.isArray(data) ? data : [];

      // More robust filtering: handles number/string + nested client id
      const orgInsights = rawInsights.filter((i: any) => {
        const cid = getClientIdFromAny(i);
        // if payload has no client_id at all, allow it (backend might already scope)
        if (cid == null) return true;
        return cid === clientId;
      });

      const items: InsightItem[] = orgInsights.map((i: any, idx: number) => {
        const titleRaw =
          safeString(i?.title) ||
          safeString(i?.name) ||
          safeString(i?.problem_name) ||
          safeString(i?.zbx_raw?.problem_name) ||
          safeString(i?.summary_title);

        const summaryRaw =
          safeString(i?.summary) ||
          safeString(i?.description) ||
          safeString(i?.message) ||
          safeString(i?.details) ||
          safeString(i?.first_ai_response) ||
          safeString(i?.response_content) ||
          safeString(i?.content);

        const title = (titleRaw || "AI Insight").trim();
        const summary = decodeCommonEntities(summaryRaw).trim();

        const rawType =
          safeString(i?.type) ||
          safeString(i?.insight_type) ||
          safeString(i?.category) ||
          safeString(i?.kind);

        const computedType = inferInsightType(rawType, `${title} ${summary}`);

        const ts = pickInsightTimestamp(i);
        const severity = normalizeSeverity(i?.severity ?? i?.level ?? i?.priority ?? "");

        const id =
          safeString(i?.id).trim() ||
          safeString(i?.insight_id).trim() ||
          safeString(i?.ai_response_id).trim() ||
          `${clientId}-insight-${computedType}-${ts.getTime()}-${idx}`;

        return {
          id,
          type: computedType,
          title,
          summary,
          severity,
          timestamp: ts,
          client_id: getClientIdFromAny(i) ?? undefined,
        };
      });

      setInsights({ items, loading: false, error: null, lastFetched: new Date() });
    } catch (err) {
      setInsights((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch insights",
      }));
    }
  }, [clientId, enabled, authenticatedFetch]);

  // Fetch veeam jobs details
  const fetchVeeam = useCallback(async () => {
    if (!clientId || !enabled) return;

    setVeeam((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authenticatedFetch(ENDPOINTS.veeam, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        const rawJobs = Array.isArray(data) ? data : [];

        const items: VeeamJobItem[] = rawJobs.map((j: any) => ({
          id: j.id || j.jobId || String(Math.random()),
          name: j.name || j.jobName || "Unnamed Job",
          type: j.type || j.jobType,
          severity: j.severity || j.status || "unknown",
          lastRun: j.lastRun ? new Date(j.lastRun) : undefined,
          nextRun: j.nextRun ? new Date(j.nextRun) : undefined,
          status: j.status,
        }));

        setVeeam({ items, loading: false, error: null, lastFetched: new Date() });
      } else {
        throw new Error("Failed to fetch Veeam jobs");
      }
    } catch (err) {
      setVeeam((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch Veeam jobs",
      }));
    }
  }, [clientId, enabled, authenticatedFetch]);

  // Fetch users (mock)
  const fetchUsers = useCallback(async () => {
    if (!clientId || !enabled) return;

    setUsers((prev) => ({ ...prev, loading: true, error: null }));

    setTimeout(() => {
      const mockUsers: UserItem[] = [
        { id: "1", name: "Admin User", email: "admin@org.com", role: "admin", status: "active" },
        { id: "2", name: "Power User", email: "power@org.com", role: "user", status: "active" },
        { id: "3", name: "Viewer", email: "viewer@org.com", role: "viewer", status: "inactive" },
      ];

      setUsers({ items: mockUsers, loading: false, error: null, lastFetched: new Date() });
    }, 500);
  }, [clientId, enabled]);

  const refreshCategory = useCallback(
    async (category: DrilldownCategory) => {
      if (!category) return;

      switch (category) {
        case "alerts":
          await fetchAlerts();
          break;
        case "hosts":
          await fetchHosts();
          break;
        case "reports":
          await fetchReports();
          break;
        case "insights":
          await fetchInsights();
          break;
        case "veeam":
          await fetchVeeam();
          break;
        case "users":
          await fetchUsers();
          break;
      }
    },
    [fetchAlerts, fetchHosts, fetchReports, fetchInsights, fetchVeeam, fetchUsers]
  );

  useEffect(() => {
    if (!selectedCategory || !clientId || !enabled) return;

    const shouldFetch = (data: CategoryData<any>) =>
      !data.lastFetched || data.items.length === 0;

    switch (selectedCategory) {
      case "alerts":
        if (shouldFetch(alerts)) fetchAlerts();
        break;
      case "hosts":
        if (shouldFetch(hosts)) fetchHosts();
        break;
      case "reports":
        if (shouldFetch(reports)) fetchReports();
        break;
      case "insights":
        if (shouldFetch(insights)) fetchInsights();
        break;
      case "veeam":
        if (shouldFetch(veeam)) fetchVeeam();
        break;
      case "users":
        if (shouldFetch(users)) fetchUsers();
        break;
    }
  }, [selectedCategory, clientId, enabled]);

  useEffect(() => {
    setAlerts(initialCategoryData());
    setHosts(initialCategoryData());
    setReports(initialCategoryData());
    setInsights(initialCategoryData());
    setVeeam(initialCategoryData());
    setUsers(initialCategoryData());
  }, [clientId]);

  return {
    selectedCategory,
    setSelectedCategory,
    alerts,
    hosts,
    reports,
    insights,
    veeam,
    users,
    refreshCategory,
  };
};

export default useOrganizationDetails;
