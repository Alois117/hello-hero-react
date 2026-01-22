import React, { createContext, useContext, useMemo } from "react";
import { useKeycloak } from "@react-keycloak/web";

type OrgClaim = string | { id?: string; name?: string; [k: string]: unknown };

export interface AuthContextValue {
  isAuthenticated: boolean;
  token: string | undefined;
  username: string | undefined;
  roles: string[];
  organizations: OrgClaim[];
  login: (redirectUri?: string) => void;
  logout: (redirectUri?: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeOrganizations(value: unknown): OrgClaim[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as OrgClaim[];
  return [value as OrgClaim];
}

function extractRoles(tokenParsed: unknown, clientId: string): string[] {
  const parsed = tokenParsed as {
    realm_access?: { roles?: string[] };
    resource_access?: Record<string, { roles?: string[] }>;
  } | null;

  const realmRoles = parsed?.realm_access?.roles ?? [];
  const clientRoles = parsed?.resource_access?.[clientId]?.roles ?? [];
  return Array.from(new Set([...realmRoles, ...clientRoles]));
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { keycloak, initialized } = useKeycloak();

  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "react-frontend";
  const dashboardRedirect = "http://localhost:8082/dashboard";
  const logoutRedirect = "http://localhost:8082/";

  const value = useMemo<AuthContextValue>(() => {
    const tokenParsed = keycloak?.tokenParsed as
      | {
          preferred_username?: string;
          sub?: string;
          orgs?: unknown;
          organization?: unknown;
        }
      | undefined;

    const roles = extractRoles(keycloak?.tokenParsed, clientId);
    const organizations = normalizeOrganizations(tokenParsed?.orgs ?? tokenParsed?.organization);
    const username = tokenParsed?.preferred_username ?? tokenParsed?.sub;

    return {
      isAuthenticated: !!keycloak?.authenticated,
      token: keycloak?.token,
      username,
      roles,
      organizations,
      login: (redirectUri?: string) => {
        keycloak.login({ redirectUri: redirectUri ?? dashboardRedirect });
      },
      logout: (redirectUri?: string) => {
        keycloak.logout({ redirectUri: redirectUri ?? logoutRedirect });
      },
    };
  }, [clientId, keycloak, keycloak?.authenticated, keycloak?.token, keycloak?.tokenParsed]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
};

