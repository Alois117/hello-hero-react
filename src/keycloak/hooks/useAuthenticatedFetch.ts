import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { decodeToken, isTokenExpired } from '../utils/tokenUtils';
import keycloak from '../config/keycloak';   // ← important: direct import

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export const useAuthenticatedFetch = () => {
  const { isAuthenticated, logout } = useAuth();   // we no longer need token from context

  const authenticatedFetch = useCallback(
    async (url: string, options: FetchOptions = {}): Promise<Response> => {
      const { skipAuth = false, headers: customHeaders, ...restOptions } = options;
      const headers = new Headers(customHeaders);

      if (!skipAuth && isAuthenticated) {
        // ALWAYS use the LIVE token from Keycloak instance
        let currentToken = keycloak.token;

        // Check expiry using the actual current token
        const decoded = decodeToken(currentToken || '');
        const isNearExpiry = decoded && isTokenExpired(decoded, 30); // 30s safety margin

        if (isNearExpiry) {
          console.log(`[useAuthenticatedFetch] Token near expiry for ${url} → refreshing...`);

          try {
            const refreshed = await keycloak.updateToken(30);

            if (refreshed) {
              console.log(`[useAuthenticatedFetch] Refresh successful for ${url}`);
              currentToken = keycloak.token!;
            }
          } catch (err: any) {
            console.error(`[useAuthenticatedFetch] Refresh FAILED for ${url}:`, err);
            logout();
            throw new Error('Token refresh failed');
          }
        }

        // Use the (possibly refreshed) token
        if (currentToken) {
          headers.set('Authorization', `Bearer ${currentToken}`);
        }
      }

      const response = await fetch(url, {
        ...restOptions,
        headers,
      });

      // Extra safety: backend 401 → logout
      if (response.status === 401) {
        console.warn(`[useAuthenticatedFetch] 401 from backend → logging out`);
        logout();
        throw new Error('Unauthorized');
      }

      return response;
    },
    [isAuthenticated, logout]
  );

  return { authenticatedFetch, isAuthenticated };
};

export default useAuthenticatedFetch;