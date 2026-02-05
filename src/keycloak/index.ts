// Keycloak Configuration
export { default as keycloak, initOptions } from './config/keycloak';

// Context
export { AuthProvider, useAuth, type AppRole } from './context/AuthContext';
export { OrganizationProvider, useOrganization } from './context/OrganizationContext';

// Routes
export { default as ProtectedRoute } from './routes/ProtectedRoute';

// Components
export { default as AuthLoadingScreen } from './components/AuthLoadingScreen';
export { default as LogoutConfirmDialog } from './components/LogoutConfirmDialog';
export { default as UserInfoMenu } from './components/UserInfoMenu';

// Hooks
export { useAuthenticatedFetch } from './hooks/useAuthenticatedFetch';
export { useIdleTimeout } from './hooks/useIdleTimeout';
export { useTokenRefresh } from './hooks/useTokenRefresh';

// Utils - Token

export {
  decodeToken,
  extractRoles,
  extractOrganizations,
  extractUsername,
  isTokenExpired,
  type DecodedToken,
} from './utils/tokenUtils';

// Utils - Organization (Multi-Tenant)
export {
  extractOrganizationsFromToken,
  validateOrganizationMembership,
  getOrganizationIdForRequests,
  type ParsedOrganization,
  type OrganizationValidationResult,
} from './utils/organizationUtils';
