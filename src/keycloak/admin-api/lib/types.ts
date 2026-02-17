/**
 * Keycloak Admin REST API Types
 * Based on Keycloak 26 Organizations + Users API
 * https://www.keycloak.org/docs-api/latest/rest-api/index.html
 */

// ── Organization ────────────────────────────────────────────────────────────

export interface KeycloakOrganizationRepresentation {
  id?: string;
  name: string;
  alias?: string;
  enabled?: boolean;
  description?: string;
  attributes?: Record<string, string[]>;
  domains?: KeycloakOrganizationDomain[];
}

export interface KeycloakOrganizationDomain {
  name: string;
  verified?: boolean;
}

// ── User / Member ───────────────────────────────────────────────────────────

export interface KeycloakUserRepresentation {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  createdTimestamp?: number;
  attributes?: Record<string, string[]>;
  requiredActions?: string[];
  credentials?: KeycloakCredential[];
}

export interface KeycloakCredential {
  type: string;
  value: string;
  temporary?: boolean;
}

// ── Request payloads ────────────────────────────────────────────────────────

export interface CreateOrganizationPayload {
  name: string;
  description?: string;
  enabled?: boolean;
  domains?: KeycloakOrganizationDomain[];
  attributes?: Record<string, string[]>;
}

export interface UpdateOrganizationPayload {
  id: string;
  name?: string;
  description?: string;
  enabled?: boolean;
  alias?: string;
  attributes?: Record<string, string[]>;
}

export interface CreateUserPayload {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  enabled?: boolean;
  temporaryPassword?: string;
  requiredActions?: string[];
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  enabled?: boolean;
}
