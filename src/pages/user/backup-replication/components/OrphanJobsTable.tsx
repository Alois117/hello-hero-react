import { useMemo } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Unlink } from "lucide-react";

import type { OrphanJob } from "@/pages/user/backup-replication/types";
import { formatDateTime } from "@/pages/user/backup-replication/utils/format";
import { usePagination } from "@/pages/user/backup-replication/hooks/usePagination";
import { useTableFilter } from "@/pages/user/backup-replication/hooks/useTableFilter";

import StatusBadge from "@/pages/user/backup-replication/components/shared/StatusBadge";
import TablePagination from "@/pages/user/backup-replication/components/shared/TablePagination";
import SearchInput from "@/pages/user/backup-replication/components/shared/SearchInput";
import EmptyState from "@/pages/user/backup-replication/components/shared/EmptyState";
import LoadingTable from "@/pages/user/backup-replication/components/shared/LoadingTable";

interface OrphanJobsTableProps {
  data: OrphanJob[];
  loading: boolean;
}

export default function OrphanJobsTable({ data, loading }: OrphanJobsTableProps) {
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

  const platforms = useMemo(() => {
    const p = new Set(data.map((item) => item.platform).filter(Boolean));
    return Array.from(p);
  }, [data]);

  if (loading) {
    return <LoadingTable columns={6} rows={8} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Unlink}
        title="No orphan jobs"
        description="All backup jobs are properly linked to VMs."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Unlink className="h-5 w-5 text-orange-600 shrink-0" />
          <div>
            <p className="font-medium text-orange-700 dark:text-orange-400">
              {data.length} orphan job{data.length !== 1 ? "s" : ""} detected
            </p>
            <p className="text-sm text-muted-foreground">
              These jobs are not linked to any VM. They may be stale or misconfigured.
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

        <Select value={filters["platform"] ?? "all"} onValueChange={(v) => setFilter("platform", v)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {platforms.map((p) => (
              <SelectItem key={p} value={p!}>
                {p}
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
              <TableHead>Job Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Run</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pagination.paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No jobs match your filters
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginatedData.map((job, idx) => (
                <TableRow key={`${job.jobName}-${idx}`} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{job.jobName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{job.jobType ?? "—"}</Badge>
                  </TableCell>
                  <TableCell>{job.platform ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{job.schedule ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(job.lastRun)}
                  </TableCell>
                </TableRow>
              ))
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
