import { useState, useEffect } from "react";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import { useSystemLogs } from "@/hooks/super-admin/system-logs";
import {
  SystemLogsSummaryCards,
  SystemLogsFilters,
  SystemLogsTable,
  SystemLogsConnectionStatus,
} from "@/components/super-admin/system-logs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";
import {
  isAuditEnabled,
  setAuditEnabled,
  logAuditEvent,
  AUDIT_EVENTS,
  getAuditQueueSize,
} from "@/audit-logs";

const SecurityLogs = () => {
  const {
    logs,
    summary,
    pagination,
    filters,
    loading,
    error,
    isConnected,
    lastUpdated,
    setPage,
    setFilters,
    clearFilters,
  } = useSystemLogs();

  const [auditOn, setAuditOn] = useState(isAuditEnabled());
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setQueueSize(getAuditQueueSize()), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAudit = (checked: boolean) => {
    setAuditEnabled(checked);
    setAuditOn(checked);
    logAuditEvent(AUDIT_EVENTS.AUDIT_TOGGLE, {
      meta: { enabled: checked },
      result: 'success',
    });
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-destructive to-accent bg-clip-text text-transparent">
              System Logs</h1>
            <p className="text-muted-foreground">
              Keycloak audit events &amp; AVIS activity logs
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Frontend Audit Logging Toggle */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-card/50">
              <ScrollText className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="audit-toggle" className="text-sm font-medium cursor-pointer">
                Frontend Audit Logs
              </Label>
              <Switch
                id="audit-toggle"
                checked={auditOn}
                onCheckedChange={handleToggleAudit}
              />
              {auditOn && queueSize > 0 && (
                <Badge variant="outline" className="text-xs">
                  {queueSize} queued
                </Badge>
              )}
            </div>
            <SystemLogsConnectionStatus
              isConnected={isConnected}
              lastUpdated={lastUpdated}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <SystemLogsSummaryCards summary={summary} />

        {/* Filters */}
        <SystemLogsFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClear={clearFilters}
        />

        {/* Error state */}
        {error && !loading && (
          <div className="cyber-card border-destructive/30 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Table */}
        <SystemLogsTable
          logs={logs}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
        />
      </div>
    </SuperAdminLayout>
  );
};

export default SecurityLogs;
