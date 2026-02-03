/**
 * Authentication Audit Logger
 * 
 * Provides centralized audit logging for authentication events.
 * Ready for future integration with Super Admin Dashboard and backend persistence.
 */

export type AuthAuditEventType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'TOKEN_REFRESH'
  | 'TOKEN_REFRESH_FAILED'
  | 'FORCE_LOGOUT'
  | 'LOGIN_DENIED'
  | 'SESSION_VALIDATED'
  | 'IDLE_TIMEOUT'
  | 'USER_DISABLED';

export interface AuthAuditEntry {
  timestamp: string; // ISO 8601 UTC
  eventType: AuthAuditEventType;
  userId?: string;
  username?: string;
  email?: string;
  ipAddress?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

// In-memory audit log buffer (for future dashboard integration)
const auditLogBuffer: AuthAuditEntry[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Get client IP address (best effort - actual IP should come from backend)
 */
const getClientInfo = (): string => {
  // In browser context, we can't reliably get IP
  // This is a placeholder for when backend integration is added
  return 'client-side';
};

/**
 * Log an authentication audit event
 */
export const logAuthAuditEvent = (
  eventType: AuthAuditEventType,
  options: {
    userId?: string;
    username?: string;
    email?: string;
    reason?: string;
    metadata?: Record<string, unknown>;
  } = {}
): void => {
  const entry: AuthAuditEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    userId: options.userId,
    username: options.username,
    email: options.email,
    ipAddress: getClientInfo(),
    reason: options.reason,
    metadata: options.metadata,
  };

  // Add to buffer (circular buffer behavior)
  auditLogBuffer.push(entry);
  if (auditLogBuffer.length > MAX_BUFFER_SIZE) {
    auditLogBuffer.shift();
  }

  // Console output for development/debugging (production would send to backend)
  if (import.meta.env.DEV) {
    const logStyle = getLogStyle(eventType);
    console.log(
      `%c[Auth Audit] ${eventType}`,
      logStyle,
      {
        user: options.username || options.email || options.userId || 'unknown',
        reason: options.reason || 'N/A',
        timestamp: entry.timestamp,
        ...(options.metadata || {}),
      }
    );
  }
};

/**
 * Get console log styling based on event type
 */
const getLogStyle = (eventType: AuthAuditEventType): string => {
  switch (eventType) {
    case 'LOGIN':
      return 'color: #22c55e; font-weight: bold;';
    case 'LOGOUT':
    case 'IDLE_TIMEOUT':
      return 'color: #f59e0b; font-weight: bold;';
    case 'TOKEN_REFRESH':
    case 'SESSION_VALIDATED':
      return 'color: #3b82f6; font-weight: bold;';
    case 'FORCE_LOGOUT':
    case 'LOGIN_DENIED':
    case 'USER_DISABLED':
    case 'TOKEN_REFRESH_FAILED':
      return 'color: #ef4444; font-weight: bold;';
    default:
      return 'color: #6b7280; font-weight: bold;';
  }
};

/**
 * Get recent audit log entries (for dashboard integration)
 */
export const getRecentAuditLogs = (limit: number = 50): AuthAuditEntry[] => {
  return auditLogBuffer.slice(-limit);
};

/**
 * Clear audit log buffer
 */
export const clearAuditLogBuffer = (): void => {
  auditLogBuffer.length = 0;
};

/**
 * Export audit logs as JSON (for compliance/download)
 */
export const exportAuditLogs = (): string => {
  return JSON.stringify(auditLogBuffer, null, 2);
};
