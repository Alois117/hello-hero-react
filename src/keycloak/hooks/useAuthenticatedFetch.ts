/**
 * Authenticated Fetch Hook with Organization Scoping
 * 
 * SECURITY CRITICAL:
 * - Automatically attaches Authorization header
 * - Automatically attaches X-Organization-Id header for tenant isolation
 * - Super admin requests do NOT include X-Organization-Id
 */

import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';

interface FetchOptions extends RequestInit {
  /** Skip adding Authorization header */
  skipAuth?: boolean;
  /** Skip adding X-Organization-Id header (use with caution) */
  skipOrgHeader?: boolean;
}

export const useAuthenticatedFetch = () => {
  const { token, isAuthenticated } = useAuth();
  const { organizationId, isSuperAdmin } = useOrganization();

  /**
   * Fetch wrapper that automatically attaches auth and org headers.
   * 
   * Headers attached:
   * - Authorization: Bearer <token> (if authenticated)
   * - X-Organization-Id: <org-id> (if not super_admin and org exists)
   */
  const authenticatedFetch = useCallback(
    async (url: string, options: FetchOptions = {}): Promise<Response> => {
      const { 
        skipAuth = false, 
        skipOrgHeader = false,
        headers: customHeaders, 
        ...restOptions 
      } = options;

      const headers = new Headers(customHeaders);

      // Attach Authorization header if authenticated and not skipped
      if (!skipAuth && isAuthenticated && token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      // Attach X-Organization-Id header for tenant scoping
      // - Only for non-super_admin users
      // - Only if org validation passed and ID exists
      // - Can be explicitly skipped if needed
      if (!skipOrgHeader && !isSuperAdmin && organizationId) {
        headers.set('X-Organization-Id', organizationId);
      }

      return fetch(url, {
        ...restOptions,
        headers,
      });
    },
    [token, isAuthenticated, organizationId, isSuperAdmin]
  );

  return { 
    authenticatedFetch,
    /** Current organization ID (null for super_admin) */
    organizationId,
    /** Whether user is super_admin */
    isSuperAdmin,
  };
};

export default useAuthenticatedFetch;
