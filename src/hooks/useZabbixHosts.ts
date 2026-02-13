import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { WEBHOOK_ZABBIX_HOSTS_URL } from "@/config/env";
import { safeParseResponse } from "@/lib/safeFetch";

// ────────────────────────────────────────────────
// Endpoint Configuration
// ────────────────────────────────────────────────
const WEBHOOK_URL = WEBHOOK_ZABBIX_HOSTS_URL;
const REFRESH_INTERVAL = 5000; // 5 seconds - mirrors Zabbix Alerts

// ────────────────────────────────────────────────
// Type Definitions (Authoritative Contract)
// ────────────────────────────────────────────────
export interface ZabbixHostRaw {
  client_id: number;
  groups_json: {
    ip: string;
    name: string;
    groups: string[];
    hostId: string;
    client_id: number;
  };
  updated_at: string;
  created_at: string;
  last_collected_at: string | null;
  tags_json: Record<string, unknown>;
  linked_veeam_moref: string | null;
  status: number; // 0 = enabled
}

export interface ZabbixHost {
  id: string;
  name: string;
  ip: string;
  groups: string[];
  status: "enabled" | "disabled";
  clientId: number;
  createdAt: Date;
  updatedAt: Date;
  lastCollectedAt: Date | null;
  linkedVeeamMoref: string | null;
  tags: Record<string, unknown>;
}

export interface ZabbixHostCounts {
  total: number;
  enabled: number;
  disabled: number;
  withVeeamLink: number;
  uniqueGroups: number;
}

export type ZabbixHostStatusFilter = "all" | "enabled" | "disabled";

export interface UseZabbixHostsReturn {
  hosts: ZabbixHost[];
  loading: boolean;
  error: string | null;
  counts: ZabbixHostCounts;
  isConnected: boolean;
  lastUpdated: Date | null;
  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGroup: string | null;
  setSelectedGroup: (group: string | null) => void;
  statusFilter: ZabbixHostStatusFilter;
  setStatusFilter: (status: ZabbixHostStatusFilter) => void;
  clearFilters: () => void;
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  totalPages: number;
  paginatedHosts: ZabbixHost[];
  // Derived data
  uniqueGroups: string[];
}

// ────────────────────────────────────────────────
// Transform raw API response to normalized format
// ────────────────────────────────────────────────
const transformHost = (raw: ZabbixHostRaw): ZabbixHost => {
  const groupsJson = raw.groups_json;
  
  return {
    id: groupsJson?.hostId ?? String(raw.client_id),
    name: groupsJson?.name ?? "Unknown Host",
    ip: groupsJson?.ip ?? "—",
    groups: Array.isArray(groupsJson?.groups) ? groupsJson.groups : [],
    status: raw.status === 0 ? "enabled" : "disabled",
    clientId: raw.client_id,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at),
    lastCollectedAt: raw.last_collected_at ? new Date(raw.last_collected_at) : null,
    linkedVeeamMoref: raw.linked_veeam_moref,
    tags: raw.tags_json ?? {},
  };
};

// Sort hosts by name (deterministic ordering)
const sortHosts = (hosts: ZabbixHost[]): ZabbixHost[] => {
  return [...hosts].sort((a, b) => a.name.localeCompare(b.name));
};

// ────────────────────────────────────────────────
// Main Hook
// ────────────────────────────────────────────────
export const useZabbixHosts = (pageSize = 10): UseZabbixHostsReturn => {
  // Core state
  const [hosts, setHosts] = useState<ZabbixHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ZabbixHostStatusFilter>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Refs for silent refresh and cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hostsMapRef = useRef<Map<string, ZabbixHost>>(new Map());

  const { authenticatedFetch } = useAuthenticatedFetch();

  // ────────────────────────────────────────────────
  // Data Fetching
  // ────────────────────────────────────────────────
  const fetchHosts = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await authenticatedFetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await safeParseResponse<ZabbixHostRaw[]>(response, WEBHOOK_URL);
      if (!result.ok) {
        throw new Error(result.userMessage);
      }

      const rawHosts: ZabbixHostRaw[] = Array.isArray(result.data) ? result.data : [];

      // Transform and validate
      const transformed = rawHosts
        .filter((raw) => raw.groups_json?.hostId) // Filter invalid entries
        .map(transformHost);

      // Smart merge - only update changed items (prevents UI flicker)
      const newMap = new Map<string, ZabbixHost>();
      transformed.forEach((host) => {
        const existing = hostsMapRef.current.get(host.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(host)) {
          newMap.set(host.id, host);
        } else {
          newMap.set(host.id, existing);
        }
      });

      hostsMapRef.current = newMap;
      const sorted = sortHosts(Array.from(newMap.values()));

      setHosts(sorted);
      setIsConnected(true);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const safe = err instanceof Error ? err.message : "We couldn't load Zabbix hosts. Please try again.";
      console.error("[useZabbixHosts] Fetch error:", err);
      if (!silent) setError(safe);
      setIsConnected(false);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [authenticatedFetch]);

  // Initial fetch
  useEffect(() => {
    fetchHosts(false);
  }, [fetchHosts]);

  // Silent auto-refresh - mirrors Zabbix Alerts behavior
  useEffect(() => {
    intervalRef.current = setInterval(() => fetchHosts(true), REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchHosts]);

  // ────────────────────────────────────────────────
  // Derived Data
  // ────────────────────────────────────────────────
  
  // Extract unique groups from all hosts
  const uniqueGroups = useMemo(() => {
    const groupSet = new Set<string>();
    hosts.forEach((host) => {
      host.groups.forEach((group) => groupSet.add(group));
    });
    return Array.from(groupSet).sort();
  }, [hosts]);

  // Counts for summary cards
  const counts = useMemo((): ZabbixHostCounts => ({
    total: hosts.length,
    enabled: hosts.filter((h) => h.status === "enabled").length,
    disabled: hosts.filter((h) => h.status === "disabled").length,
    withVeeamLink: hosts.filter((h) => h.linkedVeeamMoref !== null).length,
    uniqueGroups: uniqueGroups.length,
  }), [hosts, uniqueGroups]);

  // Filtered hosts (search + group + status)
  const filteredHosts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return hosts.filter((host) => {
      // Search filter
      const matchesSearch =
        !query ||
        host.name.toLowerCase().includes(query) ||
        host.ip.toLowerCase().includes(query) ||
        host.groups.some((g) => g.toLowerCase().includes(query));

      // Group filter
      const matchesGroup =
        !selectedGroup || host.groups.includes(selectedGroup);

      // Status filter
      const matchesStatus =
        statusFilter === "all" || host.status === statusFilter;

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [hosts, searchQuery, selectedGroup, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredHosts.length / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGroup, statusFilter]);

  const paginatedHosts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredHosts.slice(startIndex, startIndex + pageSize);
  }, [filteredHosts, currentPage, pageSize]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedGroup(null);
    setStatusFilter("all");
    setCurrentPage(1);
  }, []);

  return {
    hosts: filteredHosts,
    loading,
    error,
    counts,
    isConnected,
    lastUpdated,
    searchQuery,
    setSearchQuery,
    selectedGroup,
    setSelectedGroup,
    statusFilter,
    setStatusFilter,
    clearFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    paginatedHosts,
    uniqueGroups,
  };
};

export default useZabbixHosts;
