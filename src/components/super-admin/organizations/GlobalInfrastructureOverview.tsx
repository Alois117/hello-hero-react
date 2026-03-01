import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle,
  ChevronDown,
  FileText,
  HardDrive,
  RefreshCw,
  Server,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  type CategoryBreakdownRow,
  type GlobalAlertItem,
  type GlobalHostItem,
  type GlobalInsightItem,
  type GlobalReportItem,
  type GlobalVeeamDrilldownData,
  type GlobalMetricSummary,
  requestGlobalReportsDetails,
  type GlobalVeeamJobItem,
} from "@/hooks/super-admin/organizations/useGlobalInfrastructureMetrics";
import type {
  AlertItem,
  HostItem,
  InsightItem,
  ReportItem,
  VeeamJobItem,
  DrilldownCategory,
} from "@/hooks/super-admin/organizations/useOrganizationDetails";
import TablePagination from "@/components/ui/table-pagination";
import ZabbixMetricsDrilldown from "./drilldown/ZabbixMetricsDrilldown";
import ReportsDrilldown from "./drilldown/ReportsDrilldown";
import InsightsDrilldown from "./drilldown/InsightsDrilldown";
import VeeamMetricsDrilldown, { type VeeamSectionTab } from "./VeeamMetricsDrilldown";
import { DrilldownDetailDrawer } from "./drilldown/detail";

type GlobalCardCategory = "zabbix_metrics" | "reports" | "insights" | "veeam";

interface GlobalInfrastructureOverviewProps {
  loading: boolean;
  error: string | null;
  summary: GlobalMetricSummary;
  alerts: GlobalAlertItem[];
  hosts: GlobalHostItem[];
  reports: GlobalReportItem[];
  insights: GlobalInsightItem[];
  veeamDrilldownData: GlobalVeeamDrilldownData;
  veeamJobs: GlobalVeeamJobItem[];
  alertsBreakdown: CategoryBreakdownRow[];
  hostsBreakdown: CategoryBreakdownRow[];
  reportsBreakdown: CategoryBreakdownRow[];
  insightsBreakdown: CategoryBreakdownRow[];
  veeamBreakdown: CategoryBreakdownRow[];
  organizationSearchQuery: string;
  onRefresh: () => void;
}

interface ClickableMetricCardProps {
  title: string;
  icon: React.ElementType;
  loading: boolean;
  iconColor?: string;
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const BREAKDOWN_PAGE_SIZE = 8;

const ClickableMetricCard = ({
  title,
  icon: Icon,
  loading,
  iconColor = "text-primary",
  isSelected,
  onClick,
  children,
}: ClickableMetricCardProps) => (
  <Card
    className={`
      p-4 border-border/50 transition-all duration-200 cursor-pointer
      hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 hover:bg-muted/30
      ${isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : ""}
    `}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : iconColor}`} />
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
      <ChevronDown
        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
          isSelected ? "rotate-180 text-primary" : ""
        }`}
      />
    </div>
    {loading ? (
      <div className="space-y-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
    ) : (
      children
    )}
  </Card>
);

const GlobalInfrastructureOverview = ({
  loading,
  error,
  summary,
  alerts,
  hosts,
  reports,
  insights,
  veeamDrilldownData,
  veeamJobs,
  alertsBreakdown,
  hostsBreakdown,
  reportsBreakdown,
  insightsBreakdown,
  veeamBreakdown,
  organizationSearchQuery,
  onRefresh,
}: GlobalInfrastructureOverviewProps) => {
  const [selectedCategory, setSelectedCategory] = useState<GlobalCardCategory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    AlertItem | HostItem | ReportItem | InsightItem | VeeamJobItem | null
  >(null);
  const [breakdownPage, setBreakdownPage] = useState(1);
  const [reportsDetailsRequested, setReportsDetailsRequested] = useState(false);
  const [activeVeeamSection, setActiveVeeamSection] = useState<VeeamSectionTab>("backup");

  useEffect(() => {
    setBreakdownPage(1);
  }, [selectedCategory, organizationSearchQuery]);

  // ✅ FIX: request details + immediately refetch so report list populates right away
  useEffect(() => {
    if (selectedCategory !== "reports") return;
    if (reportsDetailsRequested) return;
    requestGlobalReportsDetails();
    setReportsDetailsRequested(true);
    onRefresh(); // important to populate details immediately
  }, [selectedCategory, reportsDetailsRequested, onRefresh]);

  const handleCardClick = (category: GlobalCardCategory) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
    if (category === "veeam") {
      setActiveVeeamSection("backup");
    }
    setSelectedItem(null);
    setDrawerOpen(false);
  };

  const breakdownMeta = useMemo(() => {
    const query = organizationSearchQuery.trim().toLowerCase();
    const filterRows = (rows: CategoryBreakdownRow[]) =>
      !query ? rows : rows.filter((row) => row.organizationName.toLowerCase().includes(query));

    switch (selectedCategory) {
      case "zabbix_metrics": {
        const merged = new Map<string, CategoryBreakdownRow>();
        alertsBreakdown.forEach((row) => {
          merged.set(row.organizationId, { ...row });
        });
        hostsBreakdown.forEach((hostRow) => {
          const existing = merged.get(hostRow.organizationId);
          if (!existing) {
            merged.set(hostRow.organizationId, {
              organizationId: hostRow.organizationId,
              organizationName: hostRow.organizationName,
              total: hostRow.total,
              secondary: hostRow.secondary,
              tertiary: hostRow.tertiary,
            });
            return;
          }
          merged.set(hostRow.organizationId, {
            ...existing,
            total: existing.total + hostRow.total,
            secondary: existing.secondary + hostRow.secondary,
            tertiary: existing.tertiary + hostRow.tertiary,
          });
        });
        return {
          title: "Zabbix Metrics Breakdown by Organization",
          secondaryLabel: "Active",
          tertiaryLabel: "Critical",
          rows: filterRows(Array.from(merged.values())),
        };
      }
      case "reports":
        return {
          title: "Reports Breakdown by Organization",
          secondaryLabel: "Daily",
          tertiaryLabel: "Weekly",
          rows: filterRows(reportsBreakdown),
        };
      case "insights":
        return {
          title: "Insights Breakdown by Organization",
          secondaryLabel: "Predictions",
          tertiaryLabel: "Anomalies",
          rows: filterRows(insightsBreakdown),
        };
      case "veeam":
        {
          const sectionBreakdowns = veeamDrilldownData.sectionBreakdowns;
          const backupRows = sectionBreakdowns?.backup ?? veeamBreakdown;
          const infrastructureRows = sectionBreakdowns?.infrastructure ?? [];
          const alarmsRows = sectionBreakdowns?.alarms ?? [];

          if (activeVeeamSection === "infrastructure") {
            return {
              title: "Veeam Infrastructure Breakdown by Organization",
              secondaryLabel: "Protected",
              tertiaryLabel: "Unprotected",
              rows: filterRows(infrastructureRows),
            };
          }

          if (activeVeeamSection === "alarms") {
            return {
              title: "Veeam Alarms Breakdown by Organization",
              secondaryLabel: "Active",
              tertiaryLabel: "Resolved",
              rows: filterRows(alarmsRows),
            };
          }

          return {
            title: "Veeam Backup & Replication Breakdown by Organization",
            secondaryLabel: "Success",
            tertiaryLabel: "Failed",
            rows: filterRows(backupRows),
          };
        }
      default:
        return null;
    }
  }, [
    selectedCategory,
    activeVeeamSection,
    organizationSearchQuery,
    alertsBreakdown,
    hostsBreakdown,
    reportsBreakdown,
    insightsBreakdown,
    veeamDrilldownData.sectionBreakdowns,
    veeamBreakdown,
  ]);

  const paginatedBreakdown = useMemo(() => {
    if (!breakdownMeta) return [];
    const start = (breakdownPage - 1) * BREAKDOWN_PAGE_SIZE;
    return breakdownMeta.rows.slice(start, start + BREAKDOWN_PAGE_SIZE);
  }, [breakdownMeta, breakdownPage]);

  const totalBreakdownPages = breakdownMeta
    ? Math.max(1, Math.ceil(breakdownMeta.rows.length / BREAKDOWN_PAGE_SIZE))
    : 1;

  const drawerCategory: DrilldownCategory = useMemo(() => {
    if (!selectedCategory) return null;
    if (selectedCategory === "zabbix_metrics") {
      if (selectedItem && "hostid" in selectedItem) return "hosts";
      return "alerts";
    }
    if (selectedCategory === "reports") return "reports";
    if (selectedCategory === "insights") return "insights";
    if (selectedCategory === "veeam") return "veeam";
    return null;
  }, [selectedCategory, selectedItem]);

  const selectedOrganizationName = useMemo(() => {
    if (!selectedItem) return "Selected Organizations";
    const maybeOrganizationName = selectedItem as { organizationName?: string };
    return maybeOrganizationName.organizationName ?? "Selected Organizations";
  }, [selectedItem]);

  const reportsLoading = useMemo(
    () =>
      loading ||
      (selectedCategory === "reports" &&
        reportsDetailsRequested &&
        summary.reports.total > 0 &&
        reports.length === 0),
    [loading, selectedCategory, reportsDetailsRequested, summary.reports.total, reports.length]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Global Infrastructure Overview</h2>
          <p className="text-sm text-muted-foreground">
            Aggregated metrics across the selected organizations
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {error && (
        <Card className="p-4 border-destructive/30 bg-destructive/5 text-sm text-destructive">
          {error}
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ClickableMetricCard
          title="Zabbix Metrics"
          icon={Activity}
          loading={loading}
          iconColor="text-primary"
          isSelected={selectedCategory === "zabbix_metrics"}
          onClick={() => handleCardClick("zabbix_metrics")}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{summary.alerts.total}</span>
                  <span className="text-sm font-normal text-muted-foreground">alerts</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="text-warning">{summary.alerts.active} active</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="text-destructive">{summary.alerts.critical} critical</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" />
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{summary.hosts.total}</span>
                  <span className="text-sm font-normal text-muted-foreground">hosts</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-success" />
                <span>{summary.hosts.enabled} enabled</span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <XCircle className="w-3 h-3 text-destructive" />
                <span>{summary.hosts.disabled} disabled</span>
              </div>
            </div>
          </div>
        </ClickableMetricCard>

        <ClickableMetricCard
          title="Reports"
          icon={FileText}
          loading={reportsLoading}
          iconColor="text-secondary"
          isSelected={selectedCategory === "reports"}
          onClick={() => handleCardClick("reports")}
        >
          <div className="space-y-2">
            <p className="text-2xl font-bold">{summary.reports.total}</p>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{summary.reports.daily} daily</span>
              <span>{summary.reports.weekly} weekly</span>
              <span>{summary.reports.monthly} monthly</span>
            </div>
          </div>
        </ClickableMetricCard>

        <ClickableMetricCard
          title="AI Insights"
          icon={Brain}
          loading={loading}
          iconColor="text-accent"
          isSelected={selectedCategory === "insights"}
          onClick={() => handleCardClick("insights")}
        >
          <div className="space-y-2">
            <p className="text-2xl font-bold">{summary.insights.total}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{summary.insights.predictions} predictions</span>
              <span>{summary.insights.anomalies} anomalies</span>
            </div>
          </div>
        </ClickableMetricCard>

        <ClickableMetricCard
          title="Veeam Metrics"
          icon={HardDrive}
          loading={loading}
          iconColor="text-success"
          isSelected={selectedCategory === "veeam"}
          onClick={() => handleCardClick("veeam")}
        >
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Infra VMs</p>
                <p className="text-xl font-bold">{veeamDrilldownData.infraVMs.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Alarms</p>
                <p className="text-xl font-bold">{veeamDrilldownData.alarmItems.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Jobs</p>
                <p className="text-xl font-bold">{veeamJobs?.length || "—"}</p>   {/* ← safe access */}
              </div>
            </div>
          </div>
        </ClickableMetricCard>
      </div>

      <Collapsible open={selectedCategory !== null}>
        <CollapsibleContent className="animate-accordion-down">
          {selectedCategory && (
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm space-y-6">
              {selectedCategory === "zabbix_metrics" && (
                <ZabbixMetricsDrilldown
                  orgName="Selected Organizations"
                  alerts={{ items: alerts, loading, error: null }}
                  hosts={{ items: hosts, loading, error: null }}
                  onRefreshAlerts={onRefresh}
                  onRefreshHosts={onRefresh}
                  onItemClick={(item) => {
                    setSelectedItem(item);
                    setDrawerOpen(true);
                  }}
                />
              )}

              {selectedCategory === "reports" && (
                <ReportsDrilldown
                  orgName="Selected Organizations"
                  reports={reports}
                  loading={reportsLoading}
                  error={null}
                  onRefresh={onRefresh}
                  onItemClick={(item) => {
                    setSelectedItem(item);
                    setDrawerOpen(true);
                  }}
                />
              )}

              {selectedCategory === "insights" && (
                <InsightsDrilldown
                  orgName="Selected Organizations"
                  insights={insights}
                  loading={loading}
                  error={null}
                  onRefresh={onRefresh}
                />
              )}

              {selectedCategory === "veeam" && (
                <VeeamMetricsDrilldown
                  orgName="Selected Organizations"
                  preloadedData={{
                    ...veeamDrilldownData,
                    onRefresh,
                  }}
                  onSectionChange={setActiveVeeamSection}
                />
              )}

              {breakdownMeta && (
                <Card className="p-4 border-border/50">
                  <h4 className="font-semibold mb-3">{breakdownMeta.title}</h4>
                  {breakdownMeta.rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No organizations match the current filters.
                    </p>
                  ) : (
                    <>
                      <div className="rounded-lg border border-border/50 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/40">
                            <tr>
                              <th className="text-left p-3 font-medium">Organization</th>
                              <th className="text-right p-3 font-medium">Total</th>
                              <th className="text-right p-3 font-medium">{breakdownMeta.secondaryLabel}</th>
                              <th className="text-right p-3 font-medium">{breakdownMeta.tertiaryLabel}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedBreakdown.map((row) => (
                              <tr key={row.organizationId} className="border-t border-border/40">
                                <td className="p-3">{row.organizationName}</td>
                                <td className="p-3 text-right tabular-nums">{row.total}</td>
                                <td className="p-3 text-right tabular-nums">{row.secondary}</td>
                                <td className="p-3 text-right tabular-nums">{row.tertiary}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <TablePagination
                        currentPage={breakdownPage}
                        totalPages={totalBreakdownPages}
                        totalItems={breakdownMeta.rows.length}
                        startIndex={(breakdownPage - 1) * BREAKDOWN_PAGE_SIZE}
                        endIndex={Math.min(breakdownPage * BREAKDOWN_PAGE_SIZE, breakdownMeta.rows.length)}
                        itemName="organizations"
                        onPageChange={setBreakdownPage}
                      />
                    </>
                  )}
                </Card>
              )}
            </Card>
          )}
        </CollapsibleContent>
      </Collapsible>

      <DrilldownDetailDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedItem(null);
        }}
        category={drawerCategory}
        item={selectedItem}
        orgName={selectedOrganizationName}
      />
    </div>
  );
};

export default GlobalInfrastructureOverview;
