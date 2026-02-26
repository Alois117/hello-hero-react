/**
 * Audit Event Taxonomy
 * 
 * Canonical event names used across the portal. Extend as needed.
 */

export const AUDIT_EVENTS = {
  // ─── Navigation ───
  NAVIGATE_SECTION: 'NAVIGATE_SECTION',
  DASHBOARD_SWITCH: 'DASHBOARD_SWITCH',
  TAB_CHANGE: 'TAB_CHANGE',
  DRAWER_OPEN: 'DRAWER_OPEN',
  DRAWER_CLOSE: 'DRAWER_CLOSE',
  DIALOG_OPEN: 'DIALOG_OPEN',
  DIALOG_CLOSE: 'DIALOG_CLOSE',

  // ─── Alerts ───
  ALERT_TABLE_VIEW: 'ALERT_TABLE_VIEW',
  ALERT_OPEN: 'ALERT_OPEN',
  ALERT_ACKNOWLEDGE: 'ALERT_ACKNOWLEDGE',
  ALERT_ACKNOWLEDGE_ALL: 'ALERT_ACKNOWLEDGE_ALL',
  ALERT_RESOLVE: 'ALERT_RESOLVE',
  ALERT_FILTER: 'ALERT_FILTER',

  // ─── Reports ───
  REPORT_VIEW: 'REPORT_VIEW',
  REPORT_LIST_VIEW: 'REPORT_LIST_VIEW',
  REPORT_DOWNLOAD: 'REPORT_DOWNLOAD',
  REPORT_GENERATE: 'REPORT_GENERATE',
  REPORT_FILTER: 'REPORT_FILTER',

  // ─── Users ───
  USER_CREATE: 'USER_CREATE',
  USER_EDIT: 'USER_EDIT',
  USER_DISABLE: 'USER_DISABLE',
  USER_ENABLE: 'USER_ENABLE',
  USER_DELETE: 'USER_DELETE',

  // ─── Organizations ───
  ORG_CREATE: 'ORG_CREATE',
  ORG_EDIT: 'ORG_EDIT',
  ORG_DISABLE: 'ORG_DISABLE',
  ORG_ENABLE: 'ORG_ENABLE',
  ORG_VIEW: 'ORG_VIEW',

  // ─── Settings ───
  SETTINGS_CHANGE: 'SETTINGS_CHANGE',
  PROFILE_UPDATE: 'PROFILE_UPDATE',

  // ─── Search / Filter ───
  SEARCH: 'SEARCH',
  FILTER_APPLY: 'FILTER_APPLY',
  PAGINATION: 'PAGINATION',
  SORT: 'SORT',

  // ─── Export / Import ───
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',

  // ─── Hosts / Veeam / Zabbix ───
  HOST_VIEW: 'HOST_VIEW',
  HOST_DETAIL_OPEN: 'HOST_DETAIL_OPEN',
  VEEAM_VIEW: 'VEEAM_VIEW',
  VEEAM_DETAIL_OPEN: 'VEEAM_DETAIL_OPEN',
  ZABBIX_VIEW: 'ZABBIX_VIEW',

  // ─── AI ───
  AI_INSIGHT_VIEW: 'AI_INSIGHT_VIEW',
  AI_CHAT_OPEN: 'AI_CHAT_OPEN',
  AI_CHAT_MESSAGE: 'AI_CHAT_MESSAGE',

  // ─── Errors ───
  API_ERROR: 'API_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  NETWORK_STATUS_CHANGE: 'NETWORK_STATUS_CHANGE',

  // ─── Misc ───
  PAGE_VIEW: 'PAGE_VIEW',
  BULK_ACTION: 'BULK_ACTION',
  COMMAND_PALETTE_OPEN: 'COMMAND_PALETTE_OPEN',
  THEME_TOGGLE: 'THEME_TOGGLE',
  AUDIT_TOGGLE: 'AUDIT_TOGGLE',
} as const;

export type AuditEventName = typeof AUDIT_EVENTS[keyof typeof AUDIT_EVENTS];

/** localStorage key for the queue persistence */
export const AUDIT_QUEUE_STORAGE_KEY = 'avis_audit_queue';

/** localStorage key for the enabled toggle */
export const AUDIT_ENABLED_STORAGE_KEY = 'avis_audit_enabled';

/** Max items to persist in localStorage */
export const AUDIT_QUEUE_MAX_PERSISTED = 100;

/** Max retry attempts per event */
export const AUDIT_MAX_RETRIES = 3;

/** Base backoff in ms */
export const AUDIT_RETRY_BACKOFF_MS = 2000;

/** Flush interval in ms */
export const AUDIT_FLUSH_INTERVAL_MS = 5000;

/** Request timeout in ms */
export const AUDIT_REQUEST_TIMEOUT_MS = 8000;
