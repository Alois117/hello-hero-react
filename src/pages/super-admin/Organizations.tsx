/**
 * Super Admin Organizations Page
 * Displays all tenant organizations with real data from webhooks
 * Includes Create/Edit/Toggle organization management via Keycloak
 */
import { useState } from "react";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import { 
  useOrganizations, 
  useOrganizationMetrics 
} from "@/hooks/super-admin/organizations";
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
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
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

  // Keycloak org management actions
  const {
    createOrganization,
    updateOrganization,
    toggleOrganization,
    refresh: refreshKeycloakOrgs,
  } = useKeycloakOrganizations();

  const { toast } = useToast();

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingOrg, setEditingOrg] = useState<KeycloakOrganization | null>(null);
  const [togglingOrg, setTogglingOrg] = useState<KeycloakOrganization | null>(null);

  // Fetch detailed metrics when an org is selected
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
              Manage all tenant organizations
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
