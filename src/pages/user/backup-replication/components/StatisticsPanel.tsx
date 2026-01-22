import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Clock,
  Database,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";

import type { Statistics } from "@/pages/user/backup-replication/types";
import { formatBytes, formatDurationMMSS, formatPercentage } from "@/pages/user/backup-replication/utils/format";

import EmptyState from "@/pages/user/backup-replication/components/shared/EmptyState";

interface StatisticsPanelProps {
  statistics: Statistics | null;
  loading: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card className="p-5 rounded-lg border border-border bg-card hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 shrink-0">
          <Icon className="w-5 h-5 text-primary" />
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

export default function StatisticsPanel({ statistics, loading }: StatisticsPanelProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <LoadingCards count={6} />
      </div>
    );
  }

  if (!statistics || Object.keys(statistics).length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No statistics available"
        description="Job statistics data is not available at this time."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statistics.successRate !== undefined && (
          <StatCard
            title="Success Rate"
            value={formatPercentage(statistics.successRate)}
            icon={TrendingUp}
            description="Overall job success rate"
          />
        )}

        {statistics.totalProtectedDataBytes !== undefined && (
          <StatCard
            title="Protected Data"
            value={formatBytes(statistics.totalProtectedDataBytes)}
            icon={Database}
            description="Total data under protection"
          />
        )}

        {statistics.avgBackupDurationSec !== undefined && (
          <StatCard
            title="Avg Backup Duration"
            value={formatDurationMMSS(statistics.avgBackupDurationSec)}
            icon={Clock}
            description="Average job execution time"
          />
        )}

        {statistics.jobsRanLast24h !== undefined && (
          <StatCard
            title="Jobs (Last 24h)"
            value={statistics.jobsRanLast24h}
            icon={Activity}
            description="Jobs executed in last 24 hours"
          />
        )}

        {/* Display any other dynamic statistics */}
        {Object.entries(statistics).map(([key, value]) => {
          // Skip already displayed stats
          if (["successRate", "totalProtectedDataBytes", "avgBackupDurationSec", "jobsRanLast24h"].includes(key)) {
            return null;
          }
          if (value === undefined || value === null) return null;

          // Format the key nicely
          const title = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();

          // Format value based on type
          let displayValue: string | number = value;
          if (typeof value === "number") {
            if (key.toLowerCase().includes("bytes")) {
              displayValue = formatBytes(value);
            } else if (key.toLowerCase().includes("rate") || key.toLowerCase().includes("percent")) {
              displayValue = formatPercentage(value);
            } else if (key.toLowerCase().includes("duration") || key.toLowerCase().includes("sec")) {
              displayValue = formatDurationMMSS(value);
            }
          }

          return (
            <StatCard
              key={key}
              title={title}
              value={displayValue}
              icon={Zap}
            />
          );
        })}
      </div>
    </div>
  );
}
