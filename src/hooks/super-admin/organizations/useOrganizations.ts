/**
 * Super Admin Organizations Hook
 * Fetches organizations from Keycloak Admin API (replaces webhook dependency)
 * Provides filtering, sorting, pagination, and selection
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useKeycloakOrganizations,
  type KeycloakOrganization,
} from "@/hooks/keycloak";
import {
  Organization,
  OrganizationCounts,
  OrganizationFilters,
  OrganizationSortField,
  SortDirection,
} from "./types";

export interface UseOrganizationsReturn {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  counts: OrganizationCounts;
  isConnected: boolean;
  lastUpdated: Date | null;
  // Filters
  filters: OrganizationFilters;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: "all" | "active" | "inactive") => void;
  setHasActiveAlertsFilter: (value: boolean | null) => void;
  setCreatedDateRange: (from: Date | null, to: Date | null) => void;
  clearFilters: () => void;
  // Sorting
  sortField: OrganizationSortField;
  sortDirection: SortDirection;
  setSorting: (field: OrganizationSortField, direction: SortDirection) => void;
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  totalPages: number;
  paginatedOrganizations: Organization[];
  // Actions
  refresh: () => Promise<void>;
  // Selection for detail view
  selectedOrg: Organization | null;
  setSelectedOrg: (org: Organization | null) => void;
  // Keycloak org management actions
  keycloakActions: {
    createOrganization: (data: any) => Promise<{ success: boolean; id?: string; error?: string }>;
    updateOrganization: (id: string, data: any) => Promise<{ success: boolean; error?: string }>;
    toggleOrganization: (org: KeycloakOrganization) => Promise<{ success: boolean; error?: string }>;
    deleteOrganization: (id: string) => Promise<{ success: boolean; error?: string }>;
  };
}

/**
 * Transform a Keycloak organization into the internal Organization type.
 * The client_id attribute (if set) is used for webhook metric correlation.
 */
const transformKeycloakOrg = (kc: KeycloakOrganization): Organization => {
  // Extract client_id from attributes for webhook correlation
  const clientIdAttr = kc.attributes?.client_id?.[0];
  const clientId = clientIdAttr ? parseInt(clientIdAttr, 10) : 0;

  return {
    id: kc.id,
    clientId: isNaN(clientId) ? 0 : clientId,
    name: kc.name || "Unnamed Organization",
    status: kc.enabled ? "active" : "inactive",
    enabled: kc.enabled,
    description: kc.description,
    alias: kc.alias,
    domains: kc.domains,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Counts default to 0; populated by useOrganizationMetrics when viewing details
    userCount: 0,
    activeAlerts: 0,
    hostsCount: 0,
    reportsCount: 0,
    insightsCount: 0,
  };
};

const sortOrganizations = (
  orgs: Organization[],
  field: OrganizationSortField,
  direction: SortDirection
): Organization[] => {
  return [...orgs].sort((a, b) => {
    let comparison = 0;
    switch (field) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "userCount":
        comparison = a.userCount - b.userCount;
        break;
      case "activeAlerts":
        comparison = a.activeAlerts - b.activeAlerts;
        break;
      case "createdAt":
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
    }
    return direction === "asc" ? comparison : -comparison;
  });
};

export const useOrganizations = (pageSize = 10): UseOrganizationsReturn => {
  // Use Keycloak organizations hook
  const {
    organizations: keycloakOrgs,
    loading,
    error,
    refresh: refreshKeycloak,
    createOrganization,
    updateOrganization,
    toggleOrganization,
    deleteOrganization,
  } = useKeycloakOrganizations();

  // Transform Keycloak orgs to internal format
  const organizations = useMemo(
    () => keycloakOrgs.map(transformKeycloakOrg),
    [keycloakOrgs]
  );

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Update connection status when data loads
  useEffect(() => {
    if (!loading && !error && keycloakOrgs.length >= 0) {
      setIsConnected(true);
      setLastUpdated(new Date());
    } else if (error) {
      setIsConnected(false);
    }
  }, [loading, error, keycloakOrgs]);

  // Filter state
  const [filters, setFilters] = useState<OrganizationFilters>({
    searchQuery: "",
    statusFilter: "all",
    hasActiveAlerts: null,
    createdDateFrom: null,
    createdDateTo: null,
  });

  // Sorting state
  const [sortField, setSortField] = useState<OrganizationSortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Selection state
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  // Computed counts
  const counts = useMemo(
    (): OrganizationCounts => ({
      total: organizations.length,
      active: organizations.filter((o) => o.status === "active").length,
      inactive: organizations.filter((o) => o.status === "inactive").length,
      totalUsers: organizations.reduce((sum, o) => sum + o.userCount, 0),
      totalAlerts: organizations.reduce((sum, o) => sum + o.activeAlerts, 0),
    }),
    [organizations]
  );

  // Filtered organizations
  const filteredOrganizations = useMemo(() => {
    const query = filters.searchQuery.toLowerCase().trim();

    return organizations.filter((org) => {
      const matchesSearch =
        !query ||
        org.name.toLowerCase().includes(query) ||
        org.id.toLowerCase().includes(query) ||
        org.description?.toLowerCase().includes(query);

      const matchesStatus =
        filters.statusFilter === "all" || org.status === filters.statusFilter;

      const matchesAlerts =
        filters.hasActiveAlerts === null ||
        (filters.hasActiveAlerts
          ? org.activeAlerts > 0
          : org.activeAlerts === 0);

      return matchesSearch && matchesStatus && matchesAlerts;
    });
  }, [organizations, filters]);

  // Sorted organizations
  const sortedOrganizations = useMemo(() => {
    return sortOrganizations(filteredOrganizations, sortField, sortDirection);
  }, [filteredOrganizations, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(sortedOrganizations.length / pageSize)
  );

  const paginatedOrganizations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedOrganizations.slice(startIndex, startIndex + pageSize);
  }, [sortedOrganizations, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortField, sortDirection]);

  // Filter setters
  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setStatusFilter = useCallback(
    (status: "all" | "active" | "inactive") => {
      setFilters((prev) => ({ ...prev, statusFilter: status }));
    },
    []
  );

  const setHasActiveAlertsFilter = useCallback(
    (value: boolean | null) => {
      setFilters((prev) => ({ ...prev, hasActiveAlerts: value }));
    },
    []
  );

  const setCreatedDateRange = useCallback(
    (from: Date | null, to: Date | null) => {
      setFilters((prev) => ({
        ...prev,
        createdDateFrom: from,
        createdDateTo: to,
      }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: "",
      statusFilter: "all",
      hasActiveAlerts: null,
      createdDateFrom: null,
      createdDateTo: null,
    });
    setCurrentPage(1);
  }, []);

  const setSorting = useCallback(
    (field: OrganizationSortField, direction: SortDirection) => {
      setSortField(field);
      setSortDirection(direction);
    },
    []
  );

  const refresh = useCallback(async () => {
    await refreshKeycloak();
  }, [refreshKeycloak]);

  return {
    organizations: sortedOrganizations,
    loading,
    error,
    counts,
    isConnected,
    lastUpdated,
    filters,
    setSearchQuery,
    setStatusFilter,
    setHasActiveAlertsFilter,
    setCreatedDateRange,
    clearFilters,
    sortField,
    sortDirection,
    setSorting,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    paginatedOrganizations,
    refresh,
    selectedOrg,
    setSelectedOrg,
    keycloakActions: {
      createOrganization,
      updateOrganization,
      toggleOrganization,
      deleteOrganization,
    },
  };
};

export default useOrganizations;
