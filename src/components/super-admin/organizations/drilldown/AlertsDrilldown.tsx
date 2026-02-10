/**
 * Alerts Drilldown Component
 * Shows detailed alerts list for the selected organization
 * Includes pagination (8 per page) with next/previous controls
 */
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import { format } from "date-fns";

interface AlertsDrilldownProps {
  orgName: string;
  alerts: AlertItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onItemClick?: (item: AlertItem) => void;
}

type AlertFilter = "all" | "active" | "critical" | "acknowledged";

const PAGE_SIZE = 8;

const severityColors: Record<string, string> = {
  disaster: "bg-destructive/20 text-destructive border-destructive/30",
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-warning/20 text-warning border-warning/30",
  warning: "bg-warning/20 text-warning border-warning/30",
  average: "bg-accent/20 text-accent border-accent/30",
  info: "bg-primary/20 text-primary border-primary/30",
  information: "bg-primary/20 text-primary border-primary/30",
};

const AlertsDrilldown = ({ orgName, alerts, loading, error, onRefresh, onItemClick }: AlertsDrilldownProps) => {
  const [filter, setFilter] = useState<AlertFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAlerts = useMemo(() => {
    let result = alerts;

    // Apply filter
    switch (filter) {
      case "active":
        result = result.filter((a) => a.status === "active" || !a.acknowledged);
        break;
      case "critical":
        result = result.filter((a) => a.severity === "critical" || a.severity === "disaster");
        break;
      case "acknowledged":
        result = result.filter((a) => a.acknowledged);
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((a) => {
        const title = (a.title || "").toLowerCase();
        const host = (a.host || "").toLowerCase();
        const msg = (a.message || "").toLowerCase();
        return title.includes(query) || host.includes(query) || msg.includes(query);
      });
    }

    // Sort latest first
    return [...result].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [alerts, filter, searchQuery]);

  const counts = useMemo(
    () => ({
      all: alerts.length,
      active: alerts.filter((a) => a.status === "active" || !a.acknowledged).length,
      critical: alerts.filter((a) => a.severity === "critical" || a.severity === "disaster").length,
      acknowledged: alerts.filter((a) => a.acknowledged).length,
    }),
    [alerts]
  );

  // Reset page when dataset changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, alerts]);

  const totalItems = filteredAlerts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAlerts.slice(start, start + PAGE_SIZE);
  }, [filteredAlerts, currentPage]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalItems);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  if (error) {
    return (
      <Card className="p-6 border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-medium">Failed to load alerts</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} className="ml-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Alerts for {orgName}
          </h3>
          <p className="text-sm text-muted-foreground">Monitoring alerts and issues for this organization</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as AlertFilter)} className="flex-shrink-0">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="text-xs">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Active ({counts.active})
            </TabsTrigger>
            <TabsTrigger value="critical" className="text-xs">
              Critical ({counts.critical})
            </TabsTrigger>
            <TabsTrigger value="acknowledged" className="text-xs">
              Ack ({counts.acknowledged})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Input
          placeholder="Search alerts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs bg-background/50"
        />
      </div>

      {/* Alerts List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2 pr-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4 border-border/50">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </Card>
            ))
          ) : totalItems === 0 ? (
            <Card className="p-8 border-border/50 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-success/50 mb-4" />
              <p className="text-muted-foreground">{searchQuery ? "No alerts match your search" : "No alerts found"}</p>
            </Card>
          ) : (
            paginatedAlerts.map((alert) => (
              <Card
                key={alert.id}
                className="p-4 border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => onItemClick?.(alert)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onItemClick?.(alert)}
                aria-label={`View details for alert: ${alert.title}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${severityColors[alert.severity] || severityColors.info}`}
                      >
                        {alert.severity}
                      </Badge>
                      {alert.acknowledged && (
                        <Badge variant="outline" className="text-xs border-success/30 bg-success/10 text-success">
                          Acknowledged
                        </Badge>
                      )}
                    </div>

                    <p className="font-medium truncate">{alert.title}</p>

                    {alert.host && (
                      <p className="text-sm text-muted-foreground truncate">Host: {alert.host}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {format(alert.timestamp, "MMM dd, HH:mm")}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Pagination Controls */}
      {!loading && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{startIndex}</span>–
            <span className="font-medium text-foreground">{endIndex}</span> of{" "}
            <span className="font-medium text-foreground">{totalItems}</span> alerts
          </p>

          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-xs text-muted-foreground px-2">
              Page <span className="text-foreground font-medium">{currentPage}</span> / {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={!canNext}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsDrilldown;
