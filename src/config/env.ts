/**
 * Central Environment Configuration
 * Single source of truth for all endpoints and environment variables.
 * All URLs/endpoints must be referenced through this module.
 *
 * Every endpoint has its own VITE_ env variable in the root .env file.
 */

// ─── Keycloak / Auth ────────────────────────────────────────────────────────
export const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';
export const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'Jarvis';
export const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'react-frontend';

/** Fully qualified OIDC userinfo endpoint */
export const KEYCLOAK_USERINFO_URL =
  import.meta.env.VITE_KEYCLOAK_USERINFO_URL ||
  `${KEYCLOAK_URL.replace(/\/$/, '')}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;

// ─── Backend / API ──────────────────────────────────────────────────────────
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "/api";

// ─── Keycloak Admin API (Deno handler for org/user management) ──────────────
export const KEYCLOAK_ADMIN_API_URL =
  import.meta.env.VITE_KEYCLOAK_ADMIN_API_URL || `${BACKEND_URL}/keycloak`;


// ─── Webhook Base URL (optional convenience; each endpoint also has its own var) ─
export const WEBHOOK_BASE_URL = import.meta.env.VITE_WEBHOOK_BASE_URL || 'http://localhost:5678';

// ─── Webhook Endpoints (each backed by its own env variable) ────────────────
export const WEBHOOK_ALERTS_URL =
  import.meta.env.VITE_WEBHOOK_ALERTS_URL || `${WEBHOOK_BASE_URL}/webhook/ai/insights`;

export const WEBHOOK_AI_INSIGHTS_URL =
  import.meta.env.VITE_WEBHOOK_AI_INSIGHTS_URL || `${WEBHOOK_BASE_URL}/webhook/agent-insights`;

export const WEBHOOK_REPORTS_URL =
  import.meta.env.VITE_WEBHOOK_REPORTS_URL || `${WEBHOOK_BASE_URL}/webhook/reports`;

export const WEBHOOK_ZABBIX_HOSTS_URL =
  import.meta.env.VITE_WEBHOOK_ZABBIX_HOSTS_URL || `${WEBHOOK_BASE_URL}/webhook/zabbix-hosts`;

export const WEBHOOK_HOST_DETAILS_URL =
  import.meta.env.VITE_WEBHOOK_HOST_DETAILS_URL || `${WEBHOOK_BASE_URL}/webhook/zabbix/host-details`;

export const WEBHOOK_VEEAM_ALARMS_URL =
  import.meta.env.VITE_WEBHOOK_VEEAM_ALARMS_URL || `${WEBHOOK_BASE_URL}/webhook/alarms`;

export const WEBHOOK_VEEAM_VMS_URL =
  import.meta.env.VITE_WEBHOOK_VEEAM_VMS_URL || `${WEBHOOK_BASE_URL}/webhook/veeamone_vms`;

export const WEBHOOK_BACKUP_REPLICATION_URL =
  import.meta.env.VITE_WEBHOOK_BACKUP_REPLICATION_URL || `${WEBHOOK_BASE_URL}/webhook/backupandreplication`;

export const WEBHOOK_JARVIS_ASSISTANT_URL =
  import.meta.env.VITE_WEBHOOK_JARVIS_ASSISTANT_URL || `${WEBHOOK_BASE_URL}/webhook/Jarvis-AI-Assistant`;

// ─── Frontend Audit Logs ────────────────────────────────────────────────────
export const WEBHOOK_AUDIT_LOGS_URL =
  import.meta.env.VITE_WEBHOOK_AUDIT_LOGS_URL || `${WEBHOOK_BASE_URL}/webhook/avis-portal-ingest-logs`;


// ─── System Logs (Keycloak Audit Events) ────────────────────────────────────
/** User events (LOGIN, UPDATE_PROFILE, LOGIN_ERROR, etc.) */
export const KEYCLOAK_EVENTS_URL =
  import.meta.env.VITE_KEYCLOAK_EVENTS_URL ||
  `${KEYCLOAK_URL.replace(/\/$/, '')}/admin/realms/${KEYCLOAK_REALM}/events`;

/** Admin events (user create/update/delete, role changes, realm config, etc.) */
export const KEYCLOAK_ADMIN_EVENTS_URL =
  import.meta.env.VITE_KEYCLOAK_ADMIN_EVENTS_URL ||
  `${KEYCLOAK_URL.replace(/\/$/, '')}/admin/realms/${KEYCLOAK_REALM}/admin-events`;


