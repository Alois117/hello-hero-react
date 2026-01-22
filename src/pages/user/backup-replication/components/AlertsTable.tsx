import { useMemo } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, AlertCircle, AlertTriangle, Info } from "lucide-react";

import type { AlertItem } from "@/pages/user/backup-replication/types";
import { formatDateTime } from "@/pages/user/backup-replication/utils/format";
import { usePagination } from "@/pages/user/backup-replication/hooks/usePagination";
import { useTableFilter } from "@/pages/user/backup-replication/hooks/useTableFilter";

import TablePagination from "@/pages/user/backup-replication/components/shared/TablePagination";
import SearchInput from "@/pages/user/backup-replication/components/shared/SearchInput";
import EmptyState from "@/pages/user/backup-replication/components/shared/EmptyState";
import LoadingTable from "@/pages/user/backup-replication/components/shared/LoadingTable";

interface AlertsTableProps {
  data: AlertItem[];
  loading: boolean;
}

function SeverityIcon({ severity }: { severity: AlertItem["severity"] }) {
  if (severity === "critical") {
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  }
  if (severity === "warning") {
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  }
  return <Info className="h-4 w-4 text-blue-500" />;
}

function SeverityBadge({ severity }: { severity: AlertItem["severity"] }) {
  const config = {
    critical: {
      className: "bg-red-500/15 text-red-600 border-red-500/30",
      label: "Critical",
    },
    warning: {
      className: "bg-amber-500/15 text-amber-600 border-amber-500/30",
      label: "Warning",
    },
    info: {
      className: "bg-blue-500/15 text-blue-600 border-blue-500/30",
      label: "Info",
    },
  };

  const c = config[severity] || config.info;

  return (
    <Badge variant="secondary" className={`font-medium border ${c.className}`}>
      {c.label}
    </Badge>
  );
}

export default function AlertsTable({ data, loading }: AlertsTableProps) {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    filteredData,
  } = useTableFilter(data, {
    searchFields: ["message", "relatedVm", "relatedJob"],
  });

  const pagination = usePagination(filteredData);

  // Sort by severity and timestamp
  const sortedData = useMemo(() => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return [...filteredData].sort((a, b) => {
      const sevDiff = (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [filteredData]);

  const paginatedSorted = usePagination(sortedData);

  if (loading) {
    return <LoadingTable columns={5} rows={8} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No active alerts"
        description="All systems are operating normally. No alerts to display."
      />
    );
  }

  const criticalCount = data.filter((a) => a.severity === "critical").length;
  const warningCount = data.filter((a) => a.severity === "warning").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {(criticalCount > 0 || warningCount > 0) && (
        <div className={`rounded-lg p-4 border ${
          criticalCount > 0 
            ? "bg-red-500/10 border-red-500/30" 
            : "bg-amber-500/10 border-amber-500/30"
        }`}>
          <div className="flex items-center gap-3">
            <SeverityIcon severity={criticalCount > 0 ? "critical" : "warning"} />
            <div>
              <p className={`font-medium ${criticalCount > 0 ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400"}`}>
                {criticalCount > 0 && `${criticalCount} critical`}
                {criticalCount > 0 && warningCount > 0 && ", "}
                {warningCount > 0 && `${warningCount} warning`}
                {" "}alert{criticalCount + warningCount !== 1 ? "s" : ""} active
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search alerts..."
          className="w-64"
        />

        <Select value={filters["severity"] ?? "all"} onValueChange={(v) => setFilter("severity", v)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[100px]">Severity</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Related VM</TableHead>
              <TableHead>Related Job</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedSorted.paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No alerts match your filters
                </TableCell>
              </TableRow>
            ) : (
              paginatedSorted.paginatedData.map((alert) => (
                <TableRow key={alert.id} className="hover:bg-muted/30">
                  <TableCell>
                    <SeverityBadge severity={alert.severity} />
                  </TableCell>
                  <TableCell className="max-w-[400px]">{alert.message}</TableCell>
                  <TableCell className="text-muted-foreground">{alert.relatedVm ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{alert.relatedJob ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(alert.timestamp)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={paginatedSorted.currentPage}
        totalPages={paginatedSorted.totalPages}
        totalItems={paginatedSorted.totalItems}
        startIndex={paginatedSorted.startIndex}
        endIndex={paginatedSorted.endIndex}
        pageSize={paginatedSorted.pageSize}
        onPageChange={paginatedSorted.setCurrentPage}
        onPageSizeChange={paginatedSorted.setPageSize}
        canGoNext={paginatedSorted.canGoNext}
        canGoPrevious={paginatedSorted.canGoPrevious}
        onFirstPage={paginatedSorted.goToFirstPage}
        onLastPage={paginatedSorted.goToLastPage}
        onNextPage={paginatedSorted.goToNextPage}
        onPreviousPage={paginatedSorted.goToPreviousPage}
      />
    </div>
  );
}
