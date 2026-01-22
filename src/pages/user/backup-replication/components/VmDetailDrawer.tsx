import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import type { MatchedVm, Job } from "@/pages/user/backup-replication/types";
import { formatDateTime, formatBytes, formatDurationMMSS } from "@/pages/user/backup-replication/utils/format";
import StatusBadge from "@/pages/user/backup-replication/components/shared/StatusBadge";

interface VmDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vm: MatchedVm | null;
  onSelectJob?: (job: Job) => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

export default function VmDetailDrawer({ open, onOpenChange, vm, onSelectJob }: VmDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{vm?.vm?.name ?? "VM Details"}</SheetTitle>
          <SheetDescription>Virtual machine protection details and job history</SheetDescription>
        </SheetHeader>

        {!vm ? (
          <div className="mt-6 text-sm text-muted-foreground">No VM selected.</div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* VM Info */}
            <section>
              <h3 className="text-sm font-semibold mb-3">VM Information</h3>
              <Field label="Name" value={vm.vm?.name ?? "—"} />
              <Field label="Power State" value={vm.vm?.powerState ?? "—"} />
              <Field label="Operating System" value={vm.vm?.guestOs ?? "—"} />
              <Field label="Protected" value={vm.vm?.isProtected ? "Yes" : "No"} />
              <Field label="Last Protected" value={formatDateTime(vm.vm?.lastProtectedDate)} />
            </section>

            <Separator />

            {/* Protection Summary */}
            <section>
              <h3 className="text-sm font-semibold mb-3">Protection Summary</h3>
              <Field label="Overall Status" value={<StatusBadge status={vm.protectionSummary?.overallStatus} size="sm" />} />
              <Field label="Total Jobs" value={vm.protectionSummary?.totalJobs ?? 0} />
              <Field label="Backup Current" value={vm.protectionSummary?.backupCurrent ? "Yes" : "No"} />
            </section>

            <Separator />

            {/* Jobs */}
            <section>
              <h3 className="text-sm font-semibold mb-3">Backup Jobs ({vm.jobs?.length ?? 0})</h3>
              {vm.jobs?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No jobs associated with this VM.</p>
              ) : (
                <div className="space-y-3">
                  {vm.jobs?.map((job, idx) => (
                    <div
                      key={`${job.jobName}-${idx}`}
                      className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() => onSelectJob?.(job)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{job.jobName}</span>
                        <StatusBadge status={job.backupStatus?.status} size="sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>Type: {job.jobType}</div>
                        <div>Platform: {job.platform}</div>
                        <div>Last Run: {formatDateTime(job.lastRun)}</div>
                        <div>Data: {formatBytes(job.lastTransferredBytes)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
