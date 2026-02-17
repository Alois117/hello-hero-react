/**
 * Super Admin Organizations Page
 * Displays all tenant organizations with real data from webhooks
 * Uses same data patterns as user dashboard for consistency
 */
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import { 
  useOrganizations, 
  useOrganizationMetrics 
} from "@/hooks/super-admin/organizations";
import {
  OrganizationsSummaryCards,
  OrganizationsFilters,
  OrganizationsConnectionStatus,
  OrganizationsList,
  OrganizationsPagination,
  OrganizationDetailView,
} from "@/components/super-admin/organizations";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Organizations = () => {
  const {
    organizations,
    loading,
    error,
    counts,
    isConnected,
    lastUpdated,
    filters,
    setSearchQuery,
    setStatusFilter,
    setHasActiveAlertsFilter,
    clearFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    paginatedOrganizations,
    selectedOrg,
    setSelectedOrg,
  } = useOrganizations(10);

  // Fetch detailed metrics when an org is selected
  const {
    metrics: orgMetrics,
    loading: metricsLoading,
    lastUpdated: metricsLastUpdated,
    refresh: refreshMetrics,
  } = useOrganizationMetrics({
    clientId: selectedOrg?.clientId ?? null,
    enabled: selectedOrg !== null,
  });

  // If an organization is selected, show detail view
  if (selectedOrg) {
    return (
      <SuperAdminLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => setSelectedOrg(null)}
            className="gap-2 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Organizations
          </Button>

          <OrganizationDetailView
            organization={selectedOrg}
            metrics={orgMetrics}
            loading={metricsLoading}
            lastUpdated={metricsLastUpdated}
            onClose={() => setSelectedOrg(null)}
            onRefresh={refreshMetrics}
          />
        </div>
      </SuperAdminLayout>
    );
  }

  // Main organizations list view
  return (
    <SuperAdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-destructive to-accent bg-clip-text text-transparent">
              Organizations
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage all tenant organizations
            </p>
          </div>
          <OrganizationsConnectionStatus
            isConnected={isConnected}
            lastUpdated={lastUpdated}
            loading={loading}
          />
        </div>

        {/* Summary Cards */}
        <OrganizationsSummaryCards counts={counts} />

        {/* Filters */}
        <Card className="p-4 border-border/50">
          <OrganizationsFilters
            filters={filters}
            onSearchChange={setSearchQuery}
            onStatusChange={setStatusFilter}
            onHasAlertsChange={setHasActiveAlertsFilter}
            onClearFilters={clearFilters}
          />
        </Card>

        {/* Organizations List */}
        <OrganizationsList
          organizations={paginatedOrganizations}
          loading={loading}
          error={error}
          onOrgClick={setSelectedOrg}
          selectedOrgId={selectedOrg?.id ?? null}
        />

        {/* Pagination */}
        <OrganizationsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={organizations.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </SuperAdminLayout>
  );
};

export default Organizations;
