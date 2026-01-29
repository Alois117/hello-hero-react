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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { keycloak, initialized } = useKeycloak();

  /* FORCE TOKEN REFRESH AFTER LOGIN */
  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      // Force refresh to pick up latest role changes
      keycloak.updateToken(0).catch(() => {
        // ignore – will fallback to existing token
      });
    }
  }, [initialized, keycloak]);

  const decodedToken = useMemo<DecodedToken | null>(() => {
    if (!keycloak.token) return null;
    return decodeToken(keycloak.token);
  }, [keycloak.token]);

  const roles = useMemo<string[]>(() => {
    const clientId =
      import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'react-frontend';
    return extractRoles(decodedToken, clientId);
  }, [decodedToken]);

  /* ROLE IS DERIVED — NEVER STORED */
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

  const login = useCallback(() => {
    keycloak.login({
      redirectUri: `${window.location.origin}/auth/callback`,
    });
  }, [keycloak]);

  const logout = useCallback(() => {
    keycloak.logout({
      redirectUri: `${window.location.origin}/login`,
    });
  }, [keycloak]);

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

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
