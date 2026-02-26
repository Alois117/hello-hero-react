/**
 * Audit Log Types
 * 
 * Defines the payload shape, event metadata, and queue entry structure
 * for the frontend audit logging pipeline.
 */

/** Exact payload shape expected by the webhook / database */
export interface AuditLogPayload {
  client_id: number;
  user_id: string;
  username: string;
  details: AuditEventDetails;
  timestamp: string; // ISO 8601
}

/** The `details` JSON object — enough to reconstruct "what happened" */
export interface AuditEventDetails {
  /** Canonical event name from taxonomy (e.g. USER_CREATE, NAVIGATE_SECTION) */
  action: string;
  /** Which dashboard the user is in */
  dashboard: 'user' | 'org_admin' | 'super_admin' | 'public' | 'unknown';
  /** Current route path */
  route: string;
  /** UI component / section identifier */
  section?: string;
  /** Entity type (org, user, alert, report, host, etc.) */
  entity_type?: string;
  /** Entity ID(s) affected */
  entity_id?: string | string[];
  /** Result of the action */
  result?: 'success' | 'failure' | 'pending' | 'cancelled';
  /** Sanitized error message / code */
  error?: string;
  /** Correlation / session id */
  session_id?: string;
  /** App metadata */
  app_version?: string;
  environment?: string;
  /** Navigation-specific: source route */
  from_route?: string;
  /** Navigation-specific: method (menu, link, breadcrumb, programmatic) */
  nav_method?: string;
  /** Search / filter context */
  query?: string;
  /** Changed fields list (for edits) */
  changed_fields?: string[];
  /** Extra context (counts, summaries, file metadata) */
  meta?: Record<string, unknown>;
}

/** Internal queue entry with retry metadata */
export interface AuditQueueEntry {
  id: string;
  payload: AuditLogPayload;
  attempts: number;
  createdAt: number;
}

/** User context supplied by the React provider */
export interface AuditUserContext {
  userId: string;
  username: string;
  clientId: number;
  appRole: 'user' | 'org_admin' | 'super_admin' | 'unknown';
  sessionId: string;
}
