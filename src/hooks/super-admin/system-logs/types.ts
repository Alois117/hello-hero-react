/**
 * System Logs types — unified model for Keycloak user events + admin events.
 */

export type LogSeverity = 'high' | 'medium' | 'low';
export type LogSource = 'USER_EVENT' | 'ADMIN_EVENT';

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  event: string;
  user: string;
  ipAddress: string;
  severity: LogSeverity;
  source: LogSource;
  details: Record<string, unknown> | null;
}

export interface SystemLogsSummary {
  totalEvents: number;
  successfulLogins: number;
  failedAttempts: number;
  securityAlerts: number;
  updatedAt: string;
}

export interface SystemLogsFilters {
  search: string;
  severity: LogSeverity | '';
  source: LogSource | '';
  timeRange: string; // '1h' | '24h' | '7d' | '30d' | 'custom' | ''
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

export interface SystemLogsPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
