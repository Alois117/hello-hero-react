import { useState } from "react";
import UserLayout from "@/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Server,
  CheckCircle,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";

// Alerts imports
import { useAlerts } from "@/hooks/useAlerts";
import AlertsTable from "@/components/alerts/AlertsTable";
import AlertFilters, { type StatusFilter, type TimeRange } from "@/components/alerts/AlertFilters";
import AlertSummaryCards from "@/components/alerts/AlertSummaryCards";
import { AlertSeverity } from "@/components/alerts/SeverityBadge";

// Zabbix Hosts imports
import { useZabbixHosts } from "@/hooks/useZabbixHosts";
import {
  ZabbixHostsSummaryCards,
  ZabbixHostsFilters,
  ZabbixHostsTable,
} from "@/components/zabbix/hosts";

const Zabbix = () => {
  // Alerts State
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("all");
  const [alertSearchQuery, setAlertSearchQuery] = useState("");

  const {
    alerts,
    loading: alertsLoading,
    counts: alertCounts,
    isConnected: alertsConnected,
    lastUpdated: alertsLastUpdated,
  } = useAlerts();

  // Zabbix Hosts State & Data
  const {
    paginatedHosts,
    loading: hostsLoading,
    error: hostsError,
    counts: hostCounts,
    isConnected: hostsConnected,
    lastUpdated: hostsLastUpdated,
    searchQuery: hostSearchQuery,
    setSearchQuery: setHostSearchQuery,
    selectedGroup,
    setSelectedGroup,
    statusFilter: hostStatusFilter,
    setStatusFilter: setHostStatusFilter,
    clearFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    hosts: filteredHosts,
    uniqueGroups,
  } = useZabbixHosts(10);

  const hasActiveHostFilters =
    hostSearchQuery !== "" || selectedGroup !== null || hostStatusFilter !== "all";

  return (
    <UserLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Zabbix Metrics</h1>
            <p className="text-muted-foreground mt-1">
              Manage Zabbix alerts and monitored hosts
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="hosts" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Hosts
            </TabsTrigger>
          </TabsList>

          {/* ALERTS TAB */}
          <TabsContent value="alerts" className="space-y-6 mt-6">
            {/* Alerts Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground">
                  {alertCounts.total} active alerts
                </p>
                <div className="flex items-center gap-1 text-xs">
                  {alertsConnected ? (
                    <>
                      <Wifi className="w-3 h-3 text-success" />
                      <span className="text-success">Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-destructive" />
                      <span className="text-destructive">Offline</span>
                    </>
                  )}
                </div>
                {alertsLastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Updated: {alertsLastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <Button className="bg-gradient-to-r from-success to-primary hover:opacity-90 text-background">
                <CheckCircle className="w-4 h-4 mr-2" />
                Acknowledge All
              </Button>
            </div>

            {/* Summary Cards */}
            <AlertSummaryCards counts={alertCounts} />

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  className="pl-10"
                  value={alertSearchQuery}
                  onChange={(e) => setAlertSearchQuery(e.target.value)}
                />
              </div>
              <AlertFilters
                selectedSeverity={selectedSeverity}
                onSeverityChange={setSelectedSeverity}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                selectedTimeRange={selectedTimeRange}
                onTimeRangeChange={setSelectedTimeRange}
              />
            </div>

            {/* Alerts Table */}
            <AlertsTable
              alerts={alerts}
              loading={alertsLoading}
              selectedSeverity={selectedSeverity}
              statusFilter={statusFilter}
              timeRange={selectedTimeRange}
              searchQuery={alertSearchQuery}
            />
          </TabsContent>

          {/* HOSTS TAB */}
          <TabsContent value="hosts" className="space-y-6 mt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground">
                  {hostCounts.total} monitored hosts
                </p>
                <div className="flex items-center gap-1 text-xs">
                  {hostsConnected ? (
                    <>
                      <Wifi className="w-3 h-3 text-success" />
                      <span className="text-success">Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-destructive" />
                      <span className="text-destructive">Offline</span>
                    </>
                  )}
                </div>
                {hostsLastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Updated: {hostsLastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            <ZabbixHostsSummaryCards counts={hostCounts} />

            <ZabbixHostsFilters
              searchQuery={hostSearchQuery}
              onSearchChange={setHostSearchQuery}
              selectedGroup={selectedGroup}
              onGroupChange={setSelectedGroup}
              statusFilter={hostStatusFilter}
              onStatusChange={setHostStatusFilter}
              uniqueGroups={uniqueGroups}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveHostFilters}
            />

            <ZabbixHostsTable
              hosts={paginatedHosts}
              loading={hostsLoading}
              error={hostsError}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalHosts={filteredHosts.length}
              onPageChange={setCurrentPage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </UserLayout>
  );
};

export default Zabbix;
