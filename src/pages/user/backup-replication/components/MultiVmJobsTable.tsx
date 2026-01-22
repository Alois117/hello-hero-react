import { Fragment, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight, AlertTriangle, Server } from "lucide-react";

import type { MultiVmJob } from "@/pages/user/backup-replication/types";
import { formatDateTime } from "@/pages/user/backup-replication/utils/format";
import { usePagination } from "@/pages/user/backup-replication/hooks/usePagination";
import { useTableFilter } from "@/pages/user/backup-replication/hooks/useTableFilter";

import StatusBadge from "@/pages/user/backup-replication/components/shared/StatusBadge";
import TablePagination from "@/pages/user/backup-replication/components/shared/TablePagination";
import SearchInput from "@/pages/user/backup-replication/components/shared/SearchInput";
import EmptyState from "@/pages/user/backup-replication/components/shared/EmptyState";
import LoadingTable from "@/pages/user/backup-replication/components/shared/LoadingTable";

interface MultiVmJobsTableProps {
  data: MultiVmJob[];
  loading: boolean;
}

export default function MultiVmJobsTable({ data, loading }: MultiVmJobsTableProps) {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    filteredData,
  } = useTableFilter(data, {
    searchFields: ["jobName", "platform"],
  });

  const pagination = usePagination(filteredData);

  const jobTypes = useMemo(() => {
    const types = new Set(data.map((item) => item.jobType).filter(Boolean));
    return Array.from(types);
  }, [data]);

  if (loading) {
    return <LoadingTable columns={6} rows={8} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="No multi-VM jobs"
        description="No backup jobs are linked to multiple VMs."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Risk Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-medium text-amber-700 dark:text-amber-400">
              {data.length} job{data.length !== 1 ? "s" : ""} protecting multiple VMs
            </p>
            <p className="text-sm text-muted-foreground">
              Jobs linked to multiple VMs may have increased failure impact. Review these configurations.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by job name..."
          className="w-64"
        />

        <Select value={filters["jobType"] ?? "all"} onValueChange={(v) => setFilter("jobType", v)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {jobTypes.map((type) => (
              <SelectItem key={type} value={type!}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[44px]" />
              <TableHead>Job Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead className="text-center">Linked VMs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Run</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pagination.paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No jobs match your filters
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginatedData.map((job) => {
                const isOpen = expandedJob === job.jobName;
                const vmCount = job.linkedVMs?.length ?? 0;

                return (
                  <Fragment key={job.jobName}>
                    <TableRow className="hover:bg-muted/30">
                      <TableCell className="p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setExpandedJob(isOpen ? null : job.jobName)}
                          aria-label={isOpen ? `Collapse ${job.jobName}` : `Expand ${job.jobName}`}
                        >
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{job.jobName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.jobType ?? "—"}</Badge>
                      </TableCell>
                      <TableCell>{job.platform ?? "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className="bg-amber-500/15 text-amber-600 border-amber-500/30"
                        >
                          {vmCount} VMs
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={job.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(job.lastRun)}
                      </TableCell>
                    </TableRow>

                    {isOpen && (
                      <TableRow className="bg-muted/20">
                        <TableCell colSpan={7} className="p-4">
                          <div className="space-y-2">
                            <div className="text-sm font-medium flex items-center gap-2">
                              <Server className="h-4 w-4" />
                              Linked Virtual Machines
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {job.linkedVMs?.map((vmName) => (
                                <Badge key={vmName} variant="outline">
                                  {vmName}
                                </Badge>
                              ))}
                            </div>
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

      {/* Pagination */}
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
