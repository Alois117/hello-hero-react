import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { decodeToken, isTokenExpired } from '../utils/tokenUtils';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export const useAuthenticatedFetch = () => {
  const { token, isAuthenticated, logout } = useAuth(); 

  const authenticatedFetch = useCallback(
    async (url: string, options: FetchOptions = {}): Promise<Response> => {
      const { skipAuth = false, headers: customHeaders, ...restOptions } = options;
      const headers = new Headers(customHeaders);

      if (!skipAuth && isAuthenticated && token) {
        // Early validation: check if token is expired BEFORE sending request
        const decoded = decodeToken(token);
        if (decoded && isTokenExpired(decoded)) {
          console.warn(`[useAuthenticatedFetch] Token expired for ${url} → forcing logout`);
          
          // Aggressive: immediately logout (hits Keycloak /logout + clears session)
          logout(); 

          // Throw error so caller can handle (optional: you can also return early)
          throw new Error('Token expired - authentication required. Redirecting to login...');
        }

        headers.set('Authorization', `Bearer ${token}`);
      }

      return fetch(url, {
        ...restOptions,
        headers,
      });
    },
    [token, isAuthenticated, logout] 
  );

  return {
    authenticatedFetch,
    isAuthenticated,
    token,
  };
};

export default useAuthenticatedFetch;