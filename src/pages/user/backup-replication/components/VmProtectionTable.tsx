import { Fragment, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";

import type { Job, MatchedVm } from "@/pages/user/backup-replication/types";
import { formatDateTime } from "@/pages/user/backup-replication/utils/format";
import JobsTable from "@/pages/user/backup-replication/components/JobsTable";
import JobDetailDrawer from "@/pages/user/backup-replication/components/JobDetailDrawer";

function overallStatusBadgeVariant(status?: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("success")) return "default";
  if (s.includes("warn")) return "secondary";
  if (s.includes("stale")) return "destructive";
  return "secondary";
}

function backupCurrentBadge(backupCurrent?: boolean) {
  if (backupCurrent === true) return { label: "Current", variant: "default" as const };
  if (backupCurrent === false) return { label: "Not Current", variant: "secondary" as const };
  return { label: "—", variant: "secondary" as const };
}

export default function VmProtectionTable({ matched, loading }: { matched: MatchedVm[]; loading: boolean }) {
  const [expandedVm, setExpandedVm] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobDrawerOpen, setJobDrawerOpen] = useState(false);

  const rows = useMemo(() => matched ?? [], [matched]);

  const openJob = (job: Job) => {
    setSelectedJob(job);
    setJobDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground py-8">Loading backup &amp; replication data…</div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[44px]" />
              <TableHead>VM Name</TableHead>
              <TableHead>Power State</TableHead>
              <TableHead>OS</TableHead>
              <TableHead>Protected</TableHead>
              <TableHead>Overall Status</TableHead>
              <TableHead className="text-right">Jobs Count</TableHead>
              <TableHead>Backup Current</TableHead>
              <TableHead>Last Protected</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  No VMs found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((item) => {
                const vmName = item.vm?.name ?? "—";
                const isOpen = expandedVm === vmName;
                const backupCurrent = backupCurrentBadge(item.protectionSummary?.backupCurrent);

                return (
                  <Fragment key={vmName}>
                    <TableRow className="hover:bg-muted/30">
                      <TableCell className="p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setExpandedVm(isOpen ? null : vmName)}
                          aria-label={isOpen ? `Collapse ${vmName}` : `Expand ${vmName}`}
                        >
                          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{vmName}</TableCell>
                      <TableCell>{item.vm?.powerState ?? "—"}</TableCell>
                      <TableCell className="max-w-[240px] truncate" title={item.vm?.guestOs}>
                        {item.vm?.guestOs ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.vm?.isProtected ? "default" : "secondary"}>
                          {item.vm?.isProtected ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={overallStatusBadgeVariant(item.protectionSummary?.overallStatus) as any}>
                          {item.protectionSummary?.overallStatus ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.protectionSummary?.totalJobs ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant={backupCurrent.variant}>{backupCurrent.label}</Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(item.vm?.lastProtectedDate)}</TableCell>
                    </TableRow>

                    {isOpen && (
                      <TableRow className="bg-surface/20">
                        <TableCell colSpan={9} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold">Jobs</div>
                              <div className="text-xs text-muted-foreground">Click a job to view details</div>
                            </div>
                            <JobsTable jobs={item.jobs ?? []} onSelectJob={openJob} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <JobDetailDrawer open={jobDrawerOpen} onOpenChange={setJobDrawerOpen} job={selectedJob} />
    </>
  );
}
