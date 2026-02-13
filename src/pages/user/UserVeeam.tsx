import { useState } from "react";
import UserLayout from "@/layouts/UserLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Database,
  Search,
  Wifi,
  WifiOff,
  Server,
  AlertTriangle,
  HardDrive,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Shield,
  ShieldOff,
  Monitor,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Backup & Replication component
import BackupReplication from "./BackupReplication"; 

// Alarms imports
import { useVeeamAlarms, VeeamAlarm, getRelativeTime } from "@/hooks/useVeeamAlarms";
import VeeamAlarmDetailDrawer from "@/components/veeam/VeeamAlarmDetailDrawer";
import VeeamAlarmsFilters from "@/components/veeam/VeeamAlarmsFilters";

// Infrastructure imports
import { useVeeamInfrastructure, VeeamVM, formatLastBackup } from "@/hooks/useVeeamInfrastructure";
import VeeamInfrastructureFilters from "@/components/veeam/VeeamInfrastructureFilters";
import VeeamVMDetailDrawer from "@/components/veeam/VeeamVMDetailDrawer";

const UserVeeam = () => {
  const [activeTab, setActiveTab] = useState("backup");

  // Alarms state
  const [selectedAlarm, setSelectedAlarm] = useState<VeeamAlarm | null>(null);
  const [alarmDrawerOpen, setAlarmDrawerOpen] = useState(false);

  // Infrastructure state
  const [selectedVM, setSelectedVM] = useState<VeeamVM | null>(null);
  const [vmDrawerOpen, setVMDrawerOpen] = useState(false);

  // Hooks (Alarms + Infrastructure only)
  const alarmsHook = useVeeamAlarms({ pageSize: 10 });
  const infraHook = useVeeamInfrastructure({ pageSize: 9 });

  return (
    <UserLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Veeam Metrics</h1>
            <p className="text-muted-foreground">Backup & Replication Management</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-card">
            <TabsTrigger value="backup" className="gap-2">
              <HardDrive className="w-4 h-4" />
              Backup & Replication
            </TabsTrigger>
            <TabsTrigger value="alarms" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alarms
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="gap-2">
              <Server className="w-4 h-4" />
              Infrastructure
            </TabsTrigger>
          </TabsList>

          {/* Backup & Replication Tab */}
          <TabsContent value="backup" className="space-y-6">
            <BackupReplication />
          </TabsContent>

          {/* Alarms Tab */}
          <TabsContent value="alarms" className="space-y-6">
            {/* Status Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground">{alarmsHook.counts.total} alarms</p>
                <div className="flex items-center gap-1 text-xs">
                  {alarmsHook.isConnected ? (
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
                {alarmsHook.lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Updated: {alarmsHook.lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                  {alarmsHook.counts.active} Active
                </Badge>
                <Badge className="bg-warning/20 text-warning border-warning/30">
                  {alarmsHook.counts.acknowledged} Acknowledged
                </Badge>
                <Badge className="bg-success/20 text-success border-success/30">
                  {alarmsHook.counts.resolved} Resolved
                </Badge>
              </div>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search alarms, entities..."
                  value={alarmsHook.searchQuery}
                  onChange={(e) => alarmsHook.setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <VeeamAlarmsFilters
                filterStatus={alarmsHook.filterStatus}
                onFilterStatusChange={alarmsHook.setFilterStatus}
                filterSeverity={alarmsHook.filterSeverity}
                onFilterSeverityChange={alarmsHook.setFilterSeverity}
                filterEntityType={alarmsHook.filterEntityType}
                onFilterEntityTypeChange={alarmsHook.setFilterEntityType}
                entityTypes={alarmsHook.entityTypes}
                timeRange={alarmsHook.timeRange}
                onTimeRangeChange={alarmsHook.setTimeRange}
                customDateFrom={alarmsHook.customDateFrom}
                onCustomDateFromChange={alarmsHook.setCustomDateFrom}
                customDateTo={alarmsHook.customDateTo}
                onCustomDateToChange={alarmsHook.setCustomDateTo}
              />
            </div>

            {/* Loading State */}
            {alarmsHook.loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Alarm Cards */}
            {!alarmsHook.loading && (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {alarmsHook.paginatedAlarms.map((alarm, index) => (
                    <motion.div
                      key={alarm.dedupe_key || alarm.alarm_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15, delay: index * 0.02 }}
                    >
                      <Card
                        className="p-4 hover:border-primary/30 transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedAlarm(alarm);
                          setAlarmDrawerOpen(true);
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <AlertTriangle
                              className={`w-5 h-5 mt-0.5 ${
                                alarm.severity?.toLowerCase() === "critical"
                                  ? "text-destructive"
                                  : alarm.severity?.toLowerCase() === "warning"
                                  ? "text-warning"
                                  : alarm.severity?.toLowerCase() === "high"
                                  ? "text-orange-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                            <div className="flex-1 space-y-1">
                              <p className="font-medium">{alarm.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                <Server className="w-3 h-3" />
                                <span>{alarm.entity_name}</span>
                                <span>•</span>
                                <span className="text-muted-foreground/70">{alarm.entity_type}</span>
                                <span>•</span>
                                <span>{getRelativeTime(alarm.last_seen || alarm.triggered_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                alarm.severity?.toLowerCase() === "critical"
                                  ? "bg-destructive/20 text-destructive border-destructive/30"
                                  : alarm.severity?.toLowerCase() === "warning"
                                  ? "bg-warning/20 text-warning border-warning/30"
                                  : alarm.severity?.toLowerCase() === "high"
                                  ? "bg-orange-500/20 text-orange-500 border-orange-500/30"
                                  : "bg-muted/20 text-muted-foreground border-muted/30"
                              }
                            >
                              {alarm.severity}
                            </Badge>
                            <Badge
                              variant={alarm.status === "Active" ? "destructive" : "secondary"}
                              className={
                                alarm.status === "Active"
                                  ? "bg-destructive/20 text-destructive border-destructive/30"
                                  : alarm.status === "Resolved"
                                  ? "bg-success/20 text-success border-success/30"
                                  : alarm.status === "Acknowledged"
                                  ? "bg-warning/20 text-warning border-warning/30"
                                  : ""
                              }
                            >
                              {alarm.status}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {alarmsHook.paginatedAlarms.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                    <p>No alarms found</p>
                  </div>
                )}

                {alarmsHook.paginatedAlarms.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Showing 1–{alarmsHook.paginatedAlarms.length} of {alarmsHook.totalCount}
                    </p>
                    {alarmsHook.hasMore && (
                      <Button
                        variant="outline"
                        onClick={alarmsHook.loadMore}
                        className="gap-2"
                      >
                        Load more
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="space-y-6">
            {/* Status Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground">{infraHook.counts.total} VMs</p>
                <div className="flex items-center gap-1 text-xs">
                  {infraHook.isConnected ? (
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
                {infraHook.lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Updated: {infraHook.lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-success/20 text-success border-success/30">
                  {infraHook.counts.poweredOn} Powered On
                </Badge>
                <Badge className="bg-muted/20 text-muted-foreground border-muted/30">
                  {infraHook.counts.poweredOff} Powered Off
                </Badge>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {infraHook.counts.protected} Protected
                </Badge>
              </div>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search VMs, DNS, IPs..."
                  value={infraHook.searchQuery}
                  onChange={(e) => infraHook.setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <VeeamInfrastructureFilters
                filterPowerState={infraHook.filterPowerState}
                onFilterPowerStateChange={infraHook.setFilterPowerState}
                filterProtection={infraHook.filterProtection}
                onFilterProtectionChange={infraHook.setFilterProtection}
                filterCategory={infraHook.filterCategory}
                onFilterCategoryChange={infraHook.setFilterCategory}
                categories={infraHook.categories}
              />
            </div>

            {/* Loading State */}
            {infraHook.loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* VM Cards Grid */}
            {!infraHook.loading && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {infraHook.paginatedVMs.map((vm, index) => {
                      const metrics = vm.raw_json?.vm_metrics;
                      const vmName = vm.raw_json?.vm_name;

                      if (!metrics || !vmName) {
                        return (
                          <Card
                            key={vm.vmid || `invalid-${index}`}
                            className="p-6 text-center text-muted-foreground"
                          >
                            Invalid VM data
                          </Card>
                        );
                      }

                      const isPoweredOn = metrics.powerState === "PoweredOn";
                      const isProtected = !!metrics.isProtected;

                      return (
                        <motion.div
                          key={vm.vmid}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15, delay: index * 0.02 }}
                        >
                          <Card
                            className="p-4 hover:border-primary/30 transition-all cursor-pointer h-full"
                            onClick={() => {
                              setSelectedVM(vm);
                              setVMDrawerOpen(true);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${isPoweredOn ? "bg-success/10" : "bg-muted/30"}`}>
                                <Monitor className={`w-5 h-5 ${isPoweredOn ? "text-success" : "text-muted-foreground"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">
                                  {vmName || "Unnamed VM"}
                                </h4>

                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      isPoweredOn
                                        ? "text-success border-success/30"
                                        : "text-muted-foreground border-muted/30"
                                    }`}
                                  >
                                    {metrics.powerState || "Unknown"}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      metrics.connectionState === "Connected"
                                        ? "text-primary border-primary/30"
                                        : "text-destructive border-destructive/30"
                                    }`}
                                  >
                                    {metrics.connectionState || "Unknown"}
                                  </Badge>
                                </div>

                                <div className="mt-3 space-y-2 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                      <Cpu className="w-3.5 h-3.5" />
                                      CPU
                                    </span>
                                    <span className="font-medium">{metrics.cpuCount ?? "?"} vCPU</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                      <Server className="w-3.5 h-3.5" />
                                      Memory
                                    </span>
                                    <span className="font-medium">{metrics.memorySizeHuman || "? GB"}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                      <HardDrive className="w-3.5 h-3.5" />
                                      Disk
                                    </span>
                                    <span className="font-medium text-xs">
                                      {metrics.totalCommittedHuman || "?"} / {metrics.totalAllocatedHuman || "?"}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-border space-y-2 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      Last Backup
                                    </span>
                                    <span className="font-medium text-xs">
                                      {formatLastBackup(metrics.lastProtectedDate)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                      {isProtected ? (
                                        <Shield className="w-3.5 h-3.5 text-success" />
                                      ) : (
                                        <ShieldOff className="w-3.5 h-3.5 text-warning" />
                                      )}
                                      Protection
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        isProtected
                                          ? "text-success border-success/30"
                                          : "text-warning border-warning/30"
                                      }`}
                                    >
                                      {isProtected ? "Protected" : "Not Protected"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Empty State */}
                {infraHook.paginatedVMs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Server className="w-12 h-12 mb-4 opacity-50" />
                    <p>No VMs found</p>
                  </div>
                )}

                {/* Pagination */}
                {infraHook.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Showing {((infraHook.currentPage - 1) * 9) + 1}–
                      {Math.min(infraHook.currentPage * 9, infraHook.totalCount)} of{" "}
                      {infraHook.totalCount}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={infraHook.prevPage}
                        disabled={infraHook.currentPage === 1}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm px-2" aria-live="polite" aria-atomic="true">
                        {infraHook.currentPage}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={infraHook.nextPage}
                        disabled={infraHook.currentPage === infraHook.totalPages}
                        aria-label="Next page"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Drawers */}
      <VeeamAlarmDetailDrawer
        open={alarmDrawerOpen}
        onOpenChange={setAlarmDrawerOpen}
        alarm={selectedAlarm}
      />

      <VeeamVMDetailDrawer
        open={vmDrawerOpen}
        onOpenChange={setVMDrawerOpen}
        vm={selectedVM}
      />
    </UserLayout>
  );
};

export default UserVeeam;