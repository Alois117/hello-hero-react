import Keycloak from 'keycloak-js';

// Keycloak configuration from environment variables
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'my-realm',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'react-frontend',
};

// Create Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

export default keycloak;

// Centralized redirect URI - MUST be used in ALL login() calls
// This ensures the redirect_uri sent to Keycloak always matches the configured Valid Redirect URIs
export const AUTH_REDIRECT_URI =
  import.meta.env.VITE_KEYCLOAK_REDIRECT_URI || `${window.location.origin}/oauth/callback`;

// Logout redirect URI
export const AUTH_LOGOUT_REDIRECT_URI = window.location.origin + '/';

// Token refresh configuration
export const REFRESH_TOKEN_MIN_VALIDITY = 60; // seconds before expiry to refresh

// Optional init options (not used directly now, kept for reference)
export const keycloakInitOptions = {
  onLoad: 'check-sso' as const,
  pkceMethod: 'S256' as const,
  checkLoginIframe: false,
};
