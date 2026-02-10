/**
 * Hosts Drilldown Component
 * Shows detailed Zabbix hosts list for the selected organization
 * Includes pagination (8 per page) with next/previous controls
 */
import { useEffect, useMemo, useState } from "react";
import { Server, RefreshCw, Wifi, WifiOff, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HostItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";

interface HostsDrilldownProps {
  orgName: string;
  hosts: HostItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onItemClick?: (item: HostItem) => void;
}

type HostFilter = "all" | "enabled" | "disabled";

const PAGE_SIZE = 8;

const HostsDrilldown = ({ orgName, hosts, loading, error, onRefresh, onItemClick }: HostsDrilldownProps) => {
  const [filter, setFilter] = useState<HostFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredHosts = useMemo(() => {
    let result = hosts;

    // Apply filter (status 0 = enabled, non-0 = disabled)
    switch (filter) {
      case "enabled":
        result = result.filter((h) => h.status === 0);
        break;
      case "disabled":
        result = result.filter((h) => h.status !== 0);
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((h) => {
        const name = (h.name || "").toLowerCase();
        const host = (h.host || "").toLowerCase();
        const groupMatch = h.groups?.some((g) => (g || "").toLowerCase().includes(query));
        return name.includes(query) || host.includes(query) || !!groupMatch;
      });
    }

    // Sort stable, by name
    return [...result].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [hosts, filter, searchQuery]);

  const counts = useMemo(
    () => ({
      all: hosts.length,
      enabled: hosts.filter((h) => h.status === 0).length,
      disabled: hosts.filter((h) => h.status !== 0).length,
    }),
    [hosts]
  );

  // Reset to page 1 when result set changes (filter/search/new data)
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, hosts]);

  const totalItems = filteredHosts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const paginatedHosts = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredHosts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredHosts, currentPage]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalItems);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  if (error) {
    return (
      <Card className="p-6 border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-medium">Failed to load hosts</p>
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
            <Server className="w-5 h-5 text-primary" />
            Zabbix Hosts for {orgName}
          </h3>
          <p className="text-sm text-muted-foreground">Monitored hosts and their current status</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as HostFilter)} className="flex-shrink-0">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="text-xs">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="enabled" className="text-xs">
              Enabled ({counts.enabled})
            </TabsTrigger>
            <TabsTrigger value="disabled" className="text-xs">
              Disabled ({counts.disabled})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Input
          placeholder="Search hosts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs bg-background/50"
        />
      </div>

      {/* Hosts List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2 pr-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4 border-border/50">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </Card>
            ))
          ) : totalItems === 0 ? (
            <Card className="p-8 border-border/50 text-center">
              <Server className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{searchQuery ? "No hosts match your search" : "No hosts found"}</p>
            </Card>
          ) : (
            paginatedHosts.map((host) => (
              <Card
                key={host.hostid}
                className="p-4 border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => onItemClick?.(host)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onItemClick?.(host)}
                aria-label={`View details for host: ${host.name}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
                      p-2.5 rounded-lg
                      ${host.status === 0 ? "bg-success/10 border border-success/20" : "bg-muted/50 border border-muted/30"}
                    `}
                  >
                    {host.status === 0 ? (
                      <Wifi className="w-5 h-5 text-success" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{host.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{host.host}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {host.groups && host.groups.length > 0 && (
                      <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                        {host.groups[0]}
                        {host.groups.length > 1 && ` +${host.groups.length - 1}`}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        host.status === 0
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-muted/30 bg-muted/10 text-muted-foreground"
                      }`}
                    >
                      {host.status === 0 ? "Enabled" : "Disabled"}
                    </Badge>
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
            <span className="font-medium text-foreground">{totalItems}</span> hosts
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

export default HostsDrilldown;
