import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak, { keycloakInitOptions, REFRESH_TOKEN_MIN_VALIDITY, AUTH_REDIRECT_URI } from './keycloak';
import { ReactNode, useCallback } from 'react';
import type { AuthClientEvent, AuthClientError } from '@react-keycloak/core';

interface KeycloakProviderProps {
  children: ReactNode;
}

const KeycloakProvider = ({ children }: KeycloakProviderProps) => {
  // Handle Keycloak events
  const onEvent = useCallback((event: AuthClientEvent, error?: AuthClientError) => {
    console.log('[Keycloak Event]:', event);
    
    if (error) {
      console.error('[Keycloak Error]:', error);
    }

    switch (event) {
      case 'onAuthSuccess':
        console.log('[Keycloak] Authentication successful');
        // Log the received token for debugging
        if (keycloak.token) {
          console.log('[Keycloak] Access Token:', keycloak.token);
          console.log('[Keycloak] Token Parsed:', keycloak.tokenParsed);
          console.log('[Keycloak] ID Token Parsed:', keycloak.idTokenParsed);
        }
        break;
      case 'onAuthError':
        console.error('[Keycloak] Authentication error');
        break;
      case 'onAuthRefreshSuccess':
        console.log('[Keycloak] Token refresh successful');
        break;
      case 'onAuthRefreshError':
        console.error('[Keycloak] Token refresh failed - redirecting to login');
        keycloak.login({ redirectUri: AUTH_REDIRECT_URI });
        break;
      case 'onTokenExpired':
        console.log('[Keycloak] Token expired - attempting refresh');
        keycloak.updateToken(REFRESH_TOKEN_MIN_VALIDITY).catch(() => {
          console.error('[Keycloak] Failed to refresh token - redirecting to login');
          keycloak.login({ redirectUri: AUTH_REDIRECT_URI });
        });
        break;
      case 'onAuthLogout':
        console.log('[Keycloak] User logged out');
        break;
    }
  }, []);

  // Handle token changes
  const onTokens = useCallback((tokens: { token?: string; idToken?: string; refreshToken?: string }) => {
    if (tokens.token) {
      console.log('[Keycloak] Token received/updated');
      // Store token in memory for API calls (more secure than localStorage)
      sessionStorage.setItem('kc_token', tokens.token);
    }
    if (tokens.idToken) {
      console.log('[Keycloak] ID Token received/updated');
    }
  }, []);

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={keycloakInitOptions}
      onEvent={onEvent}
      onTokens={onTokens}
      LoadingComponent={<KeycloakLoadingScreen />}
    >
      {children}
    </ReactKeycloakProvider>
  );
};

// Loading screen while Keycloak initializes
const KeycloakLoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
      <p className="text-muted-foreground">Initializing authentication...</p>
    </div>
  </div>
);

export default KeycloakProvider;
