import Keycloak from 'keycloak-js';

const keycloakConfig = {
  // url: import.meta.env.VITE_KEYCLOAK_URL || 'http://10.100.12.141:8080',
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'Jarvis',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'react-frontend',
};

const keycloak = new Keycloak(keycloakConfig);

export const initOptions = {
  onLoad: 'check-sso' as const,
  pkceMethod: 'S256' as const,
  checkLoginIframe: true,
  silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
  redirectUri: `${window.location.origin}/dashboard`,
};

export default keycloak;
