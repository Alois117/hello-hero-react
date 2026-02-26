/**
 * useAuditLog — Hook for components to emit audit events.
 * 
 * Wraps the singleton logger with convenience methods and
 * automatically attaches section context.
 */

import { useCallback, useRef } from 'react';
import { logAuditEvent } from '@/audit-logs/logger';
import { AUDIT_EVENTS } from '@/audit-logs/constants';
import type { AuditEventDetails } from '@/audit-logs/types';

type PartialDetails = Partial<Omit<AuditEventDetails, 'action' | 'dashboard' | 'route' | 'session_id' | 'environment'>>;

interface UseAuditLogOptions {
  /** Default section name attached to every event from this hook instance */
  section?: string;
}

export const useAuditLog = (options?: UseAuditLogOptions) => {
  const sectionRef = useRef(options?.section);
  sectionRef.current = options?.section;

  const log = useCallback((action: string, details?: PartialDetails) => {
    logAuditEvent(action, {
      section: sectionRef.current,
      ...details,
    });
  }, []);

  // Convenience methods for common patterns

  const logPageView = useCallback((section: string, meta?: Record<string, unknown>) => {
    log(AUDIT_EVENTS.PAGE_VIEW, { section, meta });
  }, [log]);

  const logTabChange = useCallback((tabName: string) => {
    log(AUDIT_EVENTS.TAB_CHANGE, { meta: { tab: tabName } });
  }, [log]);

  const logDrawerOpen = useCallback((drawerName: string, entityId?: string) => {
    log(AUDIT_EVENTS.DRAWER_OPEN, { section: drawerName, entity_id: entityId });
  }, [log]);

  const logDrawerClose = useCallback((drawerName: string) => {
    log(AUDIT_EVENTS.DRAWER_CLOSE, { section: drawerName });
  }, [log]);

  const logDialogOpen = useCallback((dialogName: string) => {
    log(AUDIT_EVENTS.DIALOG_OPEN, { section: dialogName });
  }, [log]);

  const logSearch = useCallback((query: string, section?: string) => {
    log(AUDIT_EVENTS.SEARCH, { query: query.slice(0, 100), section });
  }, [log]);

  const logFilter = useCallback((filterDetails: Record<string, unknown>) => {
    log(AUDIT_EVENTS.FILTER_APPLY, { meta: filterDetails });
  }, [log]);

  const logPagination = useCallback((page: number, section?: string) => {
    log(AUDIT_EVENTS.PAGINATION, { section, meta: { page } });
  }, [log]);

  const logCrud = useCallback((
    action: string,
    entityType: string,
    entityId?: string,
    result?: 'success' | 'failure',
    extra?: Record<string, unknown>
  ) => {
    log(action, {
      entity_type: entityType,
      entity_id: entityId,
      result,
      meta: extra,
    });
  }, [log]);

  const logError = useCallback((error: string, section?: string, meta?: Record<string, unknown>) => {
    log(AUDIT_EVENTS.API_ERROR, { error: error.slice(0, 200), section, meta });
  }, [log]);

  const logDownload = useCallback((
    fileName: string,
    fileType?: string,
    entityId?: string,
    result?: 'success' | 'failure'
  ) => {
    log(AUDIT_EVENTS.REPORT_DOWNLOAD, {
      entity_type: 'report',
      entity_id: entityId,
      result: result || 'success',
      meta: { fileName, fileType },
    });
  }, [log]);

  return {
    log,
    logPageView,
    logTabChange,
    logDrawerOpen,
    logDrawerClose,
    logDialogOpen,
    logSearch,
    logFilter,
    logPagination,
    logCrud,
    logError,
    logDownload,
  };
};

export default useAuditLog;
