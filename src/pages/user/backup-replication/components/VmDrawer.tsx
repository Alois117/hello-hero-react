import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight } from "lucide-react";

import type { MatchedVm, Job } from "@/pages/user/backup-replication/types";
import { formatDateTime, formatBytes, formatDurationMMSS } from "@/pages/user/backup-replication/utils/format";
import StatusBadge from "@/pages/user/backup-replication/components/shared/StatusBadge";

interface VmDrawerProps {
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

export default function VmDrawer({ open, onOpenChange, vm, onSelectJob }: VmDrawerProps) {
  const jobs = vm?.jobs ?? [];
  const backupJobs = jobs.filter((j) => j.jobType?.toLowerCase().includes("backup")).length;
  const replicationJobs = jobs.filter((j) => j.jobType?.toLowerCase().includes("replication")).length;
  const allSuccess = jobs.every((j) => j.backupStatus?.status?.toLowerCase().includes("success"));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{vm?.vm?.name ?? "VM Details"}</SheetTitle>
          <SheetDescription>Virtual machine protection details and job history</SheetDescription>
        </SheetHeader>

        {!vm ? (
          <div className="mt-6 text-sm text-muted-foreground">No VM selected.</div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* VM Summary */}
            <section>
              <h3 className="text-sm font-semibold mb-3">VM Information</h3>
              <Field label="Name" value={vm.vm?.name ?? "—"} />
              <Field label="Power State" value={<Badge variant={vm.vm?.powerState?.toLowerCase().includes("run") ? "default" : "secondary"}>{vm.vm?.powerState ?? "—"}</Badge>} />
              <Field label="Operating System" value={vm.vm?.guestOs ?? "—"} />
              <Field label="Protected" value={<Badge variant={vm.vm?.isProtected ? "default" : "destructive"}>{vm.vm?.isProtected ? "Yes" : "No"}</Badge>} />
              <Field label="Overall Status" value={<StatusBadge status={vm.protectionSummary?.overallStatus} size="sm" />} />
              <Field label="Last Protected" value={formatDateTime(vm.vm?.lastProtectedDate)} />
            </section>

            <Separator />

            {/* Protection Summary */}
            <section>
              <h3 className="text-sm font-semibold mb-3">Protection Summary</h3>
              <Field label="Total Jobs" value={vm.protectionSummary?.totalJobs ?? jobs.length} />
              <Field label="Backup Jobs" value={backupJobs} />
              <Field label="Replication Jobs" value={replicationJobs} />
              <Field label="All Jobs Successful" value={allSuccess ? "Yes" : "No"} />
              <Field label="Backup Current" value={vm.protectionSummary?.backupCurrent ? "Yes" : "No"} />
            </section>

            <Separator />

            {/* Jobs Table */}
            <section>
              <h3 className="text-sm font-semibold mb-3">Jobs ({jobs.length})</h3>
              {jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No jobs associated with this VM.</p>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Job Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Run</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job, idx) => (
                        <TableRow
                          key={`${job.jobName}-${idx}`}
                          className="hover:bg-muted/30 cursor-pointer"
                          onClick={() => onSelectJob?.(job)}
                        >
                          <TableCell className="font-medium">{job.jobName}</TableCell>
                          <TableCell><Badge variant="outline">{job.jobType}</Badge></TableCell>
                          <TableCell><StatusBadge status={job.backupStatus?.status} size="sm" /></TableCell>
                          <TableCell className="text-muted-foreground">{formatDateTime(job.lastRun)}</TableCell>
                          <TableCell>{formatDurationMMSS(job.lastRunDurationSec)}</TableCell>
                          <TableCell>{formatBytes(job.lastTransferredBytes)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
