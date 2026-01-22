import { useEffect, useMemo, useState } from "react";

import UserLayout from "@/layouts/UserLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { HardDrive, RefreshCw, Search, TriangleAlert } from "lucide-react";

import type { Job, MatchedVm } from "@/pages/user/backup-replication/types";
import JobsTable from "@/pages/user/backup-replication/components/JobsTable";
import JobDetailDrawer from "@/pages/user/backup-replication/components/JobDetailDrawer";

const ENDPOINT = "http://10.100.12.54:5678/webhook/backupandreplication";

type Status = "idle" | "loading" | "success" | "error";

type MainObject = {
  summary?: any;
  matched?: MatchedVm[];
  alerts?: any;
  statistics?: any;
  vmsWithoutJobs?: any;
  jobsWithoutVMs?: any;
  multiVMJobs?: any;
  replicas?: any;
};

type MetaObject = {
  changes?: any;
  summary?: any;
};

function safeLower(v: unknown) {
  return String(v ?? "").toLowerCase();
}

function overallStatusBadgeVariant(status?: string) {
  const s = safeLower(status);
  if (s.includes("success")) return "default";
  if (s.includes("warn")) return "secondary";
  if (s.includes("stale")) return "destructive";
  return "secondary";
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

function statusBadgeTone(kind: "success" | "warning" | "danger" | "info") {
  // Use semantic tokens only; these map to the existing design system.
  if (kind === "success") return "bg-success/10 border border-success/25 text-success";
  if (kind === "warning") return "bg-warning/10 border border-warning/25 text-warning";
  if (kind === "danger") return "bg-destructive/10 border border-destructive/25 text-destructive";
  return "bg-primary/10 border border-primary/25 text-primary";
}

function SummaryCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string | number;
  tone: "success" | "warning" | "danger" | "info";
}) {
  return (
    <Card className="glass-card p-5 rounded-lg border border-border hover:border-primary/30 transition-all hover-lift">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
        </div>
        <div className={`p-2 rounded-lg ${statusBadgeTone(tone)}`} aria-hidden="true">
          <HardDrive className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

const BackupReplication = () => {
  // NOTE: The webhook returns an ARRAY of two objects: [main, meta].
  // We intentionally handle that contract here (without modifying hooks/services).
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<unknown>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [selectedVmName, setSelectedVmName] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobDrawerOpen, setJobDrawerOpen] = useState(false);

  const loading = status === "loading";

  const refresh = async () => {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(ENDPOINT, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json: unknown = await res.json();
      setRaw(json);
      setLastUpdatedAt(new Date());
      setStatus("success");
    } catch (e: any) {
      setError(e?.message || "Failed to load backup & replication data");
      setStatus("error");
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [query, setQuery] = useState("");

  const [protectedFilter, setProtectedFilter] = useState<"all" | "protected" | "unprotected">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "warning" | "stale">("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const { main, meta } = useMemo<{ main: MainObject; meta: MetaObject }>(() => {
    const arr = Array.isArray(raw) ? (raw as unknown[]) : null;
    const mainObj = (arr?.[0] ?? {}) as MainObject;
    const metaObj = (arr?.[1] ?? {}) as MetaObject;
    return { main: mainObj, meta: metaObj };
  }, [raw]);

  const summary = main?.summary ?? null;
  const matched = (main?.matched ?? []) as MatchedVm[];
  const alerts = main?.alerts ?? null;
  const changes = meta?.changes ?? null;

  const selectedVm = useMemo(() => {
    if (!selectedVmName) return null;
    return matched.find((m) => (m?.vm?.name ?? "") === selectedVmName) ?? null;
  }, [matched, selectedVmName]);

  const filteredMatched = useMemo<MatchedVm[]>(() => {
    const q = query.trim().toLowerCase();
    const list = (matched ?? []).filter(Boolean);

    const bySearch = !q
      ? list
      : list.filter((m) => safeLower(m.vm?.name).includes(q) || safeLower(m.vm?.guestOs).includes(q));

    const byProtected =
      protectedFilter === "all"
        ? bySearch
        : bySearch.filter((m) =>
            protectedFilter === "protected" ? Boolean(m.vm?.isProtected) : !Boolean(m.vm?.isProtected)
          );

    const byStatus =
      statusFilter === "all"
        ? byProtected
        : byProtected.filter((m) => {
            const s = safeLower(m.protectionSummary?.overallStatus);
            if (statusFilter === "success") return s.includes("success");
            if (statusFilter === "warning") return s.includes("warn");
            return s.includes("stale");
          });

    return byStatus;
  }, [matched, query, protectedFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMatched.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedMatched = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMatched.slice(start, start + PAGE_SIZE);
  }, [filteredMatched, currentPage]);

  useEffect(() => {
    // Reset page when filters/search change.
    setPage(1);
  }, [query, protectedFilter, statusFilter]);

  useEffect(() => {
    // Keep selection valid.
    if (selectedVmName && !matched.some((m) => (m?.vm?.name ?? "") === selectedVmName)) {
      setSelectedVmName(null);
    }
  }, [matched, selectedVmName]);

  const openJob = (job: Job) => {
    setSelectedJob(job);
    setJobDrawerOpen(true);
  };

  return (
    <UserLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <HardDrive className="w-6 h-6 text-primary glow-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Backup &amp; Replication</h1>
              <p className="text-muted-foreground">VM protection status and job health</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdatedAt && (
              <Badge variant="secondary" className="bg-surface/50 border border-border/50">
                Updated: {lastUpdatedAt.toLocaleTimeString()}
              </Badge>
            )}
            <Button onClick={() => void refresh()} variant="outline" className="hover-lift" disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary (Primary Monitoring: raw[0]) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          <SummaryCard
            title="Total VMs"
            value={summary?.overview?.totalVMs ?? "—"}
            tone="info"
          />
          <SummaryCard
            title="Protected VMs"
            value={summary?.protection?.protectedVMs ?? "—"}
            tone="success"
          />
          <SummaryCard
            title="Unprotected VMs"
            value={summary?.protection?.unprotectedVMs ?? "—"}
            tone="danger"
          />
          <SummaryCard
            title="Total Jobs"
            value={summary?.overview?.totalJobs ?? "—"}
            tone="info"
          />
          <SummaryCard
            title="Stale Backups"
            value={summary?.backupHealth?.staleBackups ?? "—"}
            tone="warning"
          />
          <SummaryCard
            title="Active Alerts"
            value={
              formatCount((alerts?.warnings?.length ?? 0) + (alerts?.critical?.length ?? 0))
            }
            tone={(alerts?.critical?.length ?? 0) > 0 ? "danger" : "warning"}
          />
        </div>

        {/* Change Tracking (Meta: raw[1]) */}
        <Card className="glass-card p-4 rounded-lg border border-border">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold">Change Activity</h2>
              <p className="text-sm text-muted-foreground">
                New/modified/enabled/disabled jobs from the change tracking payload
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-surface/50 border border-border/50">
                New: {formatCount(changes?.new?.length ?? meta?.summary?.newJobs ?? 0)}
              </Badge>
              <Badge variant="secondary" className="bg-surface/50 border border-border/50">
                Modified: {formatCount(changes?.modified?.length ?? meta?.summary?.modifiedJobs ?? 0)}
              </Badge>
              <Badge variant="secondary" className="bg-surface/50 border border-border/50">
                Enabled: {formatCount(changes?.enabled?.length ?? meta?.summary?.enabledJobs ?? 0)}
              </Badge>
              <Badge variant="secondary" className="bg-surface/50 border border-border/50">
                Disabled: {formatCount(changes?.disabled?.length ?? meta?.summary?.disabledJobs ?? 0)}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Primary monitoring area: VM table (scan-optimized) + Jobs panel (separate context) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <Card className="glass-card p-6 rounded-lg border border-border xl:col-span-7">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">VM Protection View</h2>
                <p className="text-sm text-muted-foreground">
                  Select a VM to view its jobs in the right panel
                </p>
              </div>

              <div className="w-full lg:w-[520px] flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search VM name or OS…"
                    className="pl-9 bg-surface/50 border-border/50 focus:border-primary transition-all"
                    aria-label="Search VMs"
                  />
                </div>

                <Select value={protectedFilter} onValueChange={(v: any) => setProtectedFilter(v)}>
                  <SelectTrigger className="w-full sm:w-[160px] bg-surface/50 border-border/50">
                    <SelectValue placeholder="Protection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="protected">Protected</SelectItem>
                    <SelectItem value="unprotected">Unprotected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                  <SelectTrigger className="w-full sm:w-[160px] bg-surface/50 border-border/50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="stale">STALE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-start gap-3">
                  <TriangleAlert className="w-5 h-5 text-destructive mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-medium">Failed to load Backup &amp; Replication data</div>
                    <div className="text-sm text-muted-foreground">{error}</div>
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="text-sm text-muted-foreground py-10">Loading backup &amp; replication data…</div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                    {pagedMatched.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                          No VMs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedMatched.map((item) => {
                        const vmName = item.vm?.name ?? "—";
                        const isSelected = selectedVmName === vmName;
                        const backupCurrent = backupCurrentBadge(item.protectionSummary?.backupCurrent);

                        return (
                          <TableRow
                            key={vmName}
                            className={
                              isSelected
                                ? "bg-primary/10 hover:bg-primary/10"
                                : "hover:bg-muted/30"
                            }
                          >
                            <TableCell className="font-medium">
                              <button
                                type="button"
                                className="text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                                onClick={() => setSelectedVmName(vmName)}
                                aria-pressed={isSelected}
                              >
                                {vmName}
                              </button>
                            </TableCell>
                            <TableCell>{item.vm?.powerState ?? "—"}</TableCell>
                            <TableCell className="max-w-[260px] truncate" title={item.vm?.guestOs}>
                              {item.vm?.guestOs ?? "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.vm?.isProtected ? "default" : "secondary"}>
                                {item.vm?.isProtected ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={overallStatusBadgeVariant(item.protectionSummary?.overallStatus) as any}>
                                {item.protectionSummary?.overallStatus ?? "—"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {item.protectionSummary?.totalJobs ?? 0}
                            </TableCell>
                            <TableCell>
                              <Badge variant={backupCurrent.variant}>{backupCurrent.label}</Badge>
                            </TableCell>
                            <TableCell>{item.vm?.lastProtectedDate ?? "—"}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination (max 8 rows/page) */}
            {!error && !loading && filteredMatched.length > 0 && (
              <div className="flex items-center justify-between gap-3 pt-4">
                <div className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}
                  –{Math.min(currentPage * PAGE_SIZE, filteredMatched.length)} of {filteredMatched.length}
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.max(1, p - 1));
                        }}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                      // Windowed pages around current page
                      const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                      const pageNum = start + idx;
                      if (pageNum > totalPages) return null;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            isActive={pageNum === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(pageNum);
                            }}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.min(totalPages, p + 1));
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>

          {/* Jobs panel: separate VM vs Job context */}
          <Card className="glass-card p-6 rounded-lg border border-border xl:col-span-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold">Jobs</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedVm ? (
                    <>
                      VM: <span className="text-foreground font-medium">{selectedVm.vm?.name}</span>
                      {" "}
                      <span className="text-muted-foreground">
                        ({selectedVm.jobs?.length ?? 0} jobs)
                      </span>
                    </>
                  ) : (
                    "Select a VM to inspect its jobs"
                  )}
                </p>
              </div>
              {selectedVm && (
                <Badge variant="secondary" className="bg-surface/50 border border-border/50">
                  {selectedVm.vm?.isProtected ? "Protected" : "Unprotected"}
                </Badge>
              )}
            </div>

            {!selectedVm ? (
              <div className="rounded-lg border border-border/60 bg-surface/30 p-6">
                <div className="text-sm font-medium">No VM selected</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Pick a VM from the table to see job health, schedules, and details.
                </div>
              </div>
            ) : (selectedVm.jobs?.length ?? 0) === 0 ? (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-6">
                <div className="text-sm font-medium">No jobs for this VM</div>
                <div className="text-sm text-muted-foreground mt-1">
                  This VM appears in matched[] but has no jobs[] entries.
                </div>
              </div>
            ) : (
              <JobsTable jobs={selectedVm.jobs ?? []} onSelectJob={openJob} />
            )}
          </Card>
        </div>

        <JobDetailDrawer open={jobDrawerOpen} onOpenChange={setJobDrawerOpen} job={selectedJob} />
      </div>
    </UserLayout>
  );
};

export default BackupReplication;
