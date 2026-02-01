import { Server, Loader2, AlertCircle, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import TablePagination from "@/components/ui/table-pagination";
import ZabbixHostStatusBadge from "./ZabbixHostStatusBadge";
import { ZabbixHost } from "@/hooks/useZabbixHosts";

interface ZabbixHostsTableProps {
  hosts: ZabbixHost[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalHosts: number;
  onPageChange: (page: number) => void;
}

/**
 * Table display for Zabbix Hosts
 * Handles loading, error, and empty states gracefully
 */
const ZabbixHostsTable = ({
  hosts,
  loading,
  error,
  currentPage,
  totalPages,
  pageSize,
  totalHosts,
  onPageChange,
}: ZabbixHostsTableProps) => {
  // Loading state - skeleton rows
  if (loading && hosts.length === 0) {
    return (
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Host</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Veeam Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  // Error state
  if (error && hosts.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Hosts</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Card>
    );
  }

  // Empty state
  if (hosts.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Server className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Hosts Found</h3>
          <p className="text-muted-foreground">
            No hosts match your current filters. Try adjusting your search or filters.
          </p>
        </div>
      </Card>
    );
  }

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + hosts.length;

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Host</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Groups</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Veeam Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hosts.map((host) => (
            <TableRow key={host.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{host.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {host.id}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-sm bg-muted px-2 py-0.5 rounded">
                  {host.ip}
                </code>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {host.groups.length > 0 ? (
                    host.groups.slice(0, 2).map((group) => (
                      <Badge key={group} variant="secondary" className="text-xs">
                        {group}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                  {host.groups.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{host.groups.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <ZabbixHostStatusBadge status={host.status} />
              </TableCell>
              <TableCell>
                {host.linkedVeeamMoref ? (
                  <div className="flex items-center gap-1 text-secondary">
                    <Link2 className="w-4 h-4" />
                    <span className="text-xs truncate max-w-[100px]">
                      {host.linkedVeeamMoref}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalHosts}
        startIndex={startIndex}
        endIndex={endIndex}
        itemName="hosts"
        onPageChange={onPageChange}
      />
    </Card>
  );
};

export default ZabbixHostsTable;
