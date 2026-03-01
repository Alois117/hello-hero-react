/**
 * Super Admin Organizations Page
 * Displays all tenant organizations with real data from webhooks
 * Includes Create/Edit/Toggle organization management via Keycloak
 */
import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import {
  useOrganizations,
  useOrganizationMetrics,
  useGlobalInfrastructureMetrics,
  type GlobalScope,
  type GlobalTimeRange,
  type Organization,
} from "@/hooks/super-admin/organizations";
import {
  useKeycloakOrganizations,
  type KeycloakOrganization,
  type CreateOrgData,
  type UpdateOrgData,
} from "@/hooks/keycloak/useKeycloakOrganizations";
import {
  GlobalInfrastructureFilterBar,
  GlobalInfrastructureOverview,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  // Keycloak org management actions + source organizations for global mode
  const {
    organizations: keycloakOrganizations,
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
  const [activeView, setActiveView] = useState<"global" | "organization">("global");

  // Global filters
  const [globalScope, setGlobalScope] = useState<GlobalScope>("all");
  const [globalSelectedOrgIds, setGlobalSelectedOrgIds] = useState<string[]>([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [globalTimeRange, setGlobalTimeRange] = useState<GlobalTimeRange>("all");
  const [globalCustomDateFrom, setGlobalCustomDateFrom] = useState<Date | undefined>(undefined);
  const [globalCustomDateTo, setGlobalCustomDateTo] = useState<Date | undefined>(undefined);

  const globalOrganizations = useMemo<Organization[]>(
    () =>
      keycloakOrganizations.map((org) => ({
        id: org.id,
        clientId: Number(org.attributes?.client_id?.[0] ?? 0) || 0,
        name: org.name || "Unnamed Organization",
        status: org.enabled ? "active" : "inactive",
        enabled: org.enabled,
        description: org.description,
        alias: org.alias,
        domains: org.domains,
        createdAt: new Date(),
        updatedAt: new Date(),
        userCount: 0,
        activeAlerts: 0,
        hostsCount: 0,
        reportsCount: 0,
        insightsCount: 0,
      })),
    [keycloakOrganizations]
  );

  // Keep selected org IDs in sync with existing organizations
  useEffect(() => {
    const validOrgIds = new Set(globalOrganizations.map((org) => org.id));
    setGlobalSelectedOrgIds((prev) => prev.filter((id) => validOrgIds.has(id)));
  }, [globalOrganizations]);

  // Enforce single selection for specific scope
  useEffect(() => {
    if (globalScope !== "specific") return;
    if (globalSelectedOrgIds.length > 1) {
      setGlobalSelectedOrgIds(globalSelectedOrgIds.slice(0, 1));
      return;
    }
    if (globalSelectedOrgIds.length === 0 && globalOrganizations.length > 0) {
      setGlobalSelectedOrgIds([globalOrganizations[0].id]);
    }
  }, [globalScope, globalSelectedOrgIds, globalOrganizations]);
  
  const {
    loading: globalLoading,
    error: globalError,
    isConnected: globalConnected,
    lastUpdated: globalLastUpdated,
    refresh: refreshGlobalMetrics,
    summary: globalSummary,
    alerts: globalAlerts,
    hosts: globalHosts,
    reports: globalReports,
    insights: globalInsights,
    veeamDrilldownData,
    veeamJobs,
    alertsBreakdown,
    hostsBreakdown,
    reportsBreakdown,
    insightsBreakdown,
    veeamBreakdown,
  } = useGlobalInfrastructureMetrics({
    organizations: globalOrganizations,
    scope: globalScope,
    selectedOrgIds: globalSelectedOrgIds,
    timeRange: globalTimeRange,
    customDateFrom: globalCustomDateFrom,
    customDateTo: globalCustomDateTo,
    enabled: true,
  });

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

  const handleCreate = async (data: CreateOrgData) => {
    const result = await createOrganization(data);
    if (result.success) {
      toast({ title: "Organization created successfully" });
      refreshKeycloakOrgs();
    } else {
      toast({ title: "Failed to create organization", description: result.error, variant: "destructive" });
    }
    return result;
  };

  const handleUpdate = async (id: string, data: UpdateOrgData) => {
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
              Global infrastructure view and tenant organization management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <OrganizationsConnectionStatus
              isConnected={activeView === "global" ? globalConnected : isConnected}
              lastUpdated={activeView === "global" ? globalLastUpdated : lastUpdated}
              loading={activeView === "global" ? globalLoading : loading}
            />
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
              disabled={activeView === "global"}
              title={activeView === "global" ? "Switch to Organization Explorer to create an organization" : undefined}
            >
              <Plus className="w-4 h-4" />
              Create Organization
            </Button>
          </div>
        </div>

        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "global" | "organization")}>
          <TabsList className="bg-muted/40 border border-border/60">
            <TabsTrigger value="global">Global Overview</TabsTrigger>
            <TabsTrigger value="organization">Organization Explorer</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-4 mt-4">
            <GlobalInfrastructureFilterBar
              organizations={globalOrganizations}
              scope={globalScope}
              onScopeChange={setGlobalScope}
              selectedOrgIds={globalSelectedOrgIds}
              onSelectedOrgIdsChange={setGlobalSelectedOrgIds}
              timeRange={globalTimeRange}
              onTimeRangeChange={setGlobalTimeRange}
              customDateFrom={globalCustomDateFrom}
              onCustomDateFromChange={setGlobalCustomDateFrom}
              customDateTo={globalCustomDateTo}
              onCustomDateToChange={setGlobalCustomDateTo}
              searchQuery={globalSearchQuery}
              onSearchQueryChange={setGlobalSearchQuery}
            />

            <GlobalInfrastructureOverview
              loading={globalLoading}
              error={globalError}
              summary={globalSummary}
              alerts={globalAlerts}
              hosts={globalHosts}
              reports={globalReports}
              insights={globalInsights}
              veeamDrilldownData={veeamDrilldownData}
              veeamJobs={veeamJobs}
              alertsBreakdown={alertsBreakdown}
              hostsBreakdown={hostsBreakdown}
              reportsBreakdown={reportsBreakdown}
              insightsBreakdown={insightsBreakdown}
              veeamBreakdown={veeamBreakdown}
              organizationSearchQuery={globalSearchQuery}
              onRefresh={refreshGlobalMetrics}
            />
          </TabsContent>

          <TabsContent value="organization" className="space-y-4 mt-4">
            {!selectedOrg ? (
              <>
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
              </>
            ) : (
              <div className="space-y-6">
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
            )}
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
