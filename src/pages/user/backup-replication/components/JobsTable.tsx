import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBytes, formatDateTime, formatDurationMMSS } from "@/pages/user/backup-replication/utils/format";
import type { Job } from "@/pages/user/backup-replication/types";
import { ChevronRight } from "lucide-react";

function statusBadgeVariant(status?: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("success")) return "default";
  if (s.includes("warn")) return "secondary";
  if (s.includes("stale")) return "destructive";
  return "secondary";
}

export default function JobsTable({
  jobs,
  onSelectJob,
}: {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
}) {
  const rows = useMemo(() => jobs ?? [], [jobs]);

  return (
    <div className="rounded-lg border border-border bg-surface/20 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[44px]" />
            <TableHead>Job Name</TableHead>
            <TableHead>Job Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Backup Health</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead className="text-right">Duration</TableHead>
            <TableHead className="text-right">Avg Duration</TableHead>
            <TableHead className="text-right">Data Size</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Platform</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="py-10 text-center text-muted-foreground">
                No jobs
              </TableCell>
            </TableRow>
          ) : (
            rows.map((job) => (
              <TableRow key={`${job.jobName}-${job.lastRun}`} className="hover:bg-muted/30">
                <TableCell className="p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onSelectJob(job)}
                    aria-label={`Open details for ${job.jobName}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{job.jobName}</TableCell>
                <TableCell>{job.jobType}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-surface/50 border border-border/50">
                    {job.backupStatus?.jobStatus ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(job.backupStatus?.status) as any}>
                    {job.backupStatus?.status ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDateTime(job.lastRun)}</TableCell>
                <TableCell className="text-right">{formatDurationMMSS(job.lastRunDurationSec)}</TableCell>
                <TableCell className="text-right">{formatDurationMMSS(job.avgDurationSec)}</TableCell>
                <TableCell className="text-right">{formatBytes(job.lastTransferredBytes)}</TableCell>
                <TableCell>{job.parsedJob?.schedule ?? "—"}</TableCell>
                <TableCell>{job.parsedJob?.targetPlatform ?? job.parsedJob?.target ?? "—"}</TableCell>
                <TableCell>{job.platform ?? "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
