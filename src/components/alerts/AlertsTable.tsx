import { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
import { Clock, CheckCircle, ChevronLeft, ChevronRight, Search } from "lucide-react";
import SeverityBadge, { AlertSeverity } from "./SeverityBadge";
import AlertActionMenu from "./AlertActionMenu";
import AlertDetailDrawer from "./AlertDetailDrawer";
import TableSkeleton from "@/components/loading/TableSkeleton";
import { isItemRead, markItemRead } from "@/utils/readState";
import { useAuth } from "@/keycloak/context/AuthContext";
import type { StatusFilter, TimeRange } from "./AlertFilters";

export interface Alert {
  id: number;
  severity: AlertSeverity;
  host: string;
  category: string;
  problem: string;
  duration: string;
  scope?: string;
  acknowledged: boolean;
  status: "active" | "acknowledged" | "resolved";
  timestamp: string;
  aiInsights?: string;
  timesSent?: number;
  seenCount?: number;
  firstSeen?: string;
  lastSeen?: string;
  dedupeKey?: string;
  rawMetadata?: {
    name?: string;
    clock?: string | number;
    eventid?: string;
    r_clock?: string;
    objectid?: string;
    severity?: string;
    [key: string]: unknown;
  };
}

/** Convert a TimeRange value to a cutoff Date (or null for "all") */
const getTimeCutoff = (range: TimeRange): Date | null => {
  if (range === "all") return null;
  const now = Date.now();
  const ms: Record<string, number> = {
    "1h": 3_600_000,
    "6h": 21_600_000,
    "24h": 86_400_000,
    "7d": 604_800_000,
  };
  return new Date(now - (ms[range] ?? 0));
};

/** Best-effort parse of an alert's effective timestamp in ms */
const getAlertEpoch = (alert: Alert): number => {
  // Prefer lastSeen (ISO string)
  if (alert.lastSeen) {
    const d = new Date(alert.lastSeen);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  // Then firstSeen
  if (alert.firstSeen) {
    const d = new Date(alert.firstSeen);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  // Then raw clock (epoch seconds)
  const rawClock = (alert.rawMetadata as any)?.clock;
  if (rawClock) {
    const epoch = typeof rawClock === "number" ? rawClock : parseInt(rawClock, 10);
    if (!isNaN(epoch)) return epoch > 1e12 ? epoch : epoch * 1000;
  }
  return 0;
};

interface AlertsTableProps {
  alerts?: Alert[];
  loading?: boolean;
  selectedSeverity?: AlertSeverity | "all";
  statusFilter?: StatusFilter;
  timeRange?: TimeRange;
  searchQuery?: string;
}

const AlertsTable = ({
  alerts = [],
  loading = false,
  selectedSeverity = "all",
  statusFilter = "all",
  timeRange = "all",
  searchQuery = "",
}: AlertsTableProps) => {
  const { decodedToken } = useAuth();
  const userId = decodedToken?.sub || '';
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const itemsPerPage = 5;

  // ── Filtering ──
  const filteredAlerts = useMemo(() => {
    const timeCutoff = getTimeCutoff(timeRange);

    return alerts.filter((alert) => {
      // Severity (single-select)
      if (selectedSeverity !== "all" && alert.severity !== selectedSeverity) return false;

      // Status
      if (statusFilter === "active" && alert.acknowledged) return false;
      if (statusFilter === "acknowledged" && !alert.acknowledged) return false;

      // Time range
      if (timeCutoff) {
        const epoch = getAlertEpoch(alert);
        if (epoch > 0 && epoch < timeCutoff.getTime()) return false;
      }

      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          alert.host.toLowerCase().includes(query) ||
          alert.problem.toLowerCase().includes(query) ||
          alert.category.toLowerCase().includes(query) ||
          (alert.aiInsights?.toLowerCase().includes(query) ?? false)
        );
      }

      return true;
    });
  }, [alerts, selectedSeverity, statusFilter, timeRange, searchQuery]);

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlerts = filteredAlerts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSeverity, statusFilter, timeRange, searchQuery]);

  // Keep page in bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Sync read state
  useEffect(() => {
    if (!userId || alerts.length === 0) return;
    const set = new Set<string>();
    alerts.forEach(a => {
      if (isItemRead(userId, String(a.id))) set.add(String(a.id));
    });
    setReadIds(set);
  }, [userId, alerts]);

  const handleRowClick = useCallback((alert: Alert) => {
    const aid = String(alert.id);
    if (userId && !readIds.has(aid)) {
      markItemRead(userId, aid);
      setReadIds(prev => new Set(prev).add(aid));
    }
    setSelectedAlert(alert);
    setDrawerOpen(true);
  }, [userId, readIds]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, alert: Alert, index: number) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        handleRowClick(alert);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedRowIndex(Math.min(index + 1, currentAlerts.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedRowIndex(Math.max(index - 1, 0));
        break;
      case "Escape":
        if (drawerOpen) setDrawerOpen(false);
        break;
    }
  }, [currentAlerts.length, handleRowClick, drawerOpen]);

  if (loading) {
    return <TableSkeleton rows={5} columns={7} />;
  }

  if (filteredAlerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="cyber-card flex flex-col items-center justify-center py-16"
      >
        <Search className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Alerts Found</h3>
        <p className="text-muted-foreground mb-4">
          {alerts.length === 0
            ? "No alerts available from the monitoring system"
            : "No alerts match your current filter criteria"
          }
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="cyber-card overflow-hidden">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <Table role="table" aria-label="Alerts table">
            <TableHeader>
              <TableRow>
                <TableHead role="columnheader" className="w-24">Severity</TableHead>
                <TableHead role="columnheader" className="w-32 sm:w-auto">Host</TableHead>
                <TableHead role="columnheader" className="hidden sm:table-cell">Category</TableHead>
                <TableHead role="columnheader" className="min-w-[200px]">Problem</TableHead>
                <TableHead role="columnheader" className="hidden md:table-cell">Duration</TableHead>
                <TableHead role="columnheader" className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="text-right w-20" role="columnheader">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {currentAlerts.map((alert, index) => (
                  <motion.tr
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    whileHover={{ scale: 1.005 }}
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                      readIds.has(String(alert.id)) ? 'opacity-70' : 'bg-primary/[0.03] border-l-2 border-l-primary/40'
                    }`}
                    onClick={() => handleRowClick(alert)}
                    onKeyDown={(e) => handleKeyDown(e, alert, index)}
                    tabIndex={0}
                    role="row"
                    aria-label={`Alert ${alert.severity} on ${alert.host}: ${alert.problem}`}
                  >
                    <TableCell role="cell" className="whitespace-nowrap">
                      <SeverityBadge severity={alert.severity} />
                    </TableCell>
                    <TableCell role="cell" className="whitespace-nowrap">
                      <Badge variant="outline" className="text-xs">{alert.host}</Badge>
                    </TableCell>
                    <TableCell role="cell" className="hidden sm:table-cell whitespace-nowrap">
                      <Badge variant="secondary" className="text-xs">{alert.category}</Badge>
                    </TableCell>
                    <TableCell className={`min-w-[200px] sm:min-w-[250px] ${readIds.has(String(alert.id)) ? 'font-normal text-muted-foreground' : 'font-semibold'}`} role="cell">
                      <span className="line-clamp-2">{alert.problem}</span>
                    </TableCell>
                    <TableCell role="cell" className="hidden md:table-cell whitespace-nowrap">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {alert.duration}
                      </span>
                    </TableCell>
                    <TableCell role="cell" className="hidden lg:table-cell whitespace-nowrap">
                      {alert.acknowledged ? (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <CheckCircle className="w-3 h-3" aria-hidden="true" />
                          <span className="hidden xl:inline">Acknowledged</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Active</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()} role="cell">
                      <AlertActionMenu
                        alertId={alert.id}
                        acknowledged={alert.acknowledged}
                        onViewDetails={() => handleRowClick(alert)}
                      />
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAlerts.length)} of{" "}
              {filteredAlerts.length} alerts
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm" aria-live="polite" aria-atomic="true">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        alert={selectedAlert}
      />
    </>
  );
};

export default AlertsTable;
