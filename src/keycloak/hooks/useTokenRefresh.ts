import { useEffect, useRef, useCallback } from 'react';
import type Keycloak from 'keycloak-js';
import { logAuthAuditEvent } from '../audit/authAuditLogger';

interface UseTokenRefreshOptions {
  keycloak: Keycloak;
  initialized: boolean;
  onForceLogout: (reason: string) => void;
  refreshIntervalSeconds?: number;
  minValiditySeconds?: number;
}

/**
 * Hook to handle silent token refresh with proper error handling.
 * 
 * Key behaviors:
 * - Refreshes token when it's close to expiry (configurable threshold)
 * - Does NOT force logout on successful refresh
 * - Only forces logout when refresh definitively fails (session invalid)
 * - Logs all refresh events for audit
 */
export const useTokenRefresh = ({
  keycloak,
  initialized,
  onForceLogout,
  refreshIntervalSeconds = 30,
  minValiditySeconds = 60,
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
      // Check if token needs refresh (within minValiditySeconds of expiry)
      const refreshed = await keycloak.updateToken(minValiditySeconds);

      if (refreshed) {
        consecutiveFailuresRef.current = 0; // Reset failure counter
        logAuthAuditEvent('TOKEN_REFRESH', {
          ...getUserInfo(),
          reason: 'Token refreshed successfully',
          metadata: {
            tokenExp: keycloak.tokenParsed?.exp,
            refreshedAt: Date.now(),
          },
        });
      }
      // If not refreshed, token is still valid - no action needed

    } catch (error) {
      consecutiveFailuresRef.current++;
      
      const userInfo = getUserInfo();
      logAuthAuditEvent('TOKEN_REFRESH_FAILED', {
        ...userInfo,
        reason: `Token refresh failed (attempt ${consecutiveFailuresRef.current}/${MAX_CONSECUTIVE_FAILURES})`,
        metadata: { error: String(error) },
      });

      // Only force logout after multiple consecutive failures
      // This handles transient network issues gracefully
      if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
        logAuthAuditEvent('FORCE_LOGOUT', {
          ...userInfo,
          reason: 'Token refresh failed after maximum retries - session likely revoked or expired',
        });
        onForceLogout('Session expired or revoked. Please log in again.');
      }
    } finally {
      refreshInProgressRef.current = false;
    }
  }, [keycloak, minValiditySeconds, onForceLogout, getUserInfo]);

  useEffect(() => {
    if (!initialized || !keycloak.authenticated) {
      return;
    }

    // Reset failure counter on fresh authentication
    consecutiveFailuresRef.current = 0;

    // Perform initial refresh check
    performTokenRefresh();

    // Set up periodic refresh
    const intervalId = setInterval(performTokenRefresh, refreshIntervalSeconds * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [initialized, keycloak.authenticated, performTokenRefresh, refreshIntervalSeconds]);

  // Handle Keycloak events
  useEffect(() => {
    if (!initialized) return;

    const handleTokenExpired = () => {
      logAuthAuditEvent('TOKEN_REFRESH', {
        ...getUserInfo(),
        reason: 'Token expired event - attempting refresh',
      });
      performTokenRefresh();
    };

    const handleAuthLogout = () => {
      logAuthAuditEvent('LOGOUT', {
        ...getUserInfo(),
        reason: 'Keycloak session ended',
      });
    };

    // Keycloak JS adapter events
    keycloak.onTokenExpired = handleTokenExpired;
    keycloak.onAuthLogout = handleAuthLogout;

    return () => {
      keycloak.onTokenExpired = undefined;
      keycloak.onAuthLogout = undefined;
    };
  }, [initialized, keycloak, getUserInfo, performTokenRefresh]);
};

export default useTokenRefresh;
