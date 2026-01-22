import { useKeycloak } from '@react-keycloak/web';
import { useCallback, useMemo } from 'react';
import { UserRole } from '@/utils/auth';
import { AUTH_REDIRECT_URI, AUTH_LOGOUT_REDIRECT_URI } from './keycloak';

export interface KeycloakUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  organizationId?: string;
  roles: string[];
}

export interface UseKeycloakAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: KeycloakUser | null;
  token: string | undefined;
  login: () => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  getAuthHeader: () => { Authorization: string } | Record<string, never>;
}

/**
 * Custom hook for Keycloak authentication
 * Parses tokens for roles and org_id, provides login/logout functions
 */
export const useKeycloakAuth = (): UseKeycloakAuthReturn => {
  const { keycloak, initialized } = useKeycloak();

  // Parse user info from ID token
  const user = useMemo<KeycloakUser | null>(() => {
    if (!keycloak.authenticated || !keycloak.tokenParsed) {
      return null;
    }

    const tokenParsed = keycloak.tokenParsed as {
      sub?: string;
      email?: string;
      name?: string;
      preferred_username?: string;
      realm_access?: { roles?: string[] };
      resource_access?: Record<string, { roles?: string[] }>;
      org_id?: string;
      organization_id?: string;
    };

    // Extract roles from realm_access or resource_access
    const realmRoles = tokenParsed.realm_access?.roles || [];
    const clientRoles = tokenParsed.resource_access?.['react-frontend']?.roles || [];
    const allRoles = [...new Set([...realmRoles, ...clientRoles])];

    // Determine the highest role (super_admin > org_admin > user)
    let role: UserRole = 'user';
    if (allRoles.includes('super_admin')) {
      role = 'super_admin';
    } else if (allRoles.includes('org_admin')) {
      role = 'org_admin';
    }

    // Extract organization ID from custom claim
    const organizationId = tokenParsed.org_id || tokenParsed.organization_id;

    const userData: KeycloakUser = {
      id: tokenParsed.sub || '',
      email: tokenParsed.email || tokenParsed.preferred_username || '',
      name: tokenParsed.name,
      role,
      organizationId,
      roles: allRoles,
    };

    // Log parsed user data for debugging
    console.log('[Keycloak] Parsed user data:', userData);

    return userData;
  }, [keycloak.authenticated, keycloak.tokenParsed]);

  // Login function - redirects to Keycloak login page
  // ALWAYS uses AUTH_REDIRECT_URI to ensure consistency with Keycloak's Valid Redirect URIs
  const login = useCallback(() => {
    console.log('[Keycloak] Initiating login with redirectUri:', AUTH_REDIRECT_URI);
    keycloak.login({
      redirectUri: AUTH_REDIRECT_URI,
    });
  }, [keycloak]);

  // Logout function - clears tokens and redirects to Keycloak logout
  const logout = useCallback(() => {
    sessionStorage.removeItem('kc_token');
    keycloak.logout({
      redirectUri: AUTH_LOGOUT_REDIRECT_URI,
    });
  }, [keycloak]);

  // Check if user has required role (with hierarchy)
  const hasRole = useCallback((requiredRole: UserRole): boolean => {
    if (!user) return false;

    const roleHierarchy: Record<UserRole, number> = {
      user: 1,
      org_admin: 2,
      super_admin: 3,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }, [user]);

  // Get Authorization header for API calls
  const getAuthHeader = useCallback((): { Authorization: string } | Record<string, never> => {
    if (keycloak.token) {
      return { Authorization: `Bearer ${keycloak.token}` };
    }
    return {};
  }, [keycloak.token]);

  return {
    isAuthenticated: !!keycloak.authenticated,
    isLoading: !initialized,
    user,
    token: keycloak.token,
    login,
    logout,
    hasRole,
    getAuthHeader,
  };
};

export default useKeycloakAuth;
