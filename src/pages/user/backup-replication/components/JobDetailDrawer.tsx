import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import type { Job } from "@/pages/user/backup-replication/types";
import { formatBytes, formatDateTime, formatDurationMMSS } from "@/pages/user/backup-replication/utils/format";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 py-2">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground text-right break-words">{value}</div>
    </div>
  );
}

export default function JobDetailDrawer({
  open,
  onOpenChange,
  job,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-2xl ml-auto mr-0 h-[92vh]">
        <div className="p-6 overflow-auto">
          <DrawerHeader className="p-0">
            <DrawerTitle className="text-xl">Job Details</DrawerTitle>
            <DrawerDescription>Execution metrics, schedule and health signals</DrawerDescription>
          </DrawerHeader>

          {!job ? (
            <div className="mt-6 text-sm text-muted-foreground">No job selected.</div>
          ) : (
            <div className="mt-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">{job.jobName}</div>
                  <Badge variant="secondary" className="bg-surface/50 border border-border/50">
                    {job.backupStatus?.status ?? "—"}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{job.jobType}</div>
              </div>

              <Separator />

              <section>
                <div className="text-sm font-semibold">Job Identity</div>
                <div className="mt-3">
                  <Field label="Job Name" value={job.jobName} />
                  <Field label="Client" value={job.parsedJob?.client ?? "—"} />
                  <Field label="Location" value={job.parsedJob?.location ?? "—"} />
                  <Field label="Source Host" value={job.parsedJob?.source_host ?? "—"} />
                  <Field label="Target" value={job.parsedJob?.target ?? "—"} />
                  <Field label="Schedule" value={job.parsedJob?.schedule ?? "—"} />
                </div>
              </section>

              <Separator />

              <section>
                <div className="text-sm font-semibold">Execution Metrics</div>
                <div className="mt-3">
                  <Field label="Last Run" value={formatDateTime(job.lastRun)} />
                  <Field label="Duration" value={formatDurationMMSS(job.lastRunDurationSec)} />
                  <Field label="Avg Duration" value={formatDurationMMSS(job.avgDurationSec)} />
                  <Field label="Data Transferred" value={formatBytes(job.lastTransferredBytes)} />
                  <Field label="Platform" value={job.platform ?? "—"} />
                </div>
              </section>

              <Separator />

              <section>
                <div className="text-sm font-semibold">Health</div>
                <div className="mt-3">
                  <Field
                    label="Ran Within 24h"
                    value={job.backupStatus?.ranWithinLast24Hours ? "Yes" : "No"}
                  />
                  <Field label="Backup Age (hrs)" value={job.backupStatus?.backupAgeHours ?? "—"} />
                  <Field label="Backup Status" value={job.backupStatus?.status ?? "—"} />
                  <Field label="Job Status" value={job.backupStatus?.jobStatus ?? "—"} />
                </div>
              </section>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
