import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import { useSystemLogs } from "@/hooks/super-admin/system-logs";
import {
  SystemLogsSummaryCards,
  SystemLogsFilters,
  SystemLogsTable,
  SystemLogsConnectionStatus,
} from "@/components/super-admin/system-logs";

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

  return (
    <SuperAdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-1">System Logs</h1>
            <p className="text-muted-foreground">
              Keycloak audit events &amp; admin activity
            </p>
          </div>
          <SystemLogsConnectionStatus
            isConnected={isConnected}
            lastUpdated={lastUpdated}
          />
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
