// Legacy Supabase auth utilities - kept for reference
// Primary auth is now handled by Keycloak

export type UserRole = 'user' | 'org_admin' | 'super_admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  organizationId?: string;
}

// Re-export Keycloak auth for convenience
export { useKeycloakAuth } from '@/auth/useKeycloakAuth';
export type { KeycloakUser } from '@/auth/useKeycloakAuth';

/**
 * @deprecated Use useKeycloakAuth hook instead
 * Legacy function kept for backward compatibility
 */
export const getAuthUser = async (): Promise<AuthUser | null> => {
  console.warn('[auth.ts] getAuthUser is deprecated. Use useKeycloakAuth hook instead.');
  return null;
};

/**
 * @deprecated Signup is handled in Keycloak admin console
 */
export const signUp = async (_email: string, _password: string, _fullName?: string) => {
  console.warn('[auth.ts] signUp is deprecated. Users are managed in Keycloak.');
  return { data: null, error: new Error('Signup is managed through Keycloak') };
};

/**
 * @deprecated Use useKeycloakAuth().login() instead
 */
export const signIn = async (_email: string, _password: string) => {
  console.warn('[auth.ts] signIn is deprecated. Use useKeycloakAuth().login() instead.');
  return { data: null, error: new Error('Use Keycloak SSO for login') };
};

/**
 * @deprecated Use useKeycloakAuth().logout() instead
 */
export const signOut = async () => {
  console.warn('[auth.ts] signOut is deprecated. Use useKeycloakAuth().logout() instead.');
  return { error: new Error('Use Keycloak SSO for logout') };
};

/**
 * @deprecated Password reset is handled in Keycloak
 */
export const resetPasswordForEmail = async (_email: string) => {
  console.warn('[auth.ts] resetPasswordForEmail is deprecated. Password reset is handled in Keycloak.');
  return { data: null, error: new Error('Password reset is handled through Keycloak') };
};

/**
 * @deprecated Password update is handled in Keycloak
 */
export const updatePassword = async (_newPassword: string) => {
  console.warn('[auth.ts] updatePassword is deprecated. Password update is handled in Keycloak.');
  return { data: null, error: new Error('Password update is handled through Keycloak') };
};

/**
 * @deprecated Use useKeycloakAuth().isAuthenticated instead
 */
export const isAuthenticated = async (): Promise<boolean> => {
  console.warn('[auth.ts] isAuthenticated is deprecated. Use useKeycloakAuth().isAuthenticated instead.');
  return false;
};
