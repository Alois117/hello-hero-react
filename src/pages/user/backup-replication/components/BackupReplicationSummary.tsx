import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, HardDrive, Layers, ShieldCheck, ShieldX } from "lucide-react";

import type { BackupReplicationResponse } from "@/pages/user/backup-replication/types";

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="glass-card p-5 rounded-lg border border-border hover:border-primary/30 transition-all hover-lift">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className="p-2 rounded-lg bg-surface/50 border border-border/50">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}

export default function BackupReplicationSummary({
  summary,
  loading,
}: {
  summary: BackupReplicationResponse["summary"] | null;
  loading: boolean;
}) {
  const isReady = !loading && !!summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
      {isReady ? (
        <>
          <SummaryCard title="Total VMs" value={summary.overview.totalVMs} icon={Layers} />
          <SummaryCard title="Protected VMs" value={summary.protection.protectedVMs} icon={ShieldCheck} />
          <SummaryCard title="Unprotected VMs" value={summary.protection.unprotectedVMs} icon={ShieldX} />
          <SummaryCard title="Total Jobs" value={summary.overview.totalJobs} icon={HardDrive} />
          <SummaryCard title="Stale Backups" value={summary.backupHealth.staleBackups} icon={CheckCircle2} />
          <SummaryCard
            title="Active Alerts"
            value={(summary.alerts.warnings || 0) + (summary.alerts.critical || 0)}
            icon={AlertTriangle}
          />
        </>
      ) : (
        Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="glass-card p-5 rounded-lg border border-border">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
