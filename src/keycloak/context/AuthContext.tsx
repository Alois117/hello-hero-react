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
  isTokenExpired,
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

  // ────────────────────────────────────────────────────────────────
  // FORCE TOKEN REFRESH AFTER LOGIN
  // ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      keycloak.updateToken(0).catch(() => {
        // ignore – existing token still valid for now
      });
    }
  }, [initialized, keycloak]);

  // ────────────────────────────────────────────────────────────────
  // CONTINUOUS TOKEN REFRESH + EXPIRY DETECTION
  // ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialized || !keycloak.authenticated) return;

    const interval = setInterval(() => {
      keycloak
        .updateToken(60) // refresh if <60s left
        .then((refreshed) => {
          if (refreshed) {
            console.debug('[Auth] Access token refreshed');
          }
        })
        .catch((err) => {
          console.error('[Auth] Token refresh failed → likely revoked/expired', err);
          keycloak.logout({
            redirectUri: `${window.location.origin}/login`,
          });
        });

      // Extra safety: check decoded expiry even if refresh succeeds
      if (keycloak.tokenParsed) {
        const decoded = decodeToken(keycloak.token!);
        if (decoded && isTokenExpired(decoded)) {
          console.debug('[Auth] Token expired despite refresh attempt → logout');
          keycloak.logout({
            redirectUri: `${window.location.origin}/login`,
          });
        }
      }
    }, 30_000); // check every 30 seconds

    return () => clearInterval(interval);
  }, [initialized, keycloak]);

  // INACTIVITY TIMEOUT (10 minutes)
  useEffect(() => {
    if (!initialized || !keycloak.authenticated) return;

    const IDLE_TIMEOUT_MIN = 10;
    let idleTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        console.debug('[Auth] Inactivity timeout (10 min) → logging out');
        keycloak.logout({
          redirectUri: `${window.location.origin}/login`,
        });
      }, IDLE_TIMEOUT_MIN * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));

    resetTimer(); // start timer

    return () => {
      clearTimeout(idleTimer);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [initialized, keycloak.authenticated, keycloak]);


  // DERIVED VALUES (unchanged)
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

  // IMPROVED LOGOUT – clear storage after Keycloak logout
  const logout = useCallback(() => {
    keycloak
      .logout({
        redirectUri: `${window.location.origin}/login`,
      })
      .then(() => {
        // Force-clear any lingering tokens/state
        localStorage.clear();
        sessionStorage.clear();
        console.debug('[Auth] Logout completed – storage cleared');
      })
      .catch((err) => {
        console.error('[Auth] Logout failed', err);
        // Fallback: clear anyway
        localStorage.clear();
        sessionStorage.clear();
      });
  }, [keycloak]);

  const login = useCallback(() => {
    keycloak.login({
      redirectUri: `${window.location.origin}/auth/callback`,
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