import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldPlus } from "lucide-react";

import type { UnprotectedVm } from "@/pages/user/backup-replication/types";
import { formatRelativeTime } from "@/pages/user/backup-replication/utils/format";
import { usePagination } from "@/pages/user/backup-replication/hooks/usePagination";
import { useTableFilter } from "@/pages/user/backup-replication/hooks/useTableFilter";

import TablePagination from "@/pages/user/backup-replication/components/shared/TablePagination";
import SearchInput from "@/pages/user/backup-replication/components/shared/SearchInput";
import EmptyState from "@/pages/user/backup-replication/components/shared/EmptyState";
import LoadingTable from "@/pages/user/backup-replication/components/shared/LoadingTable";

interface UnprotectedVmTableProps {
  data: UnprotectedVm[];
  loading: boolean;
  onAddProtection?: (vm: UnprotectedVm) => void;
}

export default function UnprotectedVmTable({
  data,
  loading,
  onAddProtection,
}: UnprotectedVmTableProps) {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    filteredData,
  } = useTableFilter(data, {
    searchFields: ["name", "guestOs"],
  });

  const pagination = usePagination(filteredData);

  const powerStates = useMemo(() => {
    const states = new Set(data.map((item) => item.powerState).filter(Boolean));
    return Array.from(states);
  }, [data]);

  if (loading) {
    return <LoadingTable columns={5} rows={8} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="No unprotected VMs"
        description="All virtual machines are protected by backup jobs. Great job!"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <ShieldPlus className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-medium text-amber-700 dark:text-amber-400">
              {data.length} VM{data.length !== 1 ? "s" : ""} without backup protection
            </p>
            <p className="text-sm text-muted-foreground">
              These VMs are not associated with any backup jobs and may be at risk.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by VM name..."
          className="w-64"
        />

        <Select value={filters["powerState"] ?? "all"} onValueChange={(v) => setFilter("powerState", v)}>
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
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>VM Name</TableHead>
              <TableHead>Power State</TableHead>
              <TableHead className="max-w-[250px]">Operating System</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pagination.paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No VMs match your filters
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginatedData.map((vm) => (
                <TableRow key={vm.name} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{vm.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        vm.powerState?.toLowerCase() === "poweredon"
                          ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {vm.powerState ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate" title={vm.guestOs}>
                    {vm.guestOs ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRelativeTime(vm.lastSeen)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddProtection?.(vm)}
                      className="text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                    >
                      <ShieldPlus className="mr-1.5 h-3.5 w-3.5" />
                      Add Protection
                    </Button>
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
