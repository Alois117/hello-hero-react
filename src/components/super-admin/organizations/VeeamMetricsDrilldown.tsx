/**
 * Veeam Metrics Drilldown for Super Admin
 * Comprehensive tabbed view mirroring the User Dashboard Veeam Metrics.
 * Tabs: Backup & Replication | Infrastructure | Jarvis Assistant
 */
import { useState } from "react";
import {
  HardDrive,
  Server,
  Brain,
  Search,
  Shield,
  ShieldOff,
  AlertCircle,
  Briefcase,
  Clock,
  Bell,
  Monitor,
  Cpu,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Copy,
  Database as DatabaseIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useOrganizationVeeamMetrics,
  type BackupReplicationData,
  type InfraVM,
  type JarvisItem,
} from "@/hooks/super-admin/organizations/useOrganizationVeeamMetrics";
import StatusBadge from "@/pages/user/backup-replication/components/shared/StatusBadge";
import { formatDateTime } from "@/pages/user/backup-replication/utils/format";
import { formatLastBackup } from "@/hooks/useVeeamInfrastructure";

interface VeeamMetricsDrilldownProps {
  orgName: string;
  clientId: number;
  onRefresh?: () => void;
}

// ── Pagination control ──────────────────────────────────────────────────────
function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  label = "items",
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (p: number) => void;
  label?: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
      <p className="text-xs text-muted-foreground">
        Showing {startIndex + 1}–{Math.min(endIndex, totalItems)} of {totalItems} {label}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs tabular-nums">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Summary mini-card ───────────────────────────────────────────────────────
function MiniStat({
  label,
  value,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  variant?: "default" | "success" | "destructive" | "warning";
}) {
  const colors = {
    default: "text-primary bg-primary/10 border-primary/20",
    success: "text-success bg-success/10 border-success/20",
    destructive: "text-destructive bg-destructive/10 border-destructive/20",
    warning: "text-warning bg-warning/10 border-warning/20",
  };
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
      <div className={`p-2 rounded-md ${colors[variant]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold tabular-nums leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ── Backup Current badge helper ─────────────────────────────────────────────
function backupCurrentBadge(bc?: boolean) {
  if (bc === true) return { label: "Current", variant: "default" as const };
  if (bc === false) return { label: "Not Current", variant: "secondary" as const };
  return { label: "—", variant: "secondary" as const };
}

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════

const VeeamMetricsDrilldown = ({ orgName, clientId }: VeeamMetricsDrilldownProps) => {
  const hook = useOrganizationVeeamMetrics({ clientId, enabled: true });
  const [activeTab, setActiveTab] = useState("backup");

  if (hook.loading && !hook.brData && hook.infraVMs.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Veeam Metrics for {orgName}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (hook.error && !hook.brData) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Card className="p-6 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium">Failed to load Veeam metrics</p>
              <p className="text-sm text-muted-foreground">{hook.error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={hook.refresh} className="ml-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const s = hook.summary;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
            <HardDrive className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Veeam Metrics — {orgName}</h3>
            <p className="text-xs text-muted-foreground">
              Combined backup, infrastructure & assistant data
              {hook.lastUpdated && ` · Updated ${hook.lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={hook.refresh} disabled={hook.loading}>
          <RefreshCw className={`w-4 h-4 ${hook.loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <MiniStat label="Total VMs" value={s.totalVMs} icon={Server} />
        <MiniStat label="Protected" value={s.protectedVMs} icon={Shield} variant="success" />
        <MiniStat label="Unprotected" value={s.unprotectedVMs} icon={ShieldOff} variant="destructive" />
        <MiniStat label="Total Jobs" value={s.totalJobs} icon={Briefcase} />
        <MiniStat
          label="Active Alerts"
          value={s.activeAlerts}
          icon={Bell}
          variant={s.activeAlerts > 0 ? "warning" : "default"}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Stale Backups" value={s.staleBackups} icon={Clock} variant={s.staleBackups > 0 ? "warning" : "default"} />
        <MiniStat label="Infra VMs" value={s.infraVMs} icon={Monitor} />
        <MiniStat label="Infra Powered On" value={s.infraPoweredOn} icon={Monitor} variant="success" />
        <MiniStat label="Infra Protected" value={s.infraProtected} icon={Shield} variant="success" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-muted/30 p-1">
          <TabsTrigger value="backup" className="gap-2 text-xs sm:text-sm">
            <HardDrive className="w-4 h-4" />
            Backup & Replication
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="gap-2 text-xs sm:text-sm">
            <Server className="w-4 h-4" />
            Infrastructure ({hook.infraVMs.length})
          </TabsTrigger>
          <TabsTrigger value="jarvis" className="gap-2 text-xs sm:text-sm">
            <Brain className="w-4 h-4" />
            Jarvis ({hook.jarvisItems.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Backup & Replication Tab ── */}
        <TabsContent value="backup" className="mt-4 space-y-4">
          <BackupReplicationTab hook={hook} />
        </TabsContent>

        {/* ── Infrastructure Tab ── */}
        <TabsContent value="infrastructure" className="mt-4 space-y-4">
          <InfrastructureTab hook={hook} />
        </TabsContent>

        {/* ── Jarvis Tab ── */}
        <TabsContent value="jarvis" className="mt-4 space-y-4">
          <JarvisTab hook={hook} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Backup & Replication Tab
// ═════════════════════════════════════════════════════════════════════════════

function BackupReplicationTab({ hook }: { hook: ReturnType<typeof useOrganizationVeeamMetrics> }) {
  const br = hook.brData;
  const [brSubTab, setBrSubTab] = useState("protected");

  if (!br) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No backup & replication data available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters (for Protected VMs) */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={hook.brSearch}
            onChange={e => hook.setBrSearch(e.target.value)}
            placeholder="Search VM or OS…"
            className="pl-9 bg-muted/30"
          />
        </div>
        <Select value={hook.brPowerFilter} onValueChange={(v: any) => hook.setBrPowerFilter(v)}>
          <SelectTrigger className="w-[130px] bg-muted/30"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="off">Powered Off</SelectItem>
          </SelectContent>
        </Select>
        <Select value={hook.brProtectedFilter} onValueChange={(v: any) => hook.setBrProtectedFilter(v)}>
          <SelectTrigger className="w-[140px] bg-muted/30"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="protected">Protected</SelectItem>
            <SelectItem value="unprotected">Unprotected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={hook.brStatusFilter} onValueChange={(v: any) => hook.setBrStatusFilter(v)}>
          <SelectTrigger className="w-[130px] bg-muted/30"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="stale">Stale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sub-tabs mirroring user dashboard */}
      <Tabs value={brSubTab} onValueChange={setBrSubTab} className="w-full">
        <TabsList className="w-full justify-start bg-muted/20 p-1 flex-wrap">
          <TabsTrigger value="protected" className="gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" /> Protected ({br.matched?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="unprotected" className="gap-1.5 text-xs">
            <ShieldOff className="h-3.5 w-3.5" /> Unprotected ({br.vmsWithoutJobs?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="orphan" className="gap-1.5 text-xs">
            <AlertCircle className="h-3.5 w-3.5" /> Orphan Jobs ({br.jobsWithoutVMs?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="multivm" className="gap-1.5 text-xs">
            <Copy className="h-3.5 w-3.5" /> Multi-VM ({br.multiVMJobs?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="replicas" className="gap-1.5 text-xs">
            <DatabaseIcon className="h-3.5 w-3.5" /> Replicas ({br.replicas?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1.5 text-xs">
            <Bell className="h-3.5 w-3.5" /> Alerts ({(br.alerts?.warnings?.length ?? 0) + (br.alerts?.critical?.length ?? 0)})
          </TabsTrigger>
        </TabsList>

        {/* Protected VMs Table */}
        <TabsContent value="protected" className="mt-3">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>VM Name</TableHead>
                  <TableHead>Power State</TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead>Protected</TableHead>
                  <TableHead>Overall Status</TableHead>
                  <TableHead className="text-right">Jobs</TableHead>
                  <TableHead>Backup Current</TableHead>
                  <TableHead>Last Protected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hook.brPagination.paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No VMs found</TableCell>
                  </TableRow>
                ) : (
                  hook.brPagination.paginatedItems.map((item, idx) => {
                    const bc = backupCurrentBadge(item.protectionSummary?.backupCurrent);
                    return (
                      <TableRow key={item.vm?.name ?? idx} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{item.vm?.name ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={item.vm?.powerState?.toLowerCase().includes("on") ? "default" : "secondary"}>
                            {item.vm?.powerState ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate" title={item.vm?.guestOs}>{item.vm?.guestOs ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={item.vm?.isProtected ? "default" : "destructive"}>
                            {item.vm?.isProtected ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell><StatusBadge status={item.protectionSummary?.overallStatus} size="sm" /></TableCell>
                        <TableCell className="text-right font-medium">{item.protectionSummary?.totalJobs ?? item.jobs?.length ?? 0}</TableCell>
                        <TableCell><Badge variant={bc.variant}>{bc.label}</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-xs">{formatDateTime(item.vm?.lastProtectedDate)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <PaginationBar
            {...hook.brPagination}
            onPageChange={hook.brPagination.setCurrentPage}
            label="VMs"
          />
        </TabsContent>

        {/* Unprotected VMs */}
        <TabsContent value="unprotected" className="mt-3">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>VM Name</TableHead>
                  <TableHead>Power State</TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead>Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(br.vmsWithoutJobs?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">No unprotected VMs</TableCell>
                  </TableRow>
                ) : (
                  br.vmsWithoutJobs.map((vm, i) => (
                    <TableRow key={vm.name || i} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{vm.name}</TableCell>
                      <TableCell>{vm.powerState ?? "—"}</TableCell>
                      <TableCell>{vm.guestOs ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{formatDateTime(vm.lastSeen)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Orphan Jobs */}
        <TabsContent value="orphan" className="mt-3">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Job Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(br.jobsWithoutVMs?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No orphan jobs</TableCell>
                  </TableRow>
                ) : (
                  br.jobsWithoutVMs.map((job, i) => (
                    <TableRow key={job.jobName || i} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{job.jobName}</TableCell>
                      <TableCell>{job.jobType ?? "—"}</TableCell>
                      <TableCell>{job.platform ?? "—"}</TableCell>
                      <TableCell>{job.schedule ?? "—"}</TableCell>
                      <TableCell><StatusBadge status={job.status} size="sm" /></TableCell>
                      <TableCell className="text-muted-foreground text-xs">{formatDateTime(job.lastRun)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Multi-VM Jobs */}
        <TabsContent value="multivm" className="mt-3">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Job Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Linked VMs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(br.multiVMJobs?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No multi-VM jobs</TableCell>
                  </TableRow>
                ) : (
                  br.multiVMJobs.map((job, i) => (
                    <TableRow key={job.jobName || i} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{job.jobName}</TableCell>
                      <TableCell>{job.jobType ?? "—"}</TableCell>
                      <TableCell>{job.platform ?? "—"}</TableCell>
                      <TableCell><Badge variant="secondary">{job.linkedVMs?.length ?? 0} VMs</Badge></TableCell>
                      <TableCell><StatusBadge status={job.status} size="sm" /></TableCell>
                      <TableCell className="text-muted-foreground text-xs">{formatDateTime(job.lastRun)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Replicas */}
        <TabsContent value="replicas" className="mt-3">
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
                {(br.replicas?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No replicas</TableCell>
                  </TableRow>
                ) : (
                  br.replicas.map((r, i) => (
                    <TableRow key={r.name || i} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.sourceVm ?? "—"}</TableCell>
                      <TableCell>{r.target ?? "—"}</TableCell>
                      <TableCell><StatusBadge status={r.status} size="sm" /></TableCell>
                      <TableCell>{r.health ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{formatDateTime(r.lastSync)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="mt-3 space-y-4">
          {(br.alerts?.critical?.length ?? 0) > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-destructive mb-2">Critical Alerts</h4>
              <div className="space-y-2">
                {br.alerts?.critical?.map((alert: any, i: number) => (
                  <div key={alert.id || i} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(alert.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(br.alerts?.warnings?.length ?? 0) > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-warning mb-2">Warnings</h4>
              <div className="space-y-2">
                {br.alerts?.warnings?.map((alert: any, i: number) => (
                  <div key={alert.id || i} className="p-3 rounded-lg border border-warning/30 bg-warning/5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(alert.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(br.alerts?.critical?.length ?? 0) === 0 && (br.alerts?.warnings?.length ?? 0) === 0 && (
            <div className="text-center py-10 text-muted-foreground">No active alerts</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Infrastructure Tab
// ═════════════════════════════════════════════════════════════════════════════

function InfrastructureTab({ hook }: { hook: ReturnType<typeof useOrganizationVeeamMetrics> }) {
  return (
    <div className="space-y-4">
      {/* Counts */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className="bg-success/20 text-success border-success/30">
          {hook.infraVMs.filter(v => v.raw_json?.vm_metrics?.powerState === "PoweredOn").length} Powered On
        </Badge>
        <Badge className="bg-muted/20 text-muted-foreground border-muted/30">
          {hook.infraVMs.filter(v => v.raw_json?.vm_metrics?.powerState === "PoweredOff").length} Powered Off
        </Badge>
        <Badge className="bg-primary/20 text-primary border-primary/30">
          {hook.infraVMs.filter(v => v.raw_json?.vm_metrics?.isProtected).length} Protected
        </Badge>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={hook.infraSearch}
            onChange={e => hook.setInfraSearch(e.target.value)}
            placeholder="Search VMs, DNS, IPs…"
            className="pl-9 bg-muted/30"
          />
        </div>
        <Select value={hook.infraPowerFilter} onValueChange={(v: any) => hook.setInfraPowerFilter(v)}>
          <SelectTrigger className="w-[140px] bg-muted/30"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="PoweredOn">Powered On</SelectItem>
            <SelectItem value="PoweredOff">Powered Off</SelectItem>
          </SelectContent>
        </Select>
        <Select value={hook.infraProtectionFilter} onValueChange={(v: any) => hook.setInfraProtectionFilter(v)}>
          <SelectTrigger className="w-[140px] bg-muted/30"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="protected">Protected</SelectItem>
            <SelectItem value="unprotected">Unprotected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* VM Cards Grid */}
      {hook.infraPagination.paginatedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Server className="w-12 h-12 mb-4 opacity-50" />
          <p>No VMs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {hook.infraPagination.paginatedItems.map((vm) => {
            const metrics = vm.raw_json?.vm_metrics;
            const vmName = vm.raw_json?.vm_name;
            if (!metrics || !vmName) {
              return <Card key={vm.vmid} className="p-4 text-center text-muted-foreground">Invalid VM data</Card>;
            }
            const isPoweredOn = metrics.powerState === "PoweredOn";
            const isProtected = !!metrics.isProtected;

            return (
              <Card key={vm.vmid} className="p-4 hover:border-primary/30 transition-all h-full border-border/50">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isPoweredOn ? "bg-success/10" : "bg-muted/30"}`}>
                    <Monitor className={`w-5 h-5 ${isPoweredOn ? "text-success" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{vmName}</h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className={`text-xs ${isPoweredOn ? "text-success border-success/30" : "text-muted-foreground border-muted/30"}`}>
                        {metrics.powerState || "Unknown"}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${metrics.connectionState === "Connected" ? "text-primary border-primary/30" : "text-destructive border-destructive/30"}`}>
                        {metrics.connectionState || "Unknown"}
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> CPU</span>
                        <span className="font-medium">{metrics.cpuCount ?? "?"} vCPU</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1"><Server className="w-3.5 h-3.5" /> Memory</span>
                        <span className="font-medium">{metrics.memorySizeHuman || "? GB"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> Disk</span>
                        <span className="font-medium text-xs">{metrics.totalCommittedHuman || "?"} / {metrics.totalAllocatedHuman || "?"}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Last Backup</span>
                        <span className="font-medium text-xs">{formatLastBackup(metrics.lastProtectedDate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          {isProtected ? <Shield className="w-3.5 h-3.5 text-success" /> : <ShieldOff className="w-3.5 h-3.5 text-warning" />}
                          Protection
                        </span>
                        <Badge variant="outline" className={`text-xs ${isProtected ? "text-success border-success/30" : "text-warning border-warning/30"}`}>
                          {isProtected ? "Protected" : "Not Protected"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <PaginationBar
        {...hook.infraPagination}
        onPageChange={hook.infraPagination.setCurrentPage}
        label="VMs"
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Jarvis Tab
// ═════════════════════════════════════════════════════════════════════════════

function JarvisTab({ hook }: { hook: ReturnType<typeof useOrganizationVeeamMetrics> }) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={hook.jarvisSearch}
          onChange={e => hook.setJarvisSearch(e.target.value)}
          placeholder="Search Jarvis responses…"
          className="pl-9 bg-muted/30"
        />
      </div>

      {hook.jarvisPagination.paginatedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Brain className="w-12 h-12 mb-4 opacity-50" />
          <p>{hook.jarvisSearch ? "No results match your search" : "No Jarvis data available"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hook.jarvisPagination.paginatedItems.map(item => (
            <Card key={item.id} className="p-4 border-border/50 hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Brain className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.severity && (
                        <Badge variant="outline" className="text-xs capitalize">{item.severity}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{item.timestamp.toLocaleString()}</span>
                    </div>
                  </div>
                  {item.content && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                  )}
                  <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PaginationBar
        {...hook.jarvisPagination}
        onPageChange={hook.jarvisPagination.setCurrentPage}
        label="items"
      />
    </div>
  );
}

export default VeeamMetricsDrilldown;
