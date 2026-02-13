import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, CheckCheck } from "lucide-react";
import TableSkeleton from "@/components/loading/TableSkeleton";
import SystemLogDetailDrawer from "./SystemLogDetailDrawer";
import { isItemRead, markItemRead, makeItemKey } from "@/utils/readState";
import { useAuth } from "@/keycloak/context/AuthContext";
import type { SystemLogEntry, SystemLogsPagination } from "@/hooks/super-admin/system-logs/types";

interface Props {
  logs: SystemLogEntry[];
  loading: boolean;
  pagination: SystemLogsPagination;
  onPageChange: (page: number) => void;
}

const severityVariant = (s: string) =>
  s === "high" ? "destructive" : s === "medium" ? "default" : "secondary";

const SystemLogsTable = ({ logs, loading, pagination, onPageChange }: Props) => {
  const { decodedToken } = useAuth();
  const userId = decodedToken?.sub || "";
  const [selectedLog, setSelectedLog] = useState<SystemLogEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Sync read state
  useEffect(() => {
    if (!userId || logs.length === 0) return;
    const set = new Set<string>();
    logs.forEach((l) => {
      const key = makeItemKey("syslog", l.id);
      if (isItemRead(userId, key)) set.add(l.id);
    });
    setReadIds(set);
  }, [userId, logs]);

  const handleRowClick = useCallback(
    (log: SystemLogEntry) => {
      // Only open drawer if there are extended details
      if (!log.details || Object.keys(log.details).length === 0) {
        // Still mark as read
        if (userId) {
          const key = makeItemKey("syslog", log.id);
          markItemRead(userId, key);
          setReadIds((prev) => new Set(prev).add(log.id));
        }
        return;
      }
      if (userId) {
        const key = makeItemKey("syslog", log.id);
        markItemRead(userId, key);
        setReadIds((prev) => new Set(prev).add(log.id));
      }
      setSelectedLog(log);
      setDrawerOpen(true);
    },
    [userId]
  );

  const handleMarkAllRead = useCallback(() => {
    if (!userId) return;
    logs.forEach((l) => {
      const key = makeItemKey("syslog", l.id);
      markItemRead(userId, key);
    });
    setReadIds(new Set(logs.map((l) => l.id)));
  }, [userId, logs]);

  if (loading) {
    return <TableSkeleton rows={10} columns={6} />;
  }

  if (logs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card flex flex-col items-center justify-center py-16"
      >
        <Search className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Logs Found</h3>
        <p className="text-muted-foreground">
          No system logs match your current filter criteria.
        </p>
      </motion.div>
    );
  }

  const { page, totalPages, total } = pagination;
  const startIndex = (page - 1) * pagination.pageSize;
  const endIndex = Math.min(startIndex + pagination.pageSize, total);
  const hasUnread = logs.some((l) => !readIds.has(l.id));

  return (
    <>
      <div className="cyber-card overflow-hidden">
        {/* Mark all read */}
        {hasUnread && (
          <div className="flex justify-end px-4 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="gap-2 text-xs text-muted-foreground"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all as read
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Timestamp</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">IP Address</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="hidden lg:table-cell">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {logs.map((log, index) => {
                  const isRead = readIds.has(log.id);
                  const hasDetails = log.details && Object.keys(log.details).length > 0;

                  return (
                    <motion.tr
                      key={log.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className={`border-border transition-colors ${
                        hasDetails ? "cursor-pointer hover:bg-muted/50" : "cursor-default"
                      } ${
                        isRead
                          ? "opacity-70"
                          : "bg-primary/[0.03] border-l-2 border-l-primary/40"
                      }`}
                      onClick={() => handleRowClick(log)}
                    >
                      <TableCell className="font-mono text-sm whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className={`${isRead ? "font-normal text-muted-foreground" : "font-semibold"}`}>
                        {log.event.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">{log.user}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-sm">
                        {log.ipAddress}
                      </TableCell>
                      <TableCell>
                        <Badge variant={severityVariant(log.severity)}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {log.source === "USER_EVENT" ? "User" : "Admin"}
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {endIndex} of {total} events
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <SystemLogDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        log={selectedLog}
      />
    </>
  );
};

export default SystemLogsTable;
