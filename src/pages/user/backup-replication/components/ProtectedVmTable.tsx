import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight } from "lucide-react";

import type { MatchedVm, Job } from "@/pages/user/backup-replication/types";
import { formatDateTime } from "@/pages/user/backup-replication/utils/format";
import { usePagination } from "@/pages/user/backup-replication/hooks/usePagination";
import { useTableFilter } from "@/pages/user/backup-replication/hooks/useTableFilter";

import StatusBadge from "@/pages/user/backup-replication/components/shared/StatusBadge";
import TablePagination from "@/pages/user/backup-replication/components/shared/TablePagination";
import SearchInput from "@/pages/user/backup-replication/components/shared/SearchInput";
import EmptyState from "@/pages/user/backup-replication/components/shared/EmptyState";
import LoadingTable from "@/pages/user/backup-replication/components/shared/LoadingTable";

interface ProtectedVmTableProps {
  data: MatchedVm[];
  loading: boolean;
  onSelectVm: (vm: MatchedVm) => void;
  onSelectJob?: (job: Job) => void;
}

export default function ProtectedVmTable({
  data,
  loading,
  onSelectVm,
}: ProtectedVmTableProps) {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    filteredData,
  } = useTableFilter(data, {
    searchFields: ["vm.name", "vm.guestOs"],
  });

  const pagination = usePagination(filteredData);

  // Extract unique values for filters
  const powerStates = useMemo(() => {
    const states = new Set(data.map((item) => item.vm?.powerState).filter(Boolean));
    return Array.from(states);
  }, [data]);

  const statuses = useMemo(() => {
    const statusSet = new Set(
      data.map((item) => item.protectionSummary?.overallStatus).filter(Boolean)
    );
    return Array.from(statusSet);
  }, [data]);

  if (loading) {
    return <LoadingTable columns={7} rows={8} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="No protected VMs"
        description="No virtual machines are currently protected by backup jobs."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by VM name or OS..."
          className="w-64"
        />

        <Select value={filters["vm.powerState"] ?? "all"} onValueChange={(v) => setFilter("vm.powerState", v)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Power State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {powerStates.map((state) => (
              <SelectItem key={state} value={state!}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters["protectionSummary.overallStatus"] ?? "all"} onValueChange={(v) => setFilter("protectionSummary.overallStatus", v)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status!}>
                {status}
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
              <TableHead>VM Name</TableHead>
              <TableHead>Power State</TableHead>
              <TableHead className="max-w-[200px]">OS</TableHead>
              <TableHead>Overall Status</TableHead>
              <TableHead className="text-center">Jobs</TableHead>
              <TableHead>Backup Current</TableHead>
              <TableHead>Last Protected</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pagination.paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No VMs match your filters
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginatedData.map((item) => {
                const vmName = item.vm?.name ?? "—";

                return (
                  <TableRow
                    key={vmName}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => onSelectVm(item)}
                  >
                    <TableCell className="p-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVm(item);
                        }}
                        aria-label={`View details for ${vmName}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{vmName}</TableCell>
                    <TableCell>
                      <span className={
                        item.vm?.powerState?.toLowerCase() === "poweredon"
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }>
                        {item.vm?.powerState ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.vm?.guestOs}>
                      {item.vm?.guestOs ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.protectionSummary?.overallStatus} />
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {item.protectionSummary?.totalJobs ?? 0}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={item.protectionSummary?.backupCurrent ? "Success" : "Stale"}
                        showIcon={false}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(item.vm?.lastProtectedDate)}
                    </TableCell>
                  </TableRow>
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
