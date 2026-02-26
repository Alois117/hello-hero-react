/**
 * Global Infrastructure Overview
 * Default landing view for Super Admin Organizations page.
 * Shows aggregated infrastructure metrics across all organizations
 * with clickable cards that open per-org breakdown drilldowns.
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Server,
  FileText,
  Brain,
  HardDrive,
  Building2,
  RefreshCw,
  ChevronRight,
  Loader2,
  Activity,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/ui/table-pagination";
import type {
  GlobalMetricsSummary,
  OrgMetricsRow,
} from "@/hooks/super-admin/organizations/useGlobalInfrastructureMetrics";
import type { Organization } from "@/hooks/super-admin/organizations/types";

interface GlobalInfrastructureOverviewProps {
  summary: GlobalMetricsSummary;
  orgRows: OrgMetricsRow[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onOrgClick: (org: Organization) => void;
  organizations: Organization[];
}

type DrilldownMetric =
  | "alerts"
  | "hosts"
  | "reports"
  | "insights"
  | "veeam"
  | null;

const PAGE_SIZE = 8;

const cardVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

// ── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({
  title,
  icon: Icon,
  value,
  subtitle,
  details,
  iconColor,
  borderColor,
  bgGradient,
  isSelected,
  onClick,
  loading,
  delay = 0,
}: {
  title: string;
  icon: React.ElementType;
  value: number;
  subtitle?: string;
  details?: { label: string; value: number; color?: string }[];
  iconColor: string;
  borderColor: string;
  bgGradient: string;
  isSelected: boolean;
  onClick: () => void;
  loading: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.3, delay }}
    >
      <Card
        onClick={onClick}
        className={`
          p-4 cursor-pointer transition-all duration-200
          hover:shadow-lg hover:shadow-primary/5
          ${borderColor} bg-gradient-to-br ${bgGradient}
          ${isSelected ? "ring-2 ring-primary/30 border-primary/50" : ""}
        `}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            <h4 className="font-medium text-sm">{title}</h4>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              isSelected ? "rotate-90 text-primary" : ""
            }`}
          />
        </div>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {details && details.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                {details.map((d) => (
                  <span key={d.label} className={d.color || ""}>
                    {d.value} {d.label}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </motion.div>
  );
}

// ── Org Breakdown Table ──────────────────────────────────────────────────────

function OrgBreakdownTable({
  metric,
  rows,
  onOrgClick,
  organizations,
}: {
  metric: DrilldownMetric;
  rows: OrgMetricsRow[];
  onOrgClick: (org: Organization) => void;
  organizations: Organization[];
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when metric changes
  useMemo(() => setCurrentPage(1), [metric]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageRows = rows.slice(startIndex, endIndex);

  const orgLookup = useMemo(() => {
    const map = new Map<string, Organization>();
    organizations.forEach((o) => map.set(o.id, o));
    return map;
  }, [organizations]);

  const handleRowClick = (row: OrgMetricsRow) => {
    const org = orgLookup.get(row.orgId);
    if (org) onOrgClick(org);
  };

  const columns = useMemo(() => {
    switch (metric) {
      case "alerts":
        return [
          { header: "Total Alerts", key: "alerts" as const },
          { header: "Active", key: "activeAlerts" as const },
          { header: "Critical", key: "criticalAlerts" as const },
        ];
      case "hosts":
        return [
          { header: "Total Hosts", key: "hosts" as const },
          { header: "Enabled", key: "enabledHosts" as const },
        ];
      case "reports":
        return [{ header: "Total Reports", key: "reports" as const }];
      case "insights":
        return [{ header: "Total Insights", key: "insights" as const }];
      case "veeam":
        return [
          { header: "Jobs", key: "veeamJobs" as const },
          { header: "Success", key: "veeamSuccess" as const },
          { header: "Failed", key: "veeamFailed" as const },
        ];
      default:
        return [];
    }
  }, [metric]);

  if (!metric) return null;

  const metricLabels: Record<string, string> = {
    alerts: "Alerts",
    hosts: "Hosts",
    reports: "Reports",
    insights: "AI Insights",
    veeam: "Veeam Metrics",
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border/50">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          {metricLabels[metric]} — Breakdown by Organization
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Click a row to view that organization's details
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              {columns.map((col) => (
                <TableHead key={col.key} className="text-right">
                  {col.header}
                </TableHead>
              ))}
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3 + columns.length}
                  className="py-10 text-center text-muted-foreground"
                >
                  No organizations match filters
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row) => (
                <TableRow
                  key={row.orgId}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(row)}
                >
                  <TableCell className="font-medium">{row.orgName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        row.status === "active"
                          ? "border-success/30 bg-success/10 text-success text-[10px]"
                          : "border-muted/30 bg-muted/10 text-muted-foreground text-[10px]"
                      }
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className="text-right font-mono tabular-nums"
                    >
                      {row[col.key]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={rows.length}
        startIndex={startIndex}
        endIndex={endIndex}
        itemName="organizations"
        onPageChange={setCurrentPage}
      />
    </Card>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

const GlobalInfrastructureOverview = ({
  summary,
  orgRows,
  loading,
  error,
  lastUpdated,
  onRefresh,
  onOrgClick,
  organizations,
}: GlobalInfrastructureOverviewProps) => {
  const [selectedMetric, setSelectedMetric] = useState<DrilldownMetric>(null);

  const handleCardClick = (metric: DrilldownMetric) => {
    setSelectedMetric((prev) => (prev === metric ? null : metric));
  };

  if (error && orgRows.length === 0) {
    return (
      <Card className="p-12 text-center border-border/50">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              Failed to Load Global Metrics
            </h3>
            <p className="text-muted-foreground text-sm mt-1">{error}</p>
          </div>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Global Infrastructure</h2>
            <p className="text-xs text-muted-foreground">
              Aggregated metrics across {organizations.length} organizations
              {lastUpdated && (
                <> · Updated {lastUpdated.toLocaleTimeString()}</>
              )}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Org Count Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3 }}
          className="cyber-card border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Organizations
              </p>
              <p className="text-3xl font-bold tabular-nums">
                {organizations.length}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-primary opacity-50" />
          </div>
        </motion.div>
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3, delay: 0.05 }}
          className="cyber-card border-success/30 bg-gradient-to-br from-success/20 to-success/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                With Infrastructure
              </p>
              <p className="text-3xl font-bold tabular-nums">
                {organizations.filter((o) => o.clientId > 0).length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-success opacity-50" />
          </div>
        </motion.div>
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3, delay: 0.1 }}
          className="cyber-card border-warning/30 bg-gradient-to-br from-warning/20 to-warning/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Active Alerts
              </p>
              <p className="text-3xl font-bold tabular-nums">
                {loading ? "—" : summary.activeAlerts}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-warning opacity-50" />
          </div>
        </motion.div>
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3, delay: 0.15 }}
          className="cyber-card border-secondary/30 bg-gradient-to-br from-secondary/20 to-secondary/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Hosts
              </p>
              <p className="text-3xl font-bold tabular-nums">
                {loading ? "—" : summary.totalHosts}
              </p>
            </div>
            <Server className="w-8 h-8 text-secondary opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Clickable Infrastructure Cards */}
      <div>
        <p className="text-sm text-muted-foreground mb-3">
          Click a category to see per-organization breakdown
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <MetricCard
            title="Zabbix Alerts"
            icon={AlertTriangle}
            value={summary.totalAlerts}
            details={[
              {
                label: "active",
                value: summary.activeAlerts,
                color: "text-warning",
              },
              {
                label: "critical",
                value: summary.criticalAlerts,
                color: "text-destructive",
              },
            ]}
            iconColor="text-warning"
            borderColor="border-warning/30"
            bgGradient="from-warning/10 to-warning/5"
            isSelected={selectedMetric === "alerts"}
            onClick={() => handleCardClick("alerts")}
            loading={loading}
            delay={0}
          />
          <MetricCard
            title="Hosts"
            icon={Server}
            value={summary.totalHosts}
            details={[
              {
                label: "enabled",
                value: summary.enabledHosts,
                color: "text-success",
              },
              {
                label: "disabled",
                value: summary.disabledHosts,
                color: "text-destructive",
              },
            ]}
            iconColor="text-primary"
            borderColor="border-primary/30"
            bgGradient="from-primary/10 to-primary/5"
            isSelected={selectedMetric === "hosts"}
            onClick={() => handleCardClick("hosts")}
            loading={loading}
            delay={0.05}
          />
          <MetricCard
            title="Reports"
            icon={FileText}
            value={summary.totalReports}
            iconColor="text-secondary"
            borderColor="border-secondary/30"
            bgGradient="from-secondary/10 to-secondary/5"
            isSelected={selectedMetric === "reports"}
            onClick={() => handleCardClick("reports")}
            loading={loading}
            delay={0.1}
          />
          <MetricCard
            title="AI Insights"
            icon={Brain}
            value={summary.totalInsights}
            iconColor="text-accent"
            borderColor="border-accent/30"
            bgGradient="from-accent/10 to-accent/5"
            isSelected={selectedMetric === "insights"}
            onClick={() => handleCardClick("insights")}
            loading={loading}
            delay={0.15}
          />
          <MetricCard
            title="Veeam Jobs"
            icon={HardDrive}
            value={summary.totalVeeamJobs}
            details={[
              {
                label: "success",
                value: summary.veeamSuccess,
                color: "text-success",
              },
              {
                label: "failed",
                value: summary.veeamFailed,
                color: "text-destructive",
              },
            ]}
            iconColor="text-success"
            borderColor="border-success/30"
            bgGradient="from-success/10 to-success/5"
            isSelected={selectedMetric === "veeam"}
            onClick={() => handleCardClick("veeam")}
            loading={loading}
            delay={0.2}
          />
        </div>
      </div>

      {/* Drilldown Table */}
      {selectedMetric && (
        <OrgBreakdownTable
          metric={selectedMetric}
          rows={orgRows}
          onOrgClick={onOrgClick}
          organizations={organizations}
        />
      )}
    </div>
  );
};

export default GlobalInfrastructureOverview;
