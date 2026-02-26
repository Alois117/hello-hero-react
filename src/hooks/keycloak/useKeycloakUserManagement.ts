/**
 * useKeycloakUserManagement
 * Frontend hook for Keycloak User Admin API
 * Create, update, toggle (enable/disable) users
 * + assign default roles
 */
import { useCallback } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { KEYCLOAK_ADMIN_API_URL } from "@/config/env";

const BASE = KEYCLOAK_ADMIN_API_URL;

/** Safely parse JSON, returning null if content-type is not JSON */
async function safeParseJson(response: Response): Promise<any> {
  const ct = response.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await response.text();
    console.error("[useKeycloakUserManagement] Non-JSON response:", text.substring(0, 200));
    return null;
  }
  return response.json();
}

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

  const createUser = useCallback(
    async (data: CreateUserData): Promise<MutationResult> => {
      try {
        const response = await authenticatedFetch(`${BASE}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await safeParseJson(response);
        if (!response.ok) {
          return { success: false, error: result?.error || "Failed to create user" };
        }

        return { success: true, id: result?.id };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [authenticatedFetch]
  );

  const updateUser = useCallback(
    async (userId: string, data: UpdateUserData): Promise<MutationResult> => {
      try {
        const response = await authenticatedFetch(`${BASE}/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await safeParseJson(response);
        if (!response.ok) {
          return { success: false, error: result?.error || "Failed to update user" };
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [authenticatedFetch]
  );

  const toggleUserEnabled = useCallback(
    async (userId: string): Promise<MutationResult> => {
      try {
        const response = await authenticatedFetch(`${BASE}/users/${userId}/toggle`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        const result = await safeParseJson(response);
        if (!response.ok) {
          return { success: false, error: result?.error || "Failed to toggle user" };
        }

        return { success: true, enabled: result?.enabled };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [authenticatedFetch]
  );

  // ✅ Assign realm role (e.g., "user", "org_admin")
  const assignRealmRole = useCallback(
    async (userId: string, roleName: string): Promise<MutationResult> => {
      try {
        const response = await authenticatedFetch(`${BASE}/users/${userId}/roles/realm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roleName }),
        });

        const result = await safeParseJson(response);
        if (!response.ok) {
          return { success: false, error: result?.error || "Failed to assign role" };
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [authenticatedFetch]
  );

  // ✅ Send invitation email via Keycloak execute-actions-email
  const sendRequiredActionsEmail = useCallback(
    async (
      userId: string,
      options?: { actions?: string[]; lifespan?: number; redirectUri?: string; clientId?: string }
    ): Promise<MutationResult> => {
      try {
        const response = await authenticatedFetch(`${BASE}/users/${userId}/execute-actions-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actions: options?.actions || ["VERIFY_EMAIL", "UPDATE_PASSWORD"],
            lifespan: options?.lifespan || 86400,
            redirectUri: options?.redirectUri,
            clientId: options?.clientId,
          }),
        });

        const result = await safeParseJson(response);
        if (!response.ok) {
          return { success: false, error: result?.error || "Failed to send invitation email" };
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [authenticatedFetch]
  );

  return {
    createUser,
    updateUser,
    toggleUserEnabled,
    assignRealmRole,
    sendRequiredActionsEmail,
  };
};
