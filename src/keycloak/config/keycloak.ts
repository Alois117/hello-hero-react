import Keycloak from 'keycloak-js';

const keycloakConfig = {
  // url: import.meta.env.VITE_KEYCLOAK_URL || 'https://10.100.12.141:8443',
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'Jarvis',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'react-frontend',
};

const keycloak = new Keycloak(keycloakConfig);

export const initOptions = {
  onLoad: 'check-sso' as const,
  pkceMethod: 'S256' as const,
  checkLoginIframe: true,
  checkLoginIframeInterval: 5,
  silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
redirectUri: `${window.location.origin}/auth/callback`,

};

export default keycloak;
