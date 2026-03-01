/**
 * AuditProvider
 * 
 * React component that:
 * 1. Initializes the audit logger on mount
 * 2. Syncs authenticated user context into the logger singleton
 * 3. Provides a network status logger
 * 
 * Safe to use outside OrganizationProvider (will use clientId=0 if unavailable).
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
      const clientIdRaw = orgCtx?.organization?.clientId;
      const clientId = clientIdRaw ? parseInt(String(clientIdRaw), 10) || 0 : 0;

      const ctx: AuditUserContext = {
        userId: decodedToken.sub,
        username,
        clientId,
        appRole: appRole || 'unknown',
        sessionId: getSessionId(),
      };
      setAuditUserContext(ctx);
    } else {
      setAuditUserContext(null);
    }
  }, [isAuthenticated, decodedToken?.sub, username, appRole, orgCtx?.organization?.clientId]);

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
