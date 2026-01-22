import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Power,
  PowerOff,
  Equal,
  ChevronRight,
} from "lucide-react";

import type { Changes, ChangeSummary, ChangedJob } from "@/pages/user/backup-replication/types";
import { formatDateTime } from "@/pages/user/backup-replication/utils/format";
import { usePagination } from "@/pages/user/backup-replication/hooks/usePagination";

import StatusBadge from "@/pages/user/backup-replication/components/shared/StatusBadge";
import TablePagination from "@/pages/user/backup-replication/components/shared/TablePagination";
import EmptyState from "@/pages/user/backup-replication/components/shared/EmptyState";

interface ChangesPanelProps {
  changes: Changes | null;
  changeSummary: ChangeSummary | null;
  loading: boolean;
  onSelectJob?: (job: ChangedJob) => void;
}

interface ChangeCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  variant: "new" | "modified" | "disabled" | "enabled";
}

function ChangeCard({ title, value, icon: Icon, variant }: ChangeCardProps) {
  const variantClasses = {
    new: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    modified: "text-blue-500 bg-blue-500/10 border-blue-500/30",
    disabled: "text-red-500 bg-red-500/10 border-red-500/30",
    enabled: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  };

  return (
    <Card className={`p-4 rounded-lg border ${variantClasses[variant]}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
        </div>
        <div className="p-2 rounded-lg bg-background/50">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

function LoadingCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Card key={idx} className="p-4 rounded-lg border border-border">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function ChangedJobsTable({
  jobs,
  onSelectJob,
}: {
  jobs: ChangedJob[];
  onSelectJob?: (job: ChangedJob) => void;
}) {
  const pagination = usePagination(jobs);

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No changes"
        description="No jobs in this category."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[44px]" />
              <TableHead>Job Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Changed At</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pagination.paginatedData.map((job, idx) => (
              <TableRow
                key={`${job.jobName}-${idx}`}
                className="hover:bg-muted/30 cursor-pointer"
                onClick={() => onSelectJob?.(job)}
              >
                <TableCell className="p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectJob?.(job);
                    }}
                    aria-label={`View details for ${job.jobName}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{job.jobName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{job.jobType ?? "—"}</Badge>
                </TableCell>
                <TableCell>{job.platform ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={job.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(job.changedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setCurrentPage}
        onPageSizeChange={pagination.setPageSize}
        canGoNext={pagination.canGoNext}
        canGoPrevious={pagination.canGoPrevious}
        onFirstPage={pagination.goToFirstPage}
        onLastPage={pagination.goToLastPage}
        onNextPage={pagination.goToNextPage}
        onPreviousPage={pagination.goToPreviousPage}
      />
    </div>
  );
}

export default function ChangesPanel({
  changes,
  changeSummary,
  loading,
  onSelectJob,
}: ChangesPanelProps) {
  const [activeTab, setActiveTab] = useState("new");

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingCards />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!changes || !changeSummary) {
    return (
      <EmptyState
        title="No change data available"
        description="Job change tracking data is not available at this time."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ChangeCard
          title="New Jobs"
          value={changeSummary.newJobs}
          icon={Plus}
          variant="new"
        />
        <ChangeCard
          title="Modified Jobs"
          value={changeSummary.modifiedJobs}
          icon={Pencil}
          variant="modified"
        />
        <ChangeCard
          title="Disabled Jobs"
          value={changeSummary.disabledJobs}
          icon={PowerOff}
          variant="disabled"
        />
        <ChangeCard
          title="Enabled Jobs"
          value={changeSummary.enabledJobs}
          icon={Power}
          variant="enabled"
        />
      </div>

      {/* Tabs for each change type */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-muted/30 p-1">
          <TabsTrigger value="new" className="gap-2">
            <Plus className="h-4 w-4" />
            New ({changes.new?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="modified" className="gap-2">
            <Pencil className="h-4 w-4" />
            Modified ({changes.modified?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="disabled" className="gap-2">
            <PowerOff className="h-4 w-4" />
            Disabled ({changes.disabled?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="enabled" className="gap-2">
            <Power className="h-4 w-4" />
            Enabled ({changes.enabled?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="unchanged" className="gap-2">
            <Equal className="h-4 w-4" />
            Unchanged ({changes.unchanged?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-4">
          <ChangedJobsTable jobs={changes.new ?? []} onSelectJob={onSelectJob} />
        </TabsContent>
        <TabsContent value="modified" className="mt-4">
          <ChangedJobsTable jobs={changes.modified ?? []} onSelectJob={onSelectJob} />
        </TabsContent>
        <TabsContent value="disabled" className="mt-4">
          <ChangedJobsTable jobs={changes.disabled ?? []} onSelectJob={onSelectJob} />
        </TabsContent>
        <TabsContent value="enabled" className="mt-4">
          <ChangedJobsTable jobs={changes.enabled ?? []} onSelectJob={onSelectJob} />
        </TabsContent>
        <TabsContent value="unchanged" className="mt-4">
          <ChangedJobsTable jobs={changes.unchanged ?? []} onSelectJob={onSelectJob} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
