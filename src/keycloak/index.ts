// Keycloak Configuration
export { default as keycloak, initOptions } from './config/keycloak';

// Context
export { AuthProvider, useAuth, type AppRole } from './context/AuthContext';

// Routes
export { default as ProtectedRoute } from './routes/ProtectedRoute';

// Components
export { default as AuthLoadingScreen } from './components/AuthLoadingScreen';
export { default as LogoutConfirmDialog } from './components/LogoutConfirmDialog';
export { default as UserInfoMenu } from './components/UserInfoMenu';

// Hooks
export { useAuthenticatedFetch } from './hooks/useAuthenticatedFetch';

// Utils
export {
  decodeToken,
  extractRoles,
  extractOrganizations,
  extractUsername,
  isTokenExpired,
  type DecodedToken,
} from './utils/tokenUtils';

export {
  authenticateWithKeycloak,
  isValidEmail,
  isValidPassword,
  type DirectAuthResult,
  type DirectAuthCredentials,
} from './utils/directAuth';
