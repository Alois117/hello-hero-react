/**
 * Super Admin Organizations - Type Definitions
 * Updated for Keycloak Organizations API
 */

export interface Organization {
  /** Keycloak Organization UUID */
  id: string;
  /** Webhook correlation ID (from Keycloak org attributes.client_id) */
  clientId: number;
  name: string;
  /** Derived from Keycloak `enabled` field */
  status: "active" | "inactive";
  /** Direct Keycloak field */
  enabled: boolean;
  description?: string;
  alias?: string;
  domains?: Array<{ name: string; verified: boolean }>;
  createdAt: Date;
  updatedAt: Date;
  // Aggregated counts (computed per-org from webhook metrics)
  userCount: number;
  activeAlerts: number;
  hostsCount: number;
  reportsCount: number;
  insightsCount: number;
}

/** @deprecated Use KeycloakOrganization from hooks/keycloak instead */
export interface OrganizationRaw {
  client_id: number;
  client_name: string;
  status?: string | number;
  created_at?: string;
  updated_at?: string;
  user_count?: number;
  active_alerts?: number;
  hosts_count?: number;
  reports_count?: number;
  insights_count?: number;
}

export interface OrganizationCounts {
  total: number;
  active: number;
  inactive: number;
  totalUsers: number;
  totalAlerts: number;
}

export interface OrganizationFilters {
  searchQuery: string;
  statusFilter: "all" | "active" | "inactive";
  hasActiveAlerts: boolean | null;
  createdDateFrom: Date | null;
  createdDateTo: Date | null;
}

export interface OrganizationDetailMetrics {
  users: {
    total: number;
    loading: boolean;
  };
  alerts: {
    total: number;
    active: number;
    critical: number;
    loading: boolean;
  };
  hosts: {
    total: number;
    enabled: number;
    disabled: number;
    loading: boolean;
  };
  reports: {
    total: number;
    daily: number;
    weekly: number;
    monthly: number;
    loading: boolean;
  };
  insights: {
    total: number;
    predictions: number;
    anomalies: number;
    loading: boolean;
  };
  veeam: {
    jobs: number;
    success: number;
    failed: number;
    loading: boolean;
  };
}

export type OrganizationSortField = "name" | "userCount" | "activeAlerts" | "createdAt";
export type SortDirection = "asc" | "desc";
