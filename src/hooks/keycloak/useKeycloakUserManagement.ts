/**
 * useKeycloakUserManagement
 * Frontend hook for Keycloak User Admin API
 * Create, update, toggle (enable/disable) users
 */
import { useCallback } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { KEYCLOAK_ADMIN_API_URL } from "@/config/env";

const BASE = KEYCLOAK_ADMIN_API_URL;

export interface CreateUserData {
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  enabled?: boolean;
  temporaryPassword?: string;
  requiredActions?: string[];
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  enabled?: boolean;
}

interface MutationResult {
  success: boolean;
  id?: string;
  enabled?: boolean;
  error?: string;
}

export const useKeycloakUserManagement = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();

  const createUser = useCallback(async (data: CreateUserData): Promise<MutationResult> => {
    try {
      const response = await authenticatedFetch(`${BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.error || "Failed to create user" };
      }
      return { success: true, id: result.id };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }, [authenticatedFetch]);

  const updateUser = useCallback(async (userId: string, data: UpdateUserData): Promise<MutationResult> => {
    try {
      const response = await authenticatedFetch(`${BASE}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.error || "Failed to update user" };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }, [authenticatedFetch]);

  const toggleUserEnabled = useCallback(async (userId: string): Promise<MutationResult> => {
    try {
      const response = await authenticatedFetch(`${BASE}/users/${userId}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.error || "Failed to toggle user" };
      }
      return { success: true, enabled: result.enabled };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }, [authenticatedFetch]);

  return {
    createUser,
    updateUser,
    toggleUserEnabled,
  };
};
