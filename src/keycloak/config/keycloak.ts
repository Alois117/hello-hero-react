import Keycloak from 'keycloak-js';
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from '@/config/env';

const keycloakConfig = {
  url: KEYCLOAK_URL,
  realm: KEYCLOAK_REALM,
  clientId: KEYCLOAK_CLIENT_ID,
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
