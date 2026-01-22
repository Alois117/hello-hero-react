import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HardDrive,
  Layers,
  Server,
  ShieldCheck,
  ShieldX,
  TrendingUp,
} from "lucide-react";

import type { Summary, Statistics, AlertItem } from "@/pages/user/backup-replication/types";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  description?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}: SummaryCardProps) {
  const variantClasses = {
    default: "text-primary",
    success: "text-emerald-500",
    warning: "text-amber-500",
    danger: "text-red-500",
  };

  return (
    <Card className="p-5 rounded-lg border border-border bg-card hover:border-primary/30 transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="text-sm text-muted-foreground truncate">{title}</div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 shrink-0">
          <Icon className={`w-5 h-5 ${variantClasses[variant]}`} />
        </div>
      </div>
    </Card>
  );
}

function LoadingCards({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx} className="p-5 rounded-lg border border-border bg-card">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </Card>
      ))}
    </>
  );
}

interface BackupReplicationSummaryProps {
  summary: Summary | null;
  statistics: Statistics | null;
  alerts: { warnings: AlertItem[]; critical: AlertItem[] } | null;
  loading: boolean;
  unprotectedCount?: number;
  orphanJobsCount?: number;
}

export default function BackupReplicationSummary({
  summary,
  statistics,
  alerts,
  loading,
  unprotectedCount = 0,
  orphanJobsCount = 0,
}: BackupReplicationSummaryProps) {
  const isReady = !loading && !!summary;

  const warningCount = alerts?.warnings?.length ?? summary?.alerts?.warnings ?? 0;
  const criticalCount = alerts?.critical?.length ?? summary?.alerts?.critical ?? 0;
  const totalAlerts = warningCount + criticalCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
      {isReady ? (
        <>
          <SummaryCard
            title="Total VMs"
            value={summary.overview.totalVMs}
            icon={Server}
          />
          <SummaryCard
            title="Protected VMs"
            value={summary.protection.protectedVMs}
            icon={ShieldCheck}
            variant="success"
          />
          <SummaryCard
            title="Unprotected VMs"
            value={summary.protection.unprotectedVMs || unprotectedCount}
            icon={ShieldX}
            variant={summary.protection.unprotectedVMs > 0 ? "warning" : "default"}
          />
          <SummaryCard
            title="Total Jobs"
            value={summary.overview.totalJobs}
            icon={HardDrive}
          />
          <SummaryCard
            title="Stale Backups"
            value={summary.backupHealth.staleBackups}
            icon={Clock}
            variant={summary.backupHealth.staleBackups > 0 ? "danger" : "success"}
          />
          <SummaryCard
            title="Active Alerts"
            value={totalAlerts}
            icon={AlertTriangle}
            variant={criticalCount > 0 ? "danger" : warningCount > 0 ? "warning" : "success"}
            description={criticalCount > 0 ? `${criticalCount} critical` : undefined}
          />
          {orphanJobsCount > 0 && (
            <SummaryCard
              title="Orphan Jobs"
              value={orphanJobsCount}
              icon={Layers}
              variant="warning"
            />
          )}
          {statistics?.successRate !== undefined && (
            <SummaryCard
              title="Success Rate"
              value={`${statistics.successRate.toFixed(1)}%`}
              icon={TrendingUp}
              variant={statistics.successRate >= 95 ? "success" : statistics.successRate >= 80 ? "warning" : "danger"}
            />
          )}
          {statistics?.jobsRanLast24h !== undefined && (
            <SummaryCard
              title="Jobs (24h)"
              value={statistics.jobsRanLast24h}
              icon={CheckCircle2}
            />
          )}
        </>
      ) : (
        <LoadingCards count={6} />
      )}
    </div>
  );
}
