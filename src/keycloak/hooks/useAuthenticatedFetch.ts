import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export const useAuthenticatedFetch = () => {
  const { token, isAuthenticated } = useAuth();

  const authenticatedFetch = useCallback(
    async (url: string, options: FetchOptions = {}): Promise<Response> => {
      const { skipAuth = false, headers: customHeaders, ...restOptions } = options;

      const headers = new Headers(customHeaders);

      // Attach Authorization header if authenticated and not skipped
      if (!skipAuth && isAuthenticated && token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return fetch(url, {
        ...restOptions,
        headers,
      });
    },
    [token, isAuthenticated]
  );

  return { authenticatedFetch };
};

export default useAuthenticatedFetch;
