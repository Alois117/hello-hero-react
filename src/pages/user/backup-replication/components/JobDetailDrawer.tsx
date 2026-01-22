import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import type { Job } from "@/pages/user/backup-replication/types";
import { formatDateTime, formatBytes, formatDurationMMSS } from "@/pages/user/backup-replication/utils/format";
import StatusBadge from "@/pages/user/backup-replication/components/shared/StatusBadge";

interface JobDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

export default function JobDetailDrawer({ open, onOpenChange, job }: JobDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{job?.jobName ?? "Job Details"}</SheetTitle>
          <SheetDescription>Execution metrics, schedule and health signals</SheetDescription>
        </SheetHeader>

        {!job ? (
          <div className="mt-6 text-sm text-muted-foreground">No job selected.</div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Job Identity */}
            <section>
              <h3 className="text-sm font-semibold mb-3">Job Identity</h3>
              <Field label="Job Name" value={job.jobName} />
              <Field label="Job Type" value={job.jobType ?? "—"} />
              <Field label="Platform" value={job.platform ?? "—"} />
              <Field label="Client" value={job.parsedJob?.client ?? "—"} />
              <Field label="Location" value={job.parsedJob?.location ?? "—"} />
              <Field label="Source Host" value={job.parsedJob?.source_host ?? "—"} />
            </section>

            <Separator />

            {/* Schedule & Target */}
            <section>
              <h3 className="text-sm font-semibold mb-3">Schedule & Target</h3>
              <Field label="Schedule" value={job.parsedJob?.schedule ?? "—"} />
              <Field label="Target" value={job.parsedJob?.target ?? "—"} />
              <Field label="Target Platform" value={job.parsedJob?.targetPlatform ?? "—"} />
            </section>

            <Separator />

            {/* Execution Metrics */}
            <section>
              <h3 className="text-sm font-semibold mb-3">Execution Metrics</h3>
              <Field label="Last Run" value={formatDateTime(job.lastRun)} />
              <Field label="Duration" value={formatDurationMMSS(job.lastRunDurationSec)} />
              <Field label="Avg Duration" value={formatDurationMMSS(job.avgDurationSec)} />
              <Field label="Data Transferred" value={formatBytes(job.lastTransferredBytes)} />
            </section>

            <Separator />

            {/* Health */}
            <section>
              <h3 className="text-sm font-semibold mb-3">Health Status</h3>
              <Field label="Status" value={<StatusBadge status={job.backupStatus?.status} size="sm" />} />
              <Field label="Job Status" value={job.backupStatus?.jobStatus ?? "—"} />
              <Field label="Ran Within 24h" value={job.backupStatus?.ranWithinLast24Hours ? "Yes" : "No"} />
              <Field label="Backup Age (hrs)" value={job.backupStatus?.backupAgeHours ?? "—"} />
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
