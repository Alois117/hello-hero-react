/**
 * Super Admin Organizations Hook
 * Fetches organization list from backend and provides aggregated metrics
 * Uses the same authenticatedFetch pattern as user dashboard hooks
 */
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { 
  Organization, 
  OrganizationRaw, 
  OrganizationCounts, 
  OrganizationFilters,
  OrganizationSortField,
  SortDirection 
} from "./types";
import { WEBHOOK_ORGANIZATIONS_URL } from "@/config/env";
import { safeParseResponse } from "@/lib/safeFetch";

// Using the same webhook pattern as other hooks
const ORGANIZATIONS_ENDPOINT = WEBHOOK_ORGANIZATIONS_URL;
const REFRESH_INTERVAL = 30000; // 30 seconds - less aggressive than alerts

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
}

const transformOrganization = (raw: OrganizationRaw): Organization => {
  const isActive = raw.status === "active" || raw.status === 1 || raw.status === undefined;
  
  return {
    id: raw.client_id,
    clientId: raw.client_id,
    name: raw.client_name || `Organization ${raw.client_id}`,
    status: isActive ? "active" : "inactive",
    createdAt: raw.created_at ? new Date(raw.created_at) : new Date(),
    updatedAt: raw.updated_at ? new Date(raw.updated_at) : new Date(),
    // Use pre-aggregated counts if available, otherwise defaults
    userCount: raw.user_count ?? 0,
    activeAlerts: raw.active_alerts ?? 0,
    hostsCount: raw.hosts_count ?? 0,
    reportsCount: raw.reports_count ?? 0,
    insightsCount: raw.insights_count ?? 0,
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
  // Core state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const orgsMapRef = useRef<Map<number, Organization>>(new Map());

  const { authenticatedFetch } = useAuthenticatedFetch();

  // Fetch organizations
  const fetchOrganizations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await authenticatedFetch(ORGANIZATIONS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await safeParseResponse<OrganizationRaw[]>(response, ORGANIZATIONS_ENDPOINT);
      if (!result.ok) {
        throw new Error(result.userMessage);
      }

      const rawOrgs: OrganizationRaw[] = Array.isArray(result.data) ? result.data : [];

      // Transform and deduplicate
      const transformed = rawOrgs
        .filter((raw) => raw.client_id != null)
        .map(transformOrganization);

      // Smart merge - prevent UI flicker
      const newMap = new Map<number, Organization>();
      transformed.forEach((org) => {
        const existing = orgsMapRef.current.get(org.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(org)) {
          newMap.set(org.id, org);
        } else {
          newMap.set(org.id, existing);
        }
      });

      orgsMapRef.current = newMap;
      setOrganizations(Array.from(newMap.values()));
      setIsConnected(true);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const safe = err instanceof Error ? err.message : "We couldn't load organizations. Please try again.";
      console.error("[useOrganizations] Fetch error:", err);
      if (!silent) setError(safe);
      setIsConnected(false);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [authenticatedFetch]);

  // Initial fetch
  useEffect(() => {
    fetchOrganizations(false);
  }, [fetchOrganizations]);

  // Silent auto-refresh
  useEffect(() => {
    intervalRef.current = setInterval(() => fetchOrganizations(true), REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchOrganizations]);

  // Computed counts
  const counts = useMemo((): OrganizationCounts => ({
    total: organizations.length,
    active: organizations.filter((o) => o.status === "active").length,
    inactive: organizations.filter((o) => o.status === "inactive").length,
    totalUsers: organizations.reduce((sum, o) => sum + o.userCount, 0),
    totalAlerts: organizations.reduce((sum, o) => sum + o.activeAlerts, 0),
  }), [organizations]);

  // Filtered organizations
  const filteredOrganizations = useMemo(() => {
    const query = filters.searchQuery.toLowerCase().trim();
    
    return organizations.filter((org) => {
      // Search filter
      const matchesSearch = !query || 
        org.name.toLowerCase().includes(query) ||
        org.clientId.toString().includes(query);

      // Status filter
      const matchesStatus = filters.statusFilter === "all" || 
        org.status === filters.statusFilter;

      // Active alerts filter
      const matchesAlerts = filters.hasActiveAlerts === null ||
        (filters.hasActiveAlerts ? org.activeAlerts > 0 : org.activeAlerts === 0);

      // Date range filter
      const matchesDateFrom = !filters.createdDateFrom || 
        org.createdAt >= filters.createdDateFrom;
      const matchesDateTo = !filters.createdDateTo || 
        org.createdAt <= filters.createdDateTo;

      return matchesSearch && matchesStatus && matchesAlerts && matchesDateFrom && matchesDateTo;
    });
  }, [organizations, filters]);

  // Sorted organizations
  const sortedOrganizations = useMemo(() => {
    return sortOrganizations(filteredOrganizations, sortField, sortDirection);
  }, [filteredOrganizations, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedOrganizations.length / pageSize));

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

  const setStatusFilter = useCallback((status: "all" | "active" | "inactive") => {
    setFilters((prev) => ({ ...prev, statusFilter: status }));
  }, []);

  const setHasActiveAlertsFilter = useCallback((value: boolean | null) => {
    setFilters((prev) => ({ ...prev, hasActiveAlerts: value }));
  }, []);

  const setCreatedDateRange = useCallback((from: Date | null, to: Date | null) => {
    setFilters((prev) => ({ ...prev, createdDateFrom: from, createdDateTo: to }));
  }, []);

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

  const setSorting = useCallback((field: OrganizationSortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  const refresh = useCallback(async () => {
    await fetchOrganizations(false);
  }, [fetchOrganizations]);

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
  };
};

export default useOrganizations;
