import { useState, useMemo, useEffect, useCallback, useRef } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Search,
  TriangleAlert,
  Shield,
  ShieldOff,
  Briefcase,
  Clock,
  Bell,
  Plus,
  Pencil,
  Power,
  PowerOff,
  Server,
  AlertCircle,
  Copy,
  Database,
  Wifi,
  WifiOff,
} from "lucide-react";

import type {
  Job,
  MatchedVm,
  UnprotectedVm,
  OrphanJob,
  MultiVmJob,
  Replica,
  ChangedJob,
} from "@/pages/user/backup-replication/types";
import { formatDateTime } from "@/pages/user/backup-replication/utils/format";
import { usePagination } from "@/pages/user/backup-replication/hooks/usePagination";
import StatusBadge from "@/pages/user/backup-replication/components/shared/StatusBadge";
import TablePagination from "@/pages/user/backup-replication/components/shared/TablePagination";
import VmDrawer from "@/pages/user/backup-replication/components/VmDrawer";
import JobDetailDrawer from "@/pages/user/backup-replication/components/JobDetailDrawer";
import ChangeActivityDrawer from "@/pages/user/backup-replication/components/ChangeActivityDrawer";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { WEBHOOK_BACKUP_REPLICATION_URL } from "@/config/env";
import { safeParseResponse } from "@/lib/safeFetch";

const ENDPOINT = WEBHOOK_BACKUP_REPLICATION_URL;

type Status = "idle" | "loading" | "success" | "error";

type MainObject = {
  summary?: any;
  matched?: MatchedVm[];
  alerts?: any;
  statistics?: any;
  vmsWithoutJobs?: UnprotectedVm[];
  jobsWithoutVMs?: OrphanJob[];
  multiVMJobs?: MultiVmJob[];
  replicas?: Replica[];
};

type MetaObject = {
  changes?: any;
  summary?: any;
};

function safeLower(v: unknown) {
  return String(v ?? "").toLowerCase();
}

function backupCurrentBadge(backupCurrent?: boolean) {
  if (backupCurrent === true) return { label: "Current", variant: "default" as const };
  if (backupCurrent === false) return { label: "Not Current", variant: "secondary" as const };
  return { label: "—", variant: "secondary" as const };
}

function formatCount(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n.toLocaleString() : "—";
}

// ================== Summary Card Components ==================

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  variant: "info" | "success" | "warning" | "danger";
  onClick?: () => void;
}

function SummaryCard({ title, value, icon: Icon, variant, onClick }: SummaryCardProps) {
  const iconClasses = {
    info: "text-primary bg-primary/10",
    success: "text-emerald-500 bg-emerald-500/10",
    warning: "text-amber-500 bg-amber-500/10",
    danger: "text-destructive bg-destructive/10",
  };

  return (
    <Card
      onClick={onClick}
      className={`
        px-4 py-3
        rounded-lg
        border ${variant ? `border-${variant}/30 hover:border-${variant}/50` : "border-primary/30 hover:border-primary/50"}
        cursor-pointer
        transition-all
        hover:shadow-md
        flex flex-col items-center text-center
      `}
    >
      <div className={`mb-2 p-2 rounded-md ${iconClasses[variant]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="mt-1 text-xs font-medium text-muted-foreground">{title}</div>
      <div className="text-2xl font-semibold tracking-tight tabular-nums leading-none">{value}</div>
    </Card>
  );
}

interface ChangeSummaryCardProps {
  newJobs: number;
  modifiedJobs: number;
  enabledJobs: number;
  disabledJobs: number;
  onClick: () => void;
}

function ChangeSummaryCard({
  newJobs,
  modifiedJobs,
  enabledJobs,
  disabledJobs,
  onClick,
}: ChangeSummaryCardProps) {
  const total = newJobs + modifiedJobs + enabledJobs + disabledJobs;

  return (
    <Card
      onClick={onClick}
      className="
        px-4 py-3
        rounded-lg
        border border-primary/30
        hover:border-primary/50
        cursor-pointer
        transition-all
        hover:shadow-md
        flex flex-col items-center text-center
      "
    >
      <div className="mb-2 p-2 rounded-md bg-primary/10 text-primary">
        <Pencil className="w-4 h-4" />
      </div>
      <div className="mt-1 text-xs font-medium text-muted-foreground">Change Activity</div>
      <div className="text-2xl font-semibold tracking-tight tabular-nums leading-none">{total}</div>
    </Card>
  );
}

// ================== Main Component ==================

const BackupReplication = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<unknown>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  // Drawer states
  const [selectedVm, setSelectedVm] = useState<MatchedVm | null>(null);
  const [vmDrawerOpen, setVmDrawerOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobDrawerOpen, setJobDrawerOpen] = useState(false);
  const [changeDrawerOpen, setChangeDrawerOpen] = useState(false);

  // Current view tab
  const [activeView, setActiveView] = useState("protected");

  const loading = status === "loading";
  const { authenticatedFetch } = useAuthenticatedFetch();

  // Track whether we have ever successfully loaded data,
  // so silent refresh failures don't flip UI to error state.
  const hasLoadedOnceRef = useRef(false);

  const refresh = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setStatus("loading");
      if (!isSilent) setError(null);

      try {
        const res = await authenticatedFetch(ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
        });

        // Centralized safe parsing (NO res.json() directly)
        const result = await safeParseResponse<unknown>(res, ENDPOINT);

        if (!result.ok) {
          // Console-only technical details (safeParseResponse should already be sanitizing)
          console.error("[BackupReplication] Fetch error:", {
            endpoint: ENDPOINT,
            status: result.status,
            userMessage: result.userMessage,
            debug: (result as any).debug,
            errorId: (result as any).errorId,
          });

          // On silent refresh, do not wipe UI state if we've already loaded once
          if (isSilent && hasLoadedOnceRef.current) return;

          setError(result.userMessage || "We couldn't load backup & replication data. Please try again.");
          setStatus("error");
          return;
        }

        // If webhook returns nothing / empty body, treat as "no data yet"
        if (!result.data) {
          setRaw(null);
          setLastUpdatedAt(new Date());
          setStatus("success");
          setError(null);
          hasLoadedOnceRef.current = true;
          return;
        }

        setRaw(result.data);
        setLastUpdatedAt(new Date());
        setStatus("success");
        setError(null);
        hasLoadedOnceRef.current = true;
      } catch (e: unknown) {
        // Network errors or unexpected exceptions
        console.error("[BackupReplication] Unexpected fetch exception:", e);

        if (isSilent && hasLoadedOnceRef.current) return;

        setError("We couldn't load backup & replication data. Please try again.");
        setStatus("error");
      }
    },
    [authenticatedFetch]
  );

  useEffect(() => {
    refresh(false);
    const interval = setInterval(() => refresh(true), 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Search & filter state
  const [query, setQuery] = useState("");
  const [protectedFilter, setProtectedFilter] = useState<"all" | "protected" | "unprotected">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "warning" | "stale">("all");
  const [powerStateFilter, setPowerStateFilter] = useState<"all" | "running" | "off">("all");

  // Parse API response
  const { main, meta } = useMemo<{ main: MainObject; meta: MetaObject }>(() => {
    const arr = Array.isArray(raw) ? (raw as unknown[]) : null;
    const mainObj = (arr?.[0] ?? {}) as MainObject;
    const metaObj = (arr?.[1] ?? {}) as MetaObject;
    return { main: mainObj, meta: metaObj };
  }, [raw]);

  const summary = main?.summary ?? null;
  const matched = (main?.matched ?? []) as MatchedVm[];
  const alerts = main?.alerts ?? null;
  const vmsWithoutJobs = main?.vmsWithoutJobs ?? [];
  const jobsWithoutVMs = main?.jobsWithoutVMs ?? [];
  const multiVMJobs = main?.multiVMJobs ?? [];
  const replicas = main?.replicas ?? [];
  const changes = meta?.changes ?? null;
  const changeSummary = meta?.summary ?? null;

  // Filter matched VMs
  const filteredMatched = useMemo<MatchedVm[]>(() => {
    const q = query.trim().toLowerCase();
    let list = (matched ?? []).filter(Boolean);

    if (q) {
      list = list.filter(
        (m) => safeLower(m.vm?.name).includes(q) || safeLower(m.vm?.guestOs).includes(q)
      );
    }

    if (protectedFilter !== "all") {
      list = list.filter((m) =>
        protectedFilter === "protected" ? m.vm?.isProtected : !m.vm?.isProtected
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((m) => {
        const s = safeLower(m.protectionSummary?.overallStatus);
        if (statusFilter === "success") return s.includes("success");
        if (statusFilter === "warning") return s.includes("warn");
        return s.includes("stale");
      });
    }

    if (powerStateFilter !== "all") {
      list = list.filter((m) => {
        const ps = safeLower(m.vm?.powerState);
        if (powerStateFilter === "running") return ps.includes("run") || ps.includes("on");
        return ps.includes("off") || ps.includes("stopped");
      });
    }

    return list;
  }, [matched, query, protectedFilter, statusFilter, powerStateFilter]);

  // Pagination
  const vmPagination = usePagination(filteredMatched, { defaultPageSize: 10 });

  useEffect(() => {
    vmPagination.setCurrentPage(1);
  }, [query, protectedFilter, statusFilter, powerStateFilter]);

  // Handle clicks
  const handleVmClick = (vm: MatchedVm) => {
    setSelectedVm(vm);
    setVmDrawerOpen(true);
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setJobDrawerOpen(true);
  };

  const handleOpenChangeDrawer = () => {
    setChangeDrawerOpen(true);
  };

  const handleChangedJobClick = (changedJob: ChangedJob) => {
    const jobLike: Job = {
      jobName: changedJob.jobName,
      jobType: changedJob.jobType ?? "Unknown",
      platform: changedJob.platform ?? "Unknown",
      lastRun: changedJob.changedAt ?? "",
      lastRunDurationSec: 0,
      avgDurationSec: 0,
      lastTransferredBytes: 0,
      backupStatus: {
        status: changedJob.status ?? "Unknown",
        jobStatus: changedJob.status ?? "Unknown",
        backupAgeHours: 0,
        ranWithinLast24Hours: false,
      },
      parsedJob: {
        schedule: "",
        target: "",
        targetPlatform: "",
        client: "",
        location: "",
        source_host: "",
      },
    };
    setSelectedJob(jobLike);
    setJobDrawerOpen(true);
  };

  const showNoDataBanner = !loading && !error && !raw;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Only Updated timestamp + green/red connection icon */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          {lastUpdatedAt && (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-muted-foreground border-none px-0">
                Updated: {lastUpdatedAt.toLocaleTimeString()}
              </Badge>

              <div className="flex items-center gap-1">
                {status === "success" ? (
                  <Wifi className="w-4 h-4 text-success animate-pulse-slow" />
                ) : status === "error" ? (
                  <WifiOff className="w-4 h-4 text-destructive" />
                ) : (
                  <Wifi className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          )}
        </div>

        <div />
      </div>

      {/* Friendly “no data yet” banner when webhook returns empty */}
      {showNoDataBanner && (
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <div className="text-sm text-muted-foreground">
            No data available yet. Please check back shortly.
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        <SummaryCard
          title="Total VMs"
          value={formatCount(summary?.overview?.totalVMs ?? matched.length)}
          icon={Server}
          variant="info"
        />
        <SummaryCard
          title="Protected VMs"
          value={formatCount(summary?.protection?.protectedVMs ?? matched.filter((m) => m.vm?.isProtected).length)}
          icon={Shield}
          variant="success"
        />
        <SummaryCard
          title="Unprotected VMs"
          value={formatCount(summary?.protection?.unprotectedVMs ?? vmsWithoutJobs.length)}
          icon={ShieldOff}
          variant="danger"
        />
        <SummaryCard
          title="Total Jobs"
          value={formatCount(summary?.overview?.totalJobs ?? matched.reduce((acc, m) => acc + (m.jobs?.length ?? 0), 0))}
          icon={Briefcase}
          variant="info"
        />
        <SummaryCard
          title="Stale Backups"
          value={formatCount(summary?.backupHealth?.staleBackups ?? 0)}
          icon={Clock}
          variant="warning"
        />
        <SummaryCard
          title="Active Alerts"
          value={formatCount((alerts?.warnings?.length ?? 0) + (alerts?.critical?.length ?? 0))}
          icon={Bell}
          variant={(alerts?.critical?.length ?? 0) > 0 ? "danger" : "warning"}
        />
        <ChangeSummaryCard
          newJobs={changeSummary?.newJobs ?? changes?.new?.length ?? 0}
          modifiedJobs={changeSummary?.modifiedJobs ?? changes?.modified?.length ?? 0}
          enabledJobs={changeSummary?.enabledJobs ?? changes?.enabled?.length ?? 0}
          disabledJobs={changeSummary?.disabledJobs ?? changes?.disabled?.length ?? 0}
          onClick={handleOpenChangeDrawer}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="w-full justify-start bg-muted/30 p-1 mb-4">
          <TabsTrigger value="protected" className="gap-2">
            <Shield className="h-4 w-4" />
            Protected VMs ({matched.length})
          </TabsTrigger>
          <TabsTrigger value="unprotected" className="gap-2">
            <ShieldOff className="h-4 w-4" />
            Unprotected ({vmsWithoutJobs.length})
          </TabsTrigger>
          <TabsTrigger value="orphan" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Orphan Jobs ({jobsWithoutVMs.length})
          </TabsTrigger>
          <TabsTrigger value="multivm" className="gap-2">
            <Copy className="h-4 w-4" />
            Multi-VM Jobs ({multiVMJobs.length})
          </TabsTrigger>
          <TabsTrigger value="replicas" className="gap-2">
            <Database className="h-4 w-4" />
            Replicas ({replicas.length})
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Alerts ({(alerts?.warnings?.length ?? 0) + (alerts?.critical?.length ?? 0)})
          </TabsTrigger>
        </TabsList>

        {/* Protected VMs Tab */}
        <TabsContent value="protected" className="mt-0">
          <Card className="p-6 rounded-lg border border-border">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">VM Protection Table</h2>
                <p className="text-sm text-muted-foreground">
                  Click a VM row to view details and jobs
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search VM name or OS…"
                    className="pl-9 w-[200px] bg-muted/30"
                  />
                </div>

                <Select
                  value={powerStateFilter}
                  onValueChange={(v: "all" | "running" | "off") => setPowerStateFilter(v)}
                >
                  <SelectTrigger className="w-[130px] bg-muted/30">
                    <SelectValue placeholder="Power State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="off">Powered Off</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={protectedFilter}
                  onValueChange={(v: "all" | "protected" | "unprotected") => setProtectedFilter(v)}
                >
                  <SelectTrigger className="w-[140px] bg-muted/30">
                    <SelectValue placeholder="Protection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="protected">Protected</SelectItem>
                    <SelectItem value="unprotected">Unprotected</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(v: "all" | "success" | "warning" | "stale") => setStatusFilter(v)}
                >
                  <SelectTrigger className="w-[130px] bg-muted/30">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="stale">Stale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 mb-4">
                <div className="flex items-start gap-3">
                  <TriangleAlert className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <div className="font-medium">Failed to load data</div>
                    <div className="text-sm text-muted-foreground">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="text-sm text-muted-foreground py-10 text-center">
                Loading backup & replication data…
              </div>
            )}

            {!error && !loading && (
              <>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>VM Name</TableHead>
                        <TableHead>Power State</TableHead>
                        <TableHead>OS</TableHead>
                        <TableHead>Protected</TableHead>
                        <TableHead>Overall Status</TableHead>
                        <TableHead className="text-right">Jobs Count</TableHead>
                        <TableHead>Backup Current</TableHead>
                        <TableHead>Last Protected</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vmPagination.paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                            No VMs found
                          </TableCell>
                        </TableRow>
                      ) : (
                        vmPagination.paginatedData.map((item) => {
                          const vmName = item.vm?.name ?? "—";
                          const backupCurrent = backupCurrentBadge(item.protectionSummary?.backupCurrent);

                          return (
                            <TableRow
                              key={vmName}
                              className="hover:bg-muted/30 cursor-pointer transition-colors"
                              onClick={() => handleVmClick(item)}
                            >
                              <TableCell className="font-medium">{vmName}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    safeLower(item.vm?.powerState).includes("run")
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {item.vm?.powerState ?? "—"}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate" title={item.vm?.guestOs}>
                                {item.vm?.guestOs ?? "—"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={item.vm?.isProtected ? "default" : "destructive"}>
                                  {item.vm?.isProtected ? "Yes" : "No"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={item.protectionSummary?.overallStatus} size="sm" />
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {item.protectionSummary?.totalJobs ?? item.jobs?.length ?? 0}
                              </TableCell>
                              <TableCell>
                                <Badge variant={backupCurrent.variant}>{backupCurrent.label}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatDateTime(item.vm?.lastProtectedDate)}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filteredMatched.length > 0 && (
                  <TablePagination
                    currentPage={vmPagination.currentPage}
                    totalPages={vmPagination.totalPages}
                    totalItems={vmPagination.totalItems}
                    startIndex={vmPagination.startIndex}
                    endIndex={vmPagination.endIndex}
                    pageSize={vmPagination.pageSize}
                    onPageChange={vmPagination.setCurrentPage}
                    onPageSizeChange={vmPagination.setPageSize}
                    canGoNext={vmPagination.canGoNext}
                    canGoPrevious={vmPagination.canGoPrevious}
                    onFirstPage={vmPagination.goToFirstPage}
                    onLastPage={vmPagination.goToLastPage}
                    onNextPage={vmPagination.goToNextPage}
                    onPreviousPage={vmPagination.goToPreviousPage}
                  />
                )}
              </>
            )}
          </Card>
        </TabsContent>

        {/* Unprotected VMs */}
        <TabsContent value="unprotected" className="mt-0">
          <Card className="p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4">Unprotected VMs</h2>
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
                  {vmsWithoutJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        No unprotected VMs
                      </TableCell>
                    </TableRow>
                  ) : (
                    vmsWithoutJobs.map((vm) => (
                      <TableRow key={vm.name} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{vm.name}</TableCell>
                        <TableCell>{vm.powerState ?? "—"}</TableCell>
                        <TableCell>{vm.guestOs ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(vm.lastSeen)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Orphan Jobs */}
        <TabsContent value="orphan" className="mt-0">
          <Card className="p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4">Orphan Jobs (Jobs Without VMs)</h2>
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
                  {jobsWithoutVMs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        No orphan jobs
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobsWithoutVMs.map((job) => (
                      <TableRow key={job.jobName} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{job.jobName}</TableCell>
                        <TableCell>{job.jobType ?? "—"}</TableCell>
                        <TableCell>{job.platform ?? "—"}</TableCell>
                        <TableCell>{job.schedule ?? "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={job.status} size="sm" />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(job.lastRun)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Multi-VM Jobs */}
        <TabsContent value="multivm" className="mt-0">
          <Card className="p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4">Multi-VM Jobs</h2>
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
                  {multiVMJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        No multi-VM jobs
                      </TableCell>
                    </TableRow>
                  ) : (
                    multiVMJobs.map((job) => (
                      <TableRow key={job.jobName} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{job.jobName}</TableCell>
                        <TableCell>{job.jobType ?? "—"}</TableCell>
                        <TableCell>{job.platform ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{job.linkedVMs?.length ?? 0} VMs</Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={job.status} size="sm" />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(job.lastRun)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Replicas */}
        <TabsContent value="replicas" className="mt-0">
          <Card className="p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4">Replicas</h2>
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
                  {replicas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        No replicas
                      </TableCell>
                    </TableRow>
                  ) : (
                    replicas.map((replica) => (
                      <TableRow key={replica.name} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{replica.name}</TableCell>
                        <TableCell>{replica.sourceVm ?? "—"}</TableCell>
                        <TableCell>{replica.target ?? "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={replica.status} size="sm" />
                        </TableCell>
                        <TableCell>{replica.health ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(replica.lastSync)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="mt-0">
          <Card className="p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4">Alerts</h2>
            <div className="space-y-4">
              {(alerts?.critical?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-destructive mb-2">Critical Alerts</h3>
                  <div className="space-y-2">
                    {alerts?.critical?.map((alert: any) => (
                      <div
                        key={alert.id}
                        className="p-3 rounded-lg border border-destructive/30 bg-destructive/5"
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">{alert.message}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDateTime(alert.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(alerts?.warnings?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-500 mb-2">Warnings</h3>
                  <div className="space-y-2">
                    {alerts?.warnings?.map((alert: any) => (
                      <div
                        key={alert.id}
                        className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5"
                      >
                        <div className="flex items-start gap-3">
                          <TriangleAlert className="w-4 h-4 text-amber-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">{alert.message}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDateTime(alert.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(alerts?.critical?.length ?? 0) === 0 && (alerts?.warnings?.length ?? 0) === 0 && (
                <div className="text-center py-10 text-muted-foreground">No active alerts</div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Changes */}
        <TabsContent value="changes" className="mt-0">
          <Card className="p-6 rounded-lg border border-border">
            <ChangeActivityContent
              changes={changes}
              changeSummary={changeSummary}
              loading={loading}
              onSelectJob={handleChangedJobClick}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drawers */}
      <VmDrawer
        open={vmDrawerOpen}
        onOpenChange={setVmDrawerOpen}
        vm={selectedVm}
        onSelectJob={handleJobClick}
      />

      <JobDetailDrawer
        open={jobDrawerOpen}
        onOpenChange={setJobDrawerOpen}
        job={selectedJob}
      />

      <ChangeActivityDrawer
        open={changeDrawerOpen}
        onOpenChange={setChangeDrawerOpen}
        changes={changes}
        changeSummary={changeSummary}
        onSelectJob={handleChangedJobClick}
      />
    </div>
  );
};

// ================== Change Activity Content ==================

interface ChangeActivityContentProps {
  changes: any;
  changeSummary: any;
  loading: boolean;
  onSelectJob?: (job: ChangedJob) => void;
}

function ChangeActivityContent({ changes, changeSummary, loading, onSelectJob }: ChangeActivityContentProps) {
  const [activeTab, setActiveTab] = useState("new");

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading changes…</div>;
  }

  if (!changes) {
    return <div className="text-center py-10 text-muted-foreground">No change data available</div>;
  }

  const tabData = {
    new: changes.new ?? [],
    modified: changes.modified ?? [],
    enabled: changes.enabled ?? [],
    disabled: changes.disabled ?? [],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">New Jobs</div>
              <div className="text-2xl font-bold text-emerald-500">
                {changeSummary?.newJobs ?? tabData.new.length}
              </div>
            </div>
            <Plus className="w-5 h-5 text-emerald-500" />
          </div>
        </Card>

        <Card className="p-4 border border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Modified Jobs</div>
              <div className="text-2xl font-bold text-blue-500">
                {changeSummary?.modifiedJobs ?? tabData.modified.length}
              </div>
            </div>
            <Pencil className="w-5 h-5 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Enabled Jobs</div>
              <div className="text-2xl font-bold text-amber-500">
                {changeSummary?.enabledJobs ?? tabData.enabled.length}
              </div>
            </div>
            <Power className="w-5 h-5 text-amber-500" />
          </div>
        </Card>

        <Card className="p-4 border border-red-500/30 bg-red-500/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Disabled Jobs</div>
              <div className="text-2xl font-bold text-red-500">
                {changeSummary?.disabledJobs ?? tabData.disabled.length}
              </div>
            </div>
            <PowerOff className="w-5 h-5 text-red-500" />
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-muted/30 p-1">
          <TabsTrigger value="new" className="gap-2">
            <Plus className="h-4 w-4" />
            New ({tabData.new.length})
          </TabsTrigger>
          <TabsTrigger value="modified" className="gap-2">
            <Pencil className="h-4 w-4" />
            Modified ({tabData.modified.length})
          </TabsTrigger>
          <TabsTrigger value="enabled" className="gap-2">
            <Power className="h-4 w-4" />
            Enabled ({tabData.enabled.length})
          </TabsTrigger>
          <TabsTrigger value="disabled" className="gap-2">
            <PowerOff className="h-4 w-4" />
            Disabled ({tabData.disabled.length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(tabData).map(([key, jobs]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <ChangedJobsTable jobs={jobs as ChangedJob[]} onSelectJob={onSelectJob} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// ================== Changed Jobs Table ==================

function ChangedJobsTable({
  jobs,
  onSelectJob,
}: {
  jobs: ChangedJob[];
  onSelectJob?: (job: ChangedJob) => void;
}) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg">
        No jobs in this category
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Job Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Changed At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job, idx) => (
            <TableRow
              key={`${job.jobName}-${idx}`}
              className="hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => onSelectJob?.(job)}
            >
              <TableCell className="font-medium">{job.jobName}</TableCell>
              <TableCell>
                <Badge variant="outline">{job.jobType ?? "—"}</Badge>
              </TableCell>
              <TableCell>{job.platform ?? "—"}</TableCell>
              <TableCell>
                <StatusBadge status={job.status} size="sm" />
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(job.changedAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default BackupReplication;
