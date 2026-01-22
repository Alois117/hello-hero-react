import { useMemo } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from "lucide-react";

import type { Replica } from "@/pages/user/backup-replication/types";
import { formatDateTime } from "@/pages/user/backup-replication/utils/format";
import { usePagination } from "@/pages/user/backup-replication/hooks/usePagination";
import { useTableFilter } from "@/pages/user/backup-replication/hooks/useTableFilter";

import StatusBadge from "@/pages/user/backup-replication/components/shared/StatusBadge";
import TablePagination from "@/pages/user/backup-replication/components/shared/TablePagination";
import SearchInput from "@/pages/user/backup-replication/components/shared/SearchInput";
import EmptyState from "@/pages/user/backup-replication/components/shared/EmptyState";
import LoadingTable from "@/pages/user/backup-replication/components/shared/LoadingTable";

interface ReplicasTableProps {
  data: Replica[];
  loading: boolean;
}

export default function ReplicasTable({ data, loading }: ReplicasTableProps) {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    filteredData,
  } = useTableFilter(data, {
    searchFields: ["name", "sourceVm", "target"],
  });

  const pagination = usePagination(filteredData);

  const statuses = useMemo(() => {
    const s = new Set(data.map((item) => item.status).filter(Boolean));
    return Array.from(s);
  }, [data]);

  if (loading) {
    return <LoadingTable columns={6} rows={8} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Copy}
        title="No replicas configured"
        description="No VM replicas are currently configured in your environment."
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
          placeholder="Search replicas..."
          className="w-64"
        />

        <Select value={filters["status"] ?? "all"} onValueChange={(v) => setFilter("status", v)}>
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
              <TableHead>Replica Name</TableHead>
              <TableHead>Source VM</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Last Sync</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pagination.paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No replicas match your filters
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginatedData.map((replica, idx) => (
                <TableRow key={`${replica.name}-${idx}`} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{replica.name}</TableCell>
                  <TableCell>{replica.sourceVm ?? "—"}</TableCell>
                  <TableCell>{replica.target ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={replica.status} />
                  </TableCell>
                  <TableCell>
                    {replica.health ? (
                      <Badge variant="outline">{replica.health}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(replica.lastSync)}
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
