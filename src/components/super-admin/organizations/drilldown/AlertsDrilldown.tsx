/**
 * Alerts Drilldown Component
 * Super Admin wrapper around the user-dashboard Alerts table/drawer UI.
 * Data fetching and filter semantics stay unchanged.
 */
import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCw, Search, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlertsTable, { type Alert as DashboardAlert } from "@/components/alerts/AlertsTable";
import type { AlertSeverity } from "@/components/alerts/SeverityBadge";
import { AlertItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";

interface AlertsDrilldownProps {
  orgName: string;
  alerts: AlertItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onItemClick?: (item: AlertItem) => void;
}

type AlertFilter = "all" | "active" | "critical" | "acknowledged";

const ALL_SEVERITIES: AlertSeverity[] = [
  "disaster",
  "critical",
  "high",
  "warning",
  "average",
  "info",
];

const toAlertSeverity = (severity: string): AlertSeverity => {
  const value = severity.toLowerCase();
  if (value.includes("disaster")) return "disaster";
  if (value.includes("critical")) return "critical";
  if (value.includes("high")) return "high";
  if (value.includes("warning")) return "warning";
  if (value.includes("average")) return "average";
  return "info";
};

const toDashboardStatus = (
  status: string,
  acknowledged: boolean
): "active" | "acknowledged" | "resolved" => {
  const value = status.toLowerCase();
  if (value.includes("resolved")) return "resolved";
  if (acknowledged || value.includes("ack")) return "acknowledged";
  return "active";
};

const inferCategory = (item: AlertItem) => {
  const blob = `${item.title ?? ""} ${item.message ?? ""}`.toLowerCase();
  if (blob.includes("cpu")) return "CPU";
  if (blob.includes("memory")) return "Memory";
  if (blob.includes("disk")) return "Disk";
  if (blob.includes("network")) return "Network";
  if (blob.includes("service")) return "Service";
  if (blob.includes("vm")) return "VMware";
  return "System";
};

const formatDuration = (timestamp: Date) => {
  const diffMs = Math.max(0, Date.now() - timestamp.getTime());
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) return `${diffMins}m`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
};

const toStableNumericId = (item: AlertItem, index: number) => {
  const numeric = Number(item.eventid ?? item.id);
  if (Number.isFinite(numeric)) return numeric;
  const source = `${item.id}-${item.timestamp.getTime()}-${index}`;
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const AlertsDrilldown = ({ orgName, alerts, loading, error, onRefresh }: AlertsDrilldownProps) => {
  const [filter, setFilter] = useState<AlertFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAlerts = useMemo(() => {
    let result = alerts;

    switch (filter) {
      case "active":
        result = result.filter((a) => a.status === "active" || !a.acknowledged);
        break;
      case "critical":
        result = result.filter((a) => a.severity === "critical" || a.severity === "disaster");
        break;
      case "acknowledged":
        result = result.filter((a) => a.acknowledged);
        break;
      default:
        break;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((a) => {
        const title = (a.title || "").toLowerCase();
        const host = (a.host || "").toLowerCase();
        const msg = (a.message || "").toLowerCase();
        return title.includes(query) || host.includes(query) || msg.includes(query);
      });
    }

    return [...result].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [alerts, filter, searchQuery]);

  const counts = useMemo(
    () => ({
      all: alerts.length,
      active: alerts.filter((a) => a.status === "active" || !a.acknowledged).length,
      critical: alerts.filter((a) => a.severity === "critical" || a.severity === "disaster").length,
      acknowledged: alerts.filter((a) => a.acknowledged).length,
    }),
    [alerts]
  );

  const dashboardAlerts = useMemo<DashboardAlert[]>(
    () =>
      filteredAlerts.map((item, index) => ({
        id: toStableNumericId(item, index),
        severity: toAlertSeverity(item.severity),
        host: item.host || "unknown-host",
        category: inferCategory(item),
        problem: item.title,
        duration: formatDuration(item.timestamp),
        acknowledged: Boolean(item.acknowledged),
        status: toDashboardStatus(item.status, Boolean(item.acknowledged)),
        timestamp: item.timestamp.toLocaleString(),
        aiInsights: item.message || "",
        firstSeen: item.timestamp.toISOString(),
        lastSeen: item.timestamp.toISOString(),
        rawMetadata: {
          eventid: item.eventid,
          severity: item.severity,
        },
      })),
    [filteredAlerts]
  );

  if (error) {
    return (
      <Card className="p-6 border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-medium">Failed to load alerts</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} className="ml-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Alerts for {orgName}
          </h3>
          <p className="text-sm text-muted-foreground">Monitoring alerts and issues for this organization</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as AlertFilter)} className="flex-shrink-0">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="text-xs">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Active ({counts.active})
            </TabsTrigger>
            <TabsTrigger value="critical" className="text-xs">
              Critical ({counts.critical})
            </TabsTrigger>
            <TabsTrigger value="acknowledged" className="text-xs">
              Ack ({counts.acknowledged})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
      </div>

      <AlertsTable
        alerts={dashboardAlerts}
        loading={loading}
        selectedSeverities={ALL_SEVERITIES}
        showAcknowledged
        searchQuery=""
      />
    </div>
  );
};

export default AlertsDrilldown;
