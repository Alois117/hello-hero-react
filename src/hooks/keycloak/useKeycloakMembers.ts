/**
 * useKeycloakMembers
 * Frontend hook for Keycloak Organization Members API
 * GET /organizations/:orgId/members
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { KEYCLOAK_ADMIN_API_URL } from "@/config/env";

export interface KeycloakMember {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  emailVerified?: boolean;
  createdTimestamp?: number;
}

interface UseKeycloakMembersReturn {
  members: KeycloakMember[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addMember: (userId: string) => Promise<{ success: boolean; error?: string }>;
  removeMember: (memberId: string) => Promise<{ success: boolean; error?: string }>;
}

const BASE = KEYCLOAK_ADMIN_API_URL;

export const useKeycloakMembers = (
  orgId: string | null
): UseKeycloakMembersReturn => {
  const [members, setMembers] = useState<KeycloakMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { authenticatedFetch } = useAuthenticatedFetch();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchMembers = useCallback(async (silent = false) => {
    if (!orgId) {
      setMembers([]);
      return;
    }

    try {
      if (!silent) setLoading(true);
      setError(null);

      const response = await authenticatedFetch(
        `${BASE}/organizations/${orgId}/members?first=0&max=500`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch members (${response.status})`);
      }

      const data = await response.json();
      if (!mountedRef.current) return;

      const rawMembers = Array.isArray(data) ? data : [];
      const normalized: KeycloakMember[] = rawMembers.map((m: any) => ({
        id: m.id || "",
        username: m.username || "",
        firstName: m.firstName || "",
        lastName: m.lastName || "",
        email: m.email || "",
        enabled: m.enabled !== false,
        emailVerified: m.emailVerified,
        createdTimestamp: m.createdTimestamp,
      }));

      setMembers(normalized);
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : "Failed to load members";
      console.error("[useKeycloakMembers]", msg);
      if (!silent) setError(msg);
    } finally {
      if (mountedRef.current && !silent) setLoading(false);
    }
  }, [orgId, authenticatedFetch]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = useCallback(async (userId: string) => {
    if (!orgId) return { success: false, error: "No organization selected" };

    try {
      const response = await authenticatedFetch(
        `${BASE}/organizations/${orgId}/members`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        return { success: false, error: result.error || "Failed to add member" };
      }

      await fetchMembers(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }, [orgId, authenticatedFetch, fetchMembers]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!orgId) return { success: false, error: "No organization selected" };

    try {
      const response = await authenticatedFetch(
        `${BASE}/organizations/${orgId}/members/${memberId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const result = await response.json();
        return { success: false, error: result.error || "Failed to remove member" };
      }

      await fetchMembers(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }, [orgId, authenticatedFetch, fetchMembers]);

  return {
    members,
    loading,
    error,
    refresh: () => fetchMembers(false),
    addMember,
    removeMember,
  };
};
