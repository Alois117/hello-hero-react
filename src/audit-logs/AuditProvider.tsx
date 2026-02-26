/**
 * AuditProvider
 *
 * React component that:
 * 1. Initializes the audit logger on mount
 * 2. Syncs authenticated user context into the logger singleton
 * 3. Provides a network status logger
 *
 * NOTE:
 * - Do NOT force clientId=0. If clientId is not available yet, keep it undefined.
 * - The logger will queue events and only send once clientId becomes a valid positive integer.
 */

import { useEffect, useRef, useContext } from 'react';
import { useAuth } from '@/keycloak/context/AuthContext';
import OrganizationContext from '@/keycloak/context/OrganizationContext';
import {
  initAuditLogger,
  destroyAuditLogger,
  setAuditUserContext,
  logAuditEvent,
} from './logger';
import { AUDIT_EVENTS } from './constants';
import type { AuditUserContext } from './types';

const getSessionId = (): string => {
  const KEY = 'avis_audit_session_id';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(KEY, id);
  }
  return id;
};

/**
 * Resolve clientId as a positive integer.
 *
 * Priority:
 * 1) OrganizationContext (if it provides a usable client id)
 * 2) decodedToken.organization.<orgKey>.client_id[0] (your JWT structure)
 * 3) decodedToken["Avis-Sentramind"].<orgKey>.client_id[0] (alternate claim found in your JWT)
 */
const resolveClientId = (
  decodedToken: any,
  orgCtx: any
): number | undefined => {
  const toPositiveInt = (value: unknown): number | undefined => {
    if (value === null || value === undefined) return undefined;

    // If token stores arrays like ["1"]
    const v = Array.isArray(value) ? value[0] : value;
    const n = Number(v);

    return Number.isInteger(n) && n > 0 ? n : undefined;
  };

  // 1) From OrganizationContext (try a few common keys)
  const fromCtx =
    orgCtx?.organization?.clientId ??
    orgCtx?.organization?.client_id ??
    orgCtx?.organization?.clientID ??
    orgCtx?.organization?.id; // only if your app uses org.id as client id (rare)

  const ctxInt = toPositiveInt(fromCtx);
  if (ctxInt) return ctxInt;

  // Helper to pick org key:
  const pickOrgKey = (obj: any): string | undefined => {
    if (!obj || typeof obj !== 'object') return undefined;
    const keys = Object.keys(obj);
    return keys.length ? keys[0] : undefined;
  };

  // 2) From decodedToken.organization
  const orgObj = decodedToken?.organization;
  if (orgObj && typeof orgObj === 'object') {
    const orgKey = pickOrgKey(orgObj);
    const tokenClientId = toPositiveInt(orgObj?.[orgKey as string]?.client_id);
    if (tokenClientId) return tokenClientId;
  }

  // 3) From decodedToken["Avis-Sentramind"]
  const avisObj = decodedToken?.['Avis-Sentramind'];
  if (avisObj && typeof avisObj === 'object') {
    const orgKey = pickOrgKey(avisObj);
    const tokenClientId = toPositiveInt(avisObj?.[orgKey as string]?.client_id);
    if (tokenClientId) return tokenClientId;
  }

  return undefined;
};

const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, decodedToken, username, appRole } = useAuth();
  // Safe access — may be null if outside OrganizationProvider
  const orgCtx = useContext(OrganizationContext);
  const prevOnline = useRef(navigator.onLine);

  useEffect(() => {
    initAuditLogger();
    return () => destroyAuditLogger();
  }, []);

  useEffect(() => {
    if (isAuthenticated && decodedToken?.sub) {
      const clientId = resolveClientId(decodedToken, orgCtx);

      const ctx: AuditUserContext = {
        userId: decodedToken.sub,
        username,
        // IMPORTANT: keep undefined if not available; do not force 0
        clientId,
        appRole: appRole || 'unknown',
        sessionId: getSessionId(),
      };

      setAuditUserContext(ctx);
    } else {
      setAuditUserContext(null);
    }
  }, [
    isAuthenticated,
    decodedToken?.sub,
    decodedToken, // ensure we recompute if decoded token changes
    username,
    appRole,
    orgCtx,
  ]);

  useEffect(() => {
    const handleOnline = () => {
      if (!prevOnline.current) {
        logAuditEvent(AUDIT_EVENTS.NETWORK_STATUS_CHANGE, { meta: { status: 'online' } });
      }
      prevOnline.current = true;
    };
    const handleOffline = () => {
      if (prevOnline.current) {
        logAuditEvent(AUDIT_EVENTS.NETWORK_STATUS_CHANGE, { meta: { status: 'offline' } });
      }
      prevOnline.current = false;
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return <>{children}</>;
};

export default AuditProvider;