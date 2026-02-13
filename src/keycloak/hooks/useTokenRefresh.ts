import { useEffect, useRef, useCallback } from 'react';
import type Keycloak from 'keycloak-js';
interface UseTokenRefreshOptions {
  keycloak: Keycloak;
  initialized: boolean;
  onForceLogout: (reason: string) => void;
  refreshIntervalSeconds?: number;
  minValiditySeconds?: number;
}

export const useTokenRefresh = ({
  keycloak,
  initialized,
  onForceLogout,
  refreshIntervalSeconds = 30,
  minValiditySeconds = 45, // ← more proactive refreshes
}: UseTokenRefreshOptions): void => {
  const refreshInProgressRef = useRef(false);
  const consecutiveFailuresRef = useRef(0);
  const MAX_CONSECUTIVE_FAILURES = 3;

  const getUserInfo = useCallback(() => ({
    userId: keycloak.tokenParsed?.sub,
    username: keycloak.tokenParsed?.preferred_username as string | undefined,
    email: keycloak.tokenParsed?.email as string | undefined,
  }), [keycloak.tokenParsed]);

  const performTokenRefresh = useCallback(async () => {
    if (!keycloak.authenticated || refreshInProgressRef.current) {
      return;
    }

    refreshInProgressRef.current = true;

    try {
      const refreshed = await keycloak.updateToken(minValiditySeconds);

      if (refreshed) {
        consecutiveFailuresRef.current = 0;
        console.log('[TokenRefresh] Success → token refreshed');
      }
    } catch (error: any) {
      consecutiveFailuresRef.current++;

      const errorMessage = error?.message || String(error);
      const errorDetails = {
        name: error?.name,
        message: errorMessage,
        stack: error?.stack,
        fullError: JSON.stringify(error, (k, v) => (typeof v === 'object' && v !== null ? '[Object]' : v), 2),
        timestamp: new Date().toISOString(),
      };

      console.error('[TokenRefresh CRITICAL] Refresh failed at ' + errorDetails.timestamp);
      console.error('[TokenRefresh] Error details:', errorDetails);
      console.error('[TokenRefresh] Raw error:', error);

      // Small improvement: if it's a transient network error, we could retry once
      if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
        console.warn('[TokenRefresh] MAX failures reached → forcing logout');
        onForceLogout('Session expired or revoked. Please log in again.');
      }
    } finally {
      refreshInProgressRef.current = false;
    }
  }, [keycloak, minValiditySeconds, onForceLogout]);

  useEffect(() => {
    if (!initialized || !keycloak.authenticated) return;

    consecutiveFailuresRef.current = 0;
    performTokenRefresh();

    const intervalId = setInterval(performTokenRefresh, refreshIntervalSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [initialized, keycloak.authenticated, performTokenRefresh, refreshIntervalSeconds]);

  useEffect(() => {
    if (!initialized) return;

    const handleTokenExpired = () => {
      performTokenRefresh();
    };

    const handleAuthLogout = () => {
      console.log('[TokenRefresh] Keycloak session ended');
    };

    keycloak.onTokenExpired = handleTokenExpired;
    keycloak.onAuthLogout = handleAuthLogout;

    return () => {
      keycloak.onTokenExpired = undefined;
      keycloak.onAuthLogout = undefined;
    };
  }, [initialized, keycloak, performTokenRefresh]);
};

export default useTokenRefresh;