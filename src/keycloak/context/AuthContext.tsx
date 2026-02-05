import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { useKeycloak } from '@react-keycloak/web';
import {
  decodeToken,
  extractRoles,
  extractOrganizations,
  extractUsername,
  DecodedToken,
} from '../utils/tokenUtils';
import { useTokenRefresh } from '../hooks/useTokenRefresh';
import { useIdleTimeout } from '../hooks/useIdleTimeout';

export type AppRole = 'user' | 'org_admin' | 'super_admin';

interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  token: string | null;
  username: string;
  email: string;
  roles: string[];
  appRole: AppRole;
  organizations: (string | Record<string, unknown>)[];
  decodedToken: DecodedToken | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuration constants
const IDLE_TIMEOUT_MINUTES = 10;
const TOKEN_REFRESH_INTERVAL_SECONDS = 30;
const TOKEN_MIN_VALIDITY_SECONDS = 60;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { keycloak, initialized } = useKeycloak();

  // ────────────────────────────────────────────────────────────────
  // DERIVED VALUES (computed from token)
  // ────────────────────────────────────────────────────────────────
  const decodedToken = useMemo<DecodedToken | null>(() => {
    if (!keycloak.token) return null;
    return decodeToken(keycloak.token);
  }, [keycloak.token]);

  const roles = useMemo<string[]>(() => {
    const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'react-frontend';
    return extractRoles(decodedToken, clientId);
  }, [decodedToken]);

  const appRole = useMemo<AppRole>(() => {
    if (roles.includes('super_admin')) return 'super_admin';
    if (roles.includes('org_admin')) return 'org_admin';
    return 'user';
  }, [roles]);

  const organizations = useMemo(() => {
    return extractOrganizations(decodedToken);
  }, [decodedToken]);

  const username = useMemo(() => {
    return extractUsername(decodedToken);
  }, [decodedToken]);

  const email = useMemo(() => {
    return decodedToken?.email || '';
  }, [decodedToken]);

  // ────────────────────────────────────────────────────────────────
  // FORCE LOGOUT HANDLER (used by token refresh and idle timeout)
  // ────────────────────────────────────────────────────────────────
  const handleForceLogout = useCallback((reason: string) => {
    // Clear any local state before redirect
    sessionStorage.clear();
    
    keycloak.logout({
      redirectUri: `${window.location.origin}/login`,
    });
  }, [keycloak]);

  // ────────────────────────────────────────────────────────────────
  // SILENT TOKEN REFRESH (handles token lifecycle)
  // ────────────────────────────────────────────────────────────────
  useTokenRefresh({
    keycloak,
    initialized,
    onForceLogout: handleForceLogout,
    refreshIntervalSeconds: TOKEN_REFRESH_INTERVAL_SECONDS,
    minValiditySeconds: TOKEN_MIN_VALIDITY_SECONDS,
  });

  // ────────────────────────────────────────────────────────────────
  // IDLE TIMEOUT (10 minute inactivity logout)
  // ────────────────────────────────────────────────────────────────
  const handleIdleLogout = useCallback(() => {
    handleForceLogout('User idle timeout');
  }, [handleForceLogout]);

  useIdleTimeout({
    timeoutMinutes: IDLE_TIMEOUT_MINUTES,
    onIdle: handleIdleLogout,
    enabled: initialized && !!keycloak.authenticated,
    userId: decodedToken?.sub,
    username,
    email,
  });


  // ────────────────────────────────────────────────────────────────
  // USER LOGOUT (explicit user action)
  // ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    keycloak
      .logout({
        redirectUri: `${window.location.origin}/login`,
      })
      .then(() => {
        // Force-clear any lingering tokens/state
        localStorage.clear();
        sessionStorage.clear();
      })
      .catch((err) => {
        console.error('[Auth] Logout failed', err);
        // Fallback: clear anyway
        localStorage.clear();
        sessionStorage.clear();
      });
  }, [keycloak]);

  // ────────────────────────────────────────────────────────────────
  // USER LOGIN
  // ────────────────────────────────────────────────────────────────
  const login = useCallback(() => {
    keycloak.login({
      redirectUri: `${window.location.origin}/auth/callback`,
    });
  }, [keycloak]);

  // ────────────────────────────────────────────────────────────────
  // CONTEXT VALUE
  // ────────────────────────────────────────────────────────────────
  const contextValue = useMemo<AuthContextType>(
    () => ({
      isAuthenticated: !!keycloak.authenticated,
      isInitialized: initialized,
      token: keycloak.token || null,
      username,
      email,
      roles,
      appRole,
      organizations,
      decodedToken,
      login,
      logout,
    }),
    [
      keycloak.authenticated,
      keycloak.token,
      initialized,
      username,
      email,
      roles,
      appRole,
      organizations,
      decodedToken,
      login,
      logout,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
