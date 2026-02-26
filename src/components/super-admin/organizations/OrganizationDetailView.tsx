/**
 * Organization Detail View
 * Shows detailed metrics for a selected organization with clickable drilldown cards
 */
import { useState, useCallback } from "react";
import {
  X,
  Users,
  AlertTriangle,
  Server,
  FileText,
  Brain,
  HardDrive,
  TrendingUp,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Organization,
  OrganizationDetailMetrics,
} from "@/hooks/super-admin/organizations";
import {
  useOrganizationDetails,
  DrilldownCategory,
  AlertItem,
  HostItem,
  ReportItem,
  InsightItem,
  VeeamJobItem,
  UserItem,
} from "@/hooks/super-admin/organizations/useOrganizationDetails";
import { ReportsDrilldown, InsightsDrilldown, UsersDrilldown } from "./drilldown";
import ZabbixMetricsDrilldown from "./drilldown/ZabbixMetricsDrilldown";
import VeeamMetricsDrilldown from "./VeeamMetricsDrilldown";
import { DrilldownDetailDrawer } from "./drilldown/detail";
import { format } from "date-fns";

interface OrganizationDetailViewProps {
  organization: Organization;
  metrics: OrganizationDetailMetrics;
  loading: boolean;
  lastUpdated: Date | null;
  onClose: () => void;
  onRefresh: () => void;
}

interface ClickableMetricCardProps {
  title: string;
  icon: React.ElementType;
  loading: boolean;
  children: React.ReactNode;
  iconColor?: string;
  isSelected: boolean;
  onClick: () => void;
  category: DrilldownCategory;
  disabled?: boolean;
  disabledTitle?: string;
}

const ClickableMetricCard = ({
  title,
  icon: Icon,
  loading,
  children,
  iconColor = "text-primary",
  isSelected,
  onClick,
  disabled = false,
  disabledTitle,
}: ClickableMetricCardProps) => (
  <Card
    className={`
      p-4 border-border/50 transition-all duration-200
      ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      ${
        !disabled
          ? "hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 hover:bg-muted/30"
          : ""
      }
      ${isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : ""}
    `}
    onClick={() => {
      if (!disabled) onClick();
    }}
    title={disabled ? disabledTitle : undefined}
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

const OrganizationDetailView = ({
  organization,
  metrics,
  loading,
  lastUpdated,
  onClose,
  onRefresh,
}: OrganizationDetailViewProps) => {
  // ✅ Normalize clientId once (null if missing/0)
  const clientId = organization.clientId > 0 ? organization.clientId : null;

  // Use the details hook for drilldown data
  const {
    selectedCategory,
    setSelectedCategory,
    alerts,
    hosts,
    reports,
    insights,
    veeam,
    users,
    refreshCategory,
  } = useOrganizationDetails({
    orgId: organization.id,
    clientId, // ✅ now always null or positive number
    enabled: true,
  });

  // Selected item for drawer detail view
  type DrilldownItem =
    | AlertItem
    | HostItem
    | ReportItem
    | InsightItem
    | VeeamJobItem
    | UserItem;

  const [selectedItem, setSelectedItem] = useState<DrilldownItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCardClick = (category: DrilldownCategory) => {
    if (selectedCategory === category) {
      setSelectedCategory(null); // Toggle off
    } else {
      setSelectedCategory(category);
    }
    // Close drawer when switching categories
    setSelectedItem(null);
    setDrawerOpen(false);
  };

  const handleRefreshCategory = () => {
    if (selectedCategory) {
      refreshCategory(selectedCategory);
    }
  };

  const handleItemClick = useCallback((item: DrilldownItem) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setSelectedItem(null);
  }, []);

  // Determine the detail drawer category for zabbix_metrics
  const getDrawerCategory = (): DrilldownCategory => {
    if (selectedCategory === "zabbix_metrics") {
      if (selectedItem && "hostid" in selectedItem) return "hosts";
      if (
        selectedItem &&
        "severity" in selectedItem &&
        "acknowledged" in selectedItem
      )
        return "alerts";
      return "alerts";
    }
    return selectedCategory;
  };

  // Render the drilldown content based on selected category
  const renderDrilldown = () => {
    if (!selectedCategory) return null;

    switch (selectedCategory) {
      case "zabbix_metrics":
        return (
          <ZabbixMetricsDrilldown
            orgName={organization.name}
            alerts={alerts}
            hosts={hosts}
            onRefreshAlerts={() => refreshCategory("alerts")}
            onRefreshHosts={() => refreshCategory("hosts")}
            onItemClick={handleItemClick}
          />
        );
      case "reports":
        return (
          <ReportsDrilldown
            orgName={organization.name}
            reports={reports.items}
            loading={reports.loading}
            error={reports.error}
            onRefresh={handleRefreshCategory}
            onItemClick={handleItemClick}
          />
        );
      case "insights":
        return (
          <InsightsDrilldown
            orgName={organization.name}
            insights={insights.items}
            loading={insights.loading}
            error={insights.error}
            onRefresh={handleRefreshCategory}
            onItemClick={handleItemClick}
          />
        );
      case "veeam":
        // ✅ Guard: only render if clientId exists
        if (!clientId) {
          return (
            <div className="text-sm text-muted-foreground">
              Veeam data requires <span className="font-mono">client_id</span>{" "}
              to be set for this organization.
            </div>
          );
        }
        return (
          <VeeamMetricsDrilldown
            orgName={organization.name}
            clientId={clientId}
            onRefresh={handleRefreshCategory}
          />
        );
      case "users":
        return (
          <UsersDrilldown
            orgId={organization.id}
            orgName={organization.name}
            users={users.items}
            loading={users.loading}
            error={users.error}
            onRefresh={handleRefreshCategory}
            onItemClick={handleItemClick}
          />
        );
      default:
        return null;
    }
  };

  // Disable webhook-backed cards if no clientId
  const webhookDisabled = !clientId;
  const webhookDisabledTitle =
    "This requires client_id attribute on the Keycloak Organization.";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`
            p-3 rounded-xl
            ${
              organization.status === "active"
                ? "bg-primary/10 border border-primary/20"
                : "bg-muted/50 border border-muted/30"
            }
          `}
          >
            <TrendingUp
              className={`w-6 h-6 ${
                organization.status === "active"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{organization.name}</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              {clientId && <span>Client ID: {clientId}</span>}
              <Badge
                variant="outline"
                className={
                  organization.status === "active"
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-muted/30 bg-muted/10 text-muted-foreground"
                }
              >
                {organization.status}
              </Badge>
              {organization.description && (
                <span
                  className="text-xs truncate max-w-[200px]"
                  title={organization.description}
                >
                  {organization.description}
                </span>
              )}
              {lastUpdated && (
                <span className="text-xs">
                  Updated: {format(lastUpdated, "HH:mm:ss")}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Clickable hint */}
      <p className="text-sm text-muted-foreground">
        Click on any card below to view detailed data for that category
      </p>

      {/* Metrics Grid - Clickable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Zabbix Metrics (compact 2-column layout) */}
        <ClickableMetricCard
          title="Zabbix Metrics"
          icon={Activity}
          loading={metrics.alerts.loading || metrics.hosts.loading}
          iconColor="text-primary"
          isSelected={selectedCategory === "zabbix_metrics"}
          onClick={() => handleCardClick("zabbix_metrics")}
          category="zabbix_metrics"
          disabled={webhookDisabled}
          disabledTitle={webhookDisabledTitle}
        >
          {/* ✅ Compact format to avoid tall card (prevents row stretch) */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {/* Alerts column */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{metrics.alerts.total}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    alerts
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <span className="text-warning">{metrics.alerts.active} active</span>
              </div>

              <div className="text-xs text-muted-foreground">
                <span className="text-destructive">
                  {metrics.alerts.critical} critical
                </span>
              </div>
            </div>

            {/* Hosts column */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" />
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{metrics.hosts.total}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    hosts
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-success" />
                <span>{metrics.hosts.enabled} enabled</span>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <XCircle className="w-3 h-3 text-destructive" />
                <span>{metrics.hosts.disabled} disabled</span>
              </div>
            </div>
          </div>
        </ClickableMetricCard>

        {/* Reports */}
        <ClickableMetricCard
          title="Reports"
          icon={FileText}
          loading={metrics.reports.loading}
          iconColor="text-secondary"
          isSelected={selectedCategory === "reports"}
          onClick={() => handleCardClick("reports")}
          category="reports"
          disabled={webhookDisabled}
          disabledTitle={webhookDisabledTitle}
        >
          <div className="space-y-2">
            <p className="text-2xl font-bold">{metrics.reports.total}</p>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{metrics.reports.daily} daily</span>
              <span>{metrics.reports.weekly} weekly</span>
              <span>{metrics.reports.monthly} monthly</span>
            </div>
          </div>
        </ClickableMetricCard>

        {/* AI Insights */}
        <ClickableMetricCard
          title="AI Insights"
          icon={Brain}
          loading={metrics.insights.loading}
          iconColor="text-accent"
          isSelected={selectedCategory === "insights"}
          onClick={() => handleCardClick("insights")}
          category="insights"
          disabled={webhookDisabled}
          disabledTitle={webhookDisabledTitle}
        >
          <div className="space-y-2">
            <p className="text-2xl font-bold">{metrics.insights.total}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{metrics.insights.predictions} predictions</span>
              <span>{metrics.insights.anomalies} anomalies</span>
            </div>
          </div>
        </ClickableMetricCard>

        {/* Veeam Metrics */}
        <ClickableMetricCard
          title="Veeam Metrics"
          icon={HardDrive}
          loading={metrics.veeam.loading}
          iconColor="text-success"
          isSelected={selectedCategory === "veeam"}
          onClick={() => handleCardClick("veeam")}
          category="veeam"
          disabled={webhookDisabled}
          disabledTitle={webhookDisabledTitle}
        >
          <div className="space-y-2">
            <p className="text-2xl font-bold">{metrics.veeam.jobs}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="text-success">{metrics.veeam.success} success</span>
              <span className="text-destructive">{metrics.veeam.failed} failed</span>
            </div>
          </div>
        </ClickableMetricCard>

        {/* Users */}
        <ClickableMetricCard
          title="Users"
          icon={Users}
          loading={metrics.users.loading}
          iconColor="text-primary"
          isSelected={selectedCategory === "users"}
          onClick={() => handleCardClick("users")}
          category="users"
        >
          <div className="space-y-2">
            <p className="text-2xl font-bold">{metrics.users.total}</p>
            <p className="text-sm text-muted-foreground">
              Total users in organization
            </p>
          </div>
        </ClickableMetricCard>
      </div>

      {/* Drilldown Section */}
      <Collapsible open={selectedCategory !== null}>
        <CollapsibleContent className="animate-accordion-down">
          {selectedCategory && (
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              {renderDrilldown()}
            </Card>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Organization Meta */}
      <Card className="p-4 border-border/50">
        <h4 className="font-medium text-sm mb-3">Organization Details</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Keycloak ID</p>
            <p
              className="font-medium font-mono text-xs truncate"
              title={organization.id}
            >
              {organization.id}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Alias</p>
            <p className="font-medium">{organization.alias || "—"}</p>
          </div>
          {clientId && (
            <div>
              <p className="text-muted-foreground">Client ID</p>
              <p className="font-medium font-mono">{clientId}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium capitalize">{organization.status}</p>
          </div>
          {organization.description && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Description</p>
              <p className="font-medium">{organization.description}</p>
            </div>
          )}
          {organization.domains && organization.domains.length > 0 && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Domains</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {organization.domains.map((d) => (
                  <Badge key={d.name} variant="outline" className="text-xs">
                    {d.name} {d.verified ? "✓" : ""}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Item Detail Drawer */}
      <DrilldownDetailDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        category={getDrawerCategory()}
        item={selectedItem}
        orgName={organization.name}
      />
    </div>
  );
};

export default OrganizationDetailView;
