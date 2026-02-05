/**
 * Organization Detail View
 * Shows detailed metrics for a selected organization
 * Uses existing data patterns from user dashboard
 */
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
  Loader2,
  RefreshCw
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Organization, OrganizationDetailMetrics } from "@/hooks/super-admin/organizations";
import { format } from "date-fns";

interface OrganizationDetailViewProps {
  organization: Organization;
  metrics: OrganizationDetailMetrics;
  loading: boolean;
  lastUpdated: Date | null;
  onClose: () => void;
  onRefresh: () => void;
}

interface MetricCardProps {
  title: string;
  icon: React.ElementType;
  loading: boolean;
  children: React.ReactNode;
  iconColor?: string;
}

const MetricCard = ({ title, icon: Icon, loading, children, iconColor = "text-primary" }: MetricCardProps) => (
  <Card className="p-4 border-border/50">
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-5 h-5 ${iconColor}`} />
      <h4 className="font-medium text-sm">{title}</h4>
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
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`
            p-3 rounded-xl
            ${organization.status === "active" 
              ? "bg-primary/10 border border-primary/20" 
              : "bg-muted/50 border border-muted/30"
            }
          `}>
            <TrendingUp className={`w-6 h-6 ${organization.status === "active" ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{organization.name}</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span>Client ID: {organization.clientId}</span>
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
              {lastUpdated && (
                <span className="text-xs">
                  Updated: {format(lastUpdated, "HH:mm:ss")}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Alerts */}
        <MetricCard title="Alerts" icon={AlertTriangle} loading={metrics.alerts.loading} iconColor="text-warning">
          <div className="space-y-2">
            <p className="text-2xl font-bold">{metrics.alerts.total}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="text-warning">{metrics.alerts.active} active</span>
              <span className="text-destructive">{metrics.alerts.critical} critical</span>
            </div>
          </div>
        </MetricCard>

        {/* Hosts */}
        <MetricCard title="Zabbix Hosts" icon={Server} loading={metrics.hosts.loading} iconColor="text-primary">
          <div className="space-y-2">
            <p className="text-2xl font-bold">{metrics.hosts.total}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-success" />
                {metrics.hosts.enabled} enabled
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-destructive" />
                {metrics.hosts.disabled} disabled
              </span>
            </div>
          </div>
        </MetricCard>

        {/* Reports */}
        <MetricCard title="Reports" icon={FileText} loading={metrics.reports.loading} iconColor="text-secondary">
          <div className="space-y-2">
            <p className="text-2xl font-bold">{metrics.reports.total}</p>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{metrics.reports.daily} daily</span>
              <span>{metrics.reports.weekly} weekly</span>
              <span>{metrics.reports.monthly} monthly</span>
            </div>
          </div>
        </MetricCard>

        {/* AI Insights */}
        <MetricCard title="AI Insights" icon={Brain} loading={metrics.insights.loading} iconColor="text-accent">
          <div className="space-y-2">
            <p className="text-2xl font-bold">{metrics.insights.total}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{metrics.insights.predictions} predictions</span>
              <span>{metrics.insights.anomalies} anomalies</span>
            </div>
          </div>
        </MetricCard>

        {/* Veeam Backup */}
        <MetricCard title="Veeam Jobs" icon={HardDrive} loading={metrics.veeam.loading} iconColor="text-success">
          <div className="space-y-2">
            <p className="text-2xl font-bold">{metrics.veeam.jobs}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="text-success">{metrics.veeam.success} success</span>
              <span className="text-destructive">{metrics.veeam.failed} failed</span>
            </div>
          </div>
        </MetricCard>

        {/* Users */}
        <MetricCard title="Users" icon={Users} loading={metrics.users.loading} iconColor="text-primary">
          <div className="space-y-2">
            <p className="text-2xl font-bold">{organization.userCount}</p>
            <p className="text-sm text-muted-foreground">Total users in organization</p>
          </div>
        </MetricCard>
      </div>

      {/* Organization Meta */}
      <Card className="p-4 border-border/50">
        <h4 className="font-medium text-sm mb-3">Organization Details</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{format(organization.createdAt, "PPP")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Updated</p>
            <p className="font-medium">{format(organization.updatedAt, "PPP")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Client ID</p>
            <p className="font-medium font-mono">{organization.clientId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium capitalize">{organization.status}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrganizationDetailView;
