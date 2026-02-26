/**
 * Super Admin Organizations Page
 * Default view: Global Infrastructure Overview
 * Secondary view: Organization list with detail drill-down
 */
import { useState } from "react";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import {
  useOrganizations,
  useOrganizationMetrics,
} from "@/hooks/super-admin/organizations";
import { useGlobalInfrastructureMetrics } from "@/hooks/super-admin/organizations/useGlobalInfrastructureMetrics";
import { useKeycloakOrganizations, type KeycloakOrganization } from "@/hooks/keycloak/useKeycloakOrganizations";
import {
  OrganizationsSummaryCards,
  OrganizationsFilters,
  OrganizationsConnectionStatus,
  OrganizationsList,
  OrganizationsPagination,
  OrganizationDetailView,
} from "@/components/super-admin/organizations";
import {
  CreateOrganizationDialog,
  EditOrganizationDialog,
  ToggleOrganizationDialog,
} from "@/components/super-admin/organizations/OrganizationManagementDialogs";
import GlobalInfrastructureOverview from "@/components/super-admin/organizations/GlobalInfrastructureOverview";
import GlobalFilterBar from "@/components/super-admin/organizations/GlobalFilterBar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Globe, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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

  const {
    createOrganization,
    updateOrganization,
    toggleOrganization,
    refresh: refreshKeycloakOrgs,
  } = useKeycloakOrganizations();

  const { toast } = useToast();

  // Tab state — global overview is default
  const [activeTab, setActiveTab] = useState("global");

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingOrg, setEditingOrg] = useState<KeycloakOrganization | null>(null);
  const [togglingOrg, setTogglingOrg] = useState<KeycloakOrganization | null>(null);

  // Global infrastructure metrics
  const globalMetrics = useGlobalInfrastructureMetrics({
    organizations,
    enabled: activeTab === "global" && !selectedOrg,
  });

  // Per-org detail metrics
  const {
    metrics: orgMetrics,
    loading: metricsLoading,
    lastUpdated: metricsLastUpdated,
    refresh: refreshMetrics,
  } = useOrganizationMetrics({
    orgId: selectedOrg?.id ?? null,
    clientId: selectedOrg?.clientId ?? null,
    enabled: selectedOrg !== null,
  });

  const handleCreate = async (data: any) => {
    const result = await createOrganization(data);
    if (result.success) {
      toast({ title: "Organization created successfully" });
      refreshKeycloakOrgs();
    } else {
      toast({ title: "Failed to create organization", description: result.error, variant: "destructive" });
    }
    return result;
  };

  const handleUpdate = async (id: string, data: any) => {
    const result = await updateOrganization(id, data);
    if (result.success) {
      toast({ title: "Organization updated successfully" });
      refreshKeycloakOrgs();
    } else {
      toast({ title: "Failed to update organization", description: result.error, variant: "destructive" });
    }
    return result;
  };

  const handleToggle = async (org: KeycloakOrganization) => {
    const result = await toggleOrganization(org);
    if (result.success) {
      toast({ title: `Organization ${org.enabled ? "disabled" : "enabled"} successfully` });
      refreshKeycloakOrgs();
    } else {
      toast({ title: "Failed to toggle organization", description: result.error, variant: "destructive" });
    }
    return result;
  };

  // Navigate to org detail from global overview
  const handleOrgClickFromGlobal = (org: typeof selectedOrg) => {
    if (!org) return;
    setSelectedOrg(org);
    setActiveTab("organizations");
  };

  // If an organization is selected, show detail view
  if (selectedOrg) {
    return (
      <SuperAdminLayout>
        <div className="space-y-6 animate-fade-in">
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
              Global infrastructure overview & tenant management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <OrganizationsConnectionStatus
              isConnected={isConnected}
              lastUpdated={lastUpdated}
              loading={loading}
            />
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Organization
            </Button>
          </div>
        </div>

        {/* Tabs: Global Overview | Organizations */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 border border-border/50">
            <TabsTrigger value="global" className="gap-2">
              <Globe className="w-4 h-4" />
              Global Overview
            </TabsTrigger>
            <TabsTrigger value="organizations" className="gap-2">
              <Building2 className="w-4 h-4" />
              Organizations ({counts.total})
            </TabsTrigger>
          </TabsList>

          {/* Global Overview Tab */}
          <TabsContent value="global" className="mt-0">
            <GlobalFilterBar
              organizations={organizations}
              searchQuery={globalMetrics.filters.searchQuery}
              onSearchChange={globalMetrics.setSearchQuery}
              timeRange={globalMetrics.filters.timeRange}
              onTimeRangeChange={globalMetrics.setTimeRange}
              selectedOrgIds={globalMetrics.filters.selectedOrgIds}
              onSelectedOrgIdsChange={globalMetrics.setSelectedOrgIds}
              onClearFilters={globalMetrics.clearFilters}
            />

            <div className="mt-6">
              <GlobalInfrastructureOverview
                summary={globalMetrics.summary}
                orgRows={globalMetrics.filteredOrgRows}
                loading={globalMetrics.loading}
                error={globalMetrics.error}
                lastUpdated={globalMetrics.lastUpdated}
                onRefresh={globalMetrics.refresh}
                onOrgClick={handleOrgClickFromGlobal}
                organizations={organizations}
              />
            </div>
          </TabsContent>

          {/* Organizations List Tab */}
          <TabsContent value="organizations" className="mt-4 space-y-6">
            <OrganizationsSummaryCards counts={counts} />

            <Card className="p-4 border-border/50">
              <OrganizationsFilters
                filters={filters}
                onSearchChange={setSearchQuery}
                onStatusChange={setStatusFilter}
                onHasAlertsChange={setHasActiveAlertsFilter}
                onClearFilters={clearFilters}
              />
            </Card>

            <OrganizationsList
              organizations={paginatedOrganizations}
              loading={loading}
              error={error}
              onOrgClick={setSelectedOrg}
              selectedOrgId={selectedOrg?.id ?? null}
            />

            <OrganizationsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={organizations.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Management Dialogs */}
      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreate}
      />
      <EditOrganizationDialog
        org={editingOrg}
        onOpenChange={() => setEditingOrg(null)}
        onUpdate={handleUpdate}
      />
      <ToggleOrganizationDialog
        org={togglingOrg}
        onOpenChange={() => setTogglingOrg(null)}
        onToggle={handleToggle}
      />
    </SuperAdminLayout>
  );
};

export default Organizations;
