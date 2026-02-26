/**
 * useKeycloakOrganizations
 * Frontend hook for Keycloak Organizations Admin REST API
 * Fetches real organizations from Keycloak (replaces webhook/DB dependency)
 *
 * ✅ Fix: Keycloak org list endpoint may NOT include `attributes`.
 * We now hydrate each org by calling GET /organizations/{id} and merging attributes.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { KEYCLOAK_ADMIN_API_URL } from "@/config/env";

export interface KeycloakOrganization {
  id: string;
  name: string;
  alias?: string;
  enabled: boolean;
  description?: string;
  redirectUrl?: string; // ✅ NEW (matches Keycloak org UI field)
  attributes?: Record<string, string[]>;
  domains?: Array<{ name: string; verified: boolean }>;
}

interface UseKeycloakOrganizationsReturn {
  organizations: KeycloakOrganization[];
  loading: boolean;
  error: string | null;
  total: number;
  refresh: () => Promise<void>;
  createOrganization: (
    data: CreateOrgData
  ) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateOrganization: (
    id: string,
    data: UpdateOrgData
  ) => Promise<{ success: boolean; error?: string }>;
  toggleOrganization: (
    org: KeycloakOrganization
  ) => Promise<{ success: boolean; error?: string }>;
  deleteOrganization: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export interface CreateOrgData {
  name: string;
  description?: string;
  redirectUrl?: string; // ✅ NEW
  enabled?: boolean;
  domains?: Array<{ name: string; verified?: boolean }>;
  attributes?: Record<string, string[]>;
}

export interface UpdateOrgData {
  name?: string;
  description?: string;
  redirectUrl?: string; // ✅ NEW
  enabled?: boolean;
  attributes?: Record<string, string[]>;
}

const BASE = KEYCLOAK_ADMIN_API_URL;

/** Safely parse JSON, returning null if content-type is not JSON */
async function safeParseJson(response: Response): Promise<any> {
  const ct = response.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await response.text();
    console.error(
      "[useKeycloakOrganizations] Non-JSON response:",
      text.substring(0, 200)
    );
    return null;
  }
  return response.json();
}

/** Normalize list response into an org array */
function extractOrgList(data: any): KeycloakOrganization[] {
  const orgs = Array.isArray(data)
    ? data
    : Array.isArray(data?.organizations)
    ? data.organizations
    : [];

  return orgs as KeycloakOrganization[];
}

/** Detect if at least one org is missing attributes (typical Keycloak "brief" list) */
function listLooksBrief(orgs: KeycloakOrganization[]): boolean {
  if (!Array.isArray(orgs) || orgs.length === 0) return false;
  return orgs.some((o) => o.attributes == null);
}

/**
 * Hydrate orgs by fetching GET /organizations/{id} for each org.
 * Uses a small concurrency pool to avoid hammering the backend.
 */
async function hydrateOrganizations(
  authenticatedFetch: (url: string, init?: RequestInit) => Promise<Response>,
  orgs: KeycloakOrganization[],
  concurrency = 6
): Promise<KeycloakOrganization[]> {
  const results: KeycloakOrganization[] = new Array(orgs.length);
  let index = 0;

  async function worker() {
    while (index < orgs.length) {
      const i = index++;
      const baseOrg = orgs[i];
      try {
        const res = await authenticatedFetch(`${BASE}/organizations/${baseOrg.id}`);
        if (res.ok) {
          const full = (await safeParseJson(res)) as KeycloakOrganization | null;
          results[i] = { ...baseOrg, ...(full || {}) };
        } else {
          results[i] = baseOrg;
        }
      } catch {
        results[i] = baseOrg;
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, orgs.length) }, () =>
    worker()
  );
  await Promise.all(workers);

  return results;
}

export const useKeycloakOrganizations = (): UseKeycloakOrganizationsReturn => {
  const [organizations, setOrganizations] = useState<KeycloakOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const { authenticatedFetch } = useAuthenticatedFetch();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchOrganizations = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        setError(null);

        const response = await authenticatedFetch(`${BASE}/organizations?first=0&max=500`);

        if (!response.ok) {
          throw new Error(`Failed to fetch organizations (${response.status})`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await response.text();
          console.error(
            "[useKeycloakOrganizations] Non-JSON response:",
            text.substring(0, 200)
          );
          throw new Error(
            "Backend returned non-JSON response. Check KEYCLOAK_ADMIN_API_URL configuration."
          );
        }

        const data = await response.json();

        if (!mountedRef.current) return;

        const orgs = extractOrgList(data);
        const computedTotal = data?.total ?? orgs.length;

        const needsHydration = listLooksBrief(orgs);
        let finalOrgs = orgs;

        if (needsHydration && orgs.length > 0) {
          finalOrgs = await hydrateOrganizations(authenticatedFetch, orgs);
        }

        if (!mountedRef.current) return;

        setOrganizations(finalOrgs);
        setTotal(computedTotal);
      } catch (err) {
        if (!mountedRef.current) return;
        const msg = err instanceof Error ? err.message : "Failed to load organizations";
        console.error("[useKeycloakOrganizations]", msg);
        if (!silent) setError(msg);
      } finally {
        if (mountedRef.current && !silent) setLoading(false);
      }
    },
    [authenticatedFetch]
  );

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    const interval = setInterval(() => fetchOrganizations(true), 60000);
    return () => clearInterval(interval);
  }, [fetchOrganizations]);

  const createOrganization = useCallback(
    async (data: CreateOrgData) => {
      try {
        const response = await authenticatedFetch(`${BASE}/organizations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await safeParseJson(response);
        if (!response.ok) {
          return { success: false, error: result?.error || "Failed to create organization" };
        }

        await fetchOrganizations(true);
        return { success: true, id: result?.id };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    },
    [authenticatedFetch, fetchOrganizations]
  );

  const updateOrganization = useCallback(
    async (id: string, data: UpdateOrgData) => {
      try {
        const response = await authenticatedFetch(`${BASE}/organizations/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await safeParseJson(response);
        if (!response.ok) {
          return { success: false, error: result?.error || "Failed to update organization" };
        }

        await fetchOrganizations(true);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    },
    [authenticatedFetch, fetchOrganizations]
  );

  const toggleOrganization = useCallback(
    async (org: KeycloakOrganization) => {
      return updateOrganization(org.id, { enabled: !org.enabled });
    },
    [updateOrganization]
  );

  const deleteOrganization = useCallback(
    async (id: string) => {
      try {
        const response = await authenticatedFetch(`${BASE}/organizations/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const result = await safeParseJson(response);
          return { success: false, error: result?.error || "Failed to delete organization" };
        }

        await fetchOrganizations(true);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    },
    [authenticatedFetch, fetchOrganizations]
  );

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
