/**
 * useKeycloakOrganizations
 * Frontend hook for Keycloak Organizations Admin REST API
 * Fetches real organizations from Keycloak (replaces webhook/DB dependency)
 */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { KEYCLOAK_ADMIN_API_URL } from "@/config/env";

export interface KeycloakOrganization {
  id: string;
  name: string;
  alias?: string;
  enabled: boolean;
  description?: string;
  attributes?: Record<string, string[]>;
  domains?: Array<{ name: string; verified: boolean }>;
}

interface UseKeycloakOrganizationsReturn {
  organizations: KeycloakOrganization[];
  loading: boolean;
  error: string | null;
  total: number;
  refresh: () => Promise<void>;
  createOrganization: (data: CreateOrgData) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateOrganization: (id: string, data: UpdateOrgData) => Promise<{ success: boolean; error?: string }>;
  toggleOrganization: (org: KeycloakOrganization) => Promise<{ success: boolean; error?: string }>;
  deleteOrganization: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export interface CreateOrgData {
  name: string;
  description?: string;
  enabled?: boolean;
  domains?: Array<{ name: string; verified?: boolean }>;
  attributes?: Record<string, string[]>;
}

export interface UpdateOrgData {
  name?: string;
  description?: string;
  enabled?: boolean;
  attributes?: Record<string, string[]>;
}

const BASE = KEYCLOAK_ADMIN_API_URL;

export const useKeycloakOrganizations = (): UseKeycloakOrganizationsReturn => {
  const [organizations, setOrganizations] = useState<KeycloakOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const { authenticatedFetch } = useAuthenticatedFetch();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchOrganizations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const response = await authenticatedFetch(
        `${BASE}/organizations?first=0&max=500`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch organizations (${response.status})`);
      }

      const data = await response.json();

      if (!mountedRef.current) return;

      // Response shape: { organizations: [...], total: N } or just array
      const orgs = Array.isArray(data)
        ? data
        : Array.isArray(data.organizations)
        ? data.organizations
        : [];

      setOrganizations(orgs);
      setTotal(data.total ?? orgs.length);
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : "Failed to load organizations";
      console.error("[useKeycloakOrganizations]", msg);
      if (!silent) setError(msg);
    } finally {
      if (mountedRef.current && !silent) setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => fetchOrganizations(true), 60000);
    return () => clearInterval(interval);
  }, [fetchOrganizations]);

  const createOrganization = useCallback(async (data: CreateOrgData) => {
    try {
      const response = await authenticatedFetch(`${BASE}/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.error || "Failed to create organization" };
      }

      await fetchOrganizations(true);
      return { success: true, id: result.id };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }, [authenticatedFetch, fetchOrganizations]);

  const updateOrganization = useCallback(async (id: string, data: UpdateOrgData) => {
    try {
      const response = await authenticatedFetch(`${BASE}/organizations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.error || "Failed to update organization" };
      }

      await fetchOrganizations(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }, [authenticatedFetch, fetchOrganizations]);

  const toggleOrganization = useCallback(async (org: KeycloakOrganization) => {
    return updateOrganization(org.id, { enabled: !org.enabled });
  }, [updateOrganization]);

  const deleteOrganization = useCallback(async (id: string) => {
    try {
      const response = await authenticatedFetch(`${BASE}/organizations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        return { success: false, error: result.error || "Failed to delete organization" };
      }

      await fetchOrganizations(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }, [authenticatedFetch, fetchOrganizations]);

  return {
    organizations,
    loading,
    error,
    total,
    refresh: () => fetchOrganizations(false),
    createOrganization,
    updateOrganization,
    toggleOrganization,
    deleteOrganization,
  };
};
