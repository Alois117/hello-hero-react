/**
 * Organization Utilities for Multi-Tenant Enforcement
 * 
 * SECURITY CRITICAL: This module enforces strict tenant isolation.
 * 
 * Rules:
 * - user / org_admin: MUST have exactly ONE organization
 * - super_admin: Organization restriction bypassed
 * - 0 or >1 orgs for non-super_admin → ACCESS BLOCKED
 */

import type { DecodedToken } from './tokenUtils';
import type { AppRole } from '../context/AuthContext';

/**
 * Parsed organization structure from JWT token
 */
export interface ParsedOrganization {
  /** UUID - authoritative org identifier */
  id: string;
  /** Human-friendly organization name */
  displayName: string;
  /** Internal client identifier */
  clientId: string;
  /** Original key from token (e.g., "Maxider_Limited") */
  orgKey: string;
}

/**
 * Organization validation result
 */
export interface OrganizationValidationResult {
  isValid: boolean;
  organization: ParsedOrganization | null;
  organizationCount: number;
  errorMessage: string | null;
}

/**
 * Token organization claim structure from Keycloak
 */
interface OrganizationClaim {
  client_name?: string[];
  client_id?: string[];
  id?: string;
}

/**
 * Extracts organization data from the JWT token.
 * 
 * Checks claims in order:
 * 1. organization (primary)
 * 2. Avis-Sentramind (fallback)
 * 3. Organization_Membership_Token (fallback)
 * 
 * @param decoded - Decoded JWT token
 * @returns Array of parsed organizations
 */
export const extractOrganizationsFromToken = (
  decoded: DecodedToken | null
): ParsedOrganization[] => {
  if (!decoded) return [];

  // Check primary and fallback claims
  const decodedAny = decoded as unknown as Record<string, unknown>;
  const orgClaimSources = [
    decoded.organization,
    decodedAny['Avis-Sentramind'],
    decodedAny['Organization_Membership_Token'],
  ];

  for (const claimSource of orgClaimSources) {
    if (claimSource && typeof claimSource === 'object' && !Array.isArray(claimSource)) {
      const orgs = parseOrganizationClaim(claimSource as Record<string, OrganizationClaim>);
      if (orgs.length > 0) {
        return orgs;
      }
    }
  }

  return [];
};

/**
 * Parses the organization claim object into structured data.
 * 
 * Token structure example:
 * {
 *   "Maxider_Limited": {
 *     "client_name": ["Maxider Office"],
 *     "client_id": ["1"],
 *     "id": "5bbb0b37-31c4-4e0d-acc5-46be0c152047"
 *   }
 * }
 */
const parseOrganizationClaim = (
  orgObject: Record<string, OrganizationClaim>
): ParsedOrganization[] => {
  const organizations: ParsedOrganization[] = [];

  for (const [orgKey, orgData] of Object.entries(orgObject)) {
    // Skip if orgData is not an object or is missing required fields
    if (!orgData || typeof orgData !== 'object') continue;

    const id = orgData.id;
    const clientName = orgData.client_name?.[0];
    const clientId = orgData.client_id?.[0];

    // Require at minimum an ID
    if (!id || typeof id !== 'string') continue;

    organizations.push({
      id,
      displayName: clientName || orgKey.replace(/_/g, ' '),
      clientId: clientId || '',
      orgKey,
    });
  }

  return organizations;
};

/**
 * Validates organization membership based on role.
 * 
 * SECURITY RULES:
 * - super_admin: No org validation required (bypassed)
 * - user / org_admin: MUST have exactly ONE organization
 * 
 * @param decoded - Decoded JWT token
 * @param role - User's application role
 * @returns Validation result with organization if valid
 */
export const validateOrganizationMembership = (
  decoded: DecodedToken | null,
  role: AppRole
): OrganizationValidationResult => {
  // Super admin bypasses org restrictions
  if (role === 'super_admin') {
    return {
      isValid: true,
      organization: null,
      organizationCount: 0,
      errorMessage: null,
    };
  }

  const organizations = extractOrganizationsFromToken(decoded);
  const orgCount = organizations.length;

  // FAIL CLOSED: No organization
  if (orgCount === 0) {
    return {
      isValid: false,
      organization: null,
      organizationCount: 0,
      errorMessage: 'No organization membership found. Access denied.',
    };
  }

  // FAIL CLOSED: Multiple organizations (not allowed for user/org_admin)
  if (orgCount > 1) {
    return {
      isValid: false,
      organization: null,
      organizationCount: orgCount,
      errorMessage: `Multiple organizations detected (${orgCount}). Users must belong to exactly one organization.`,
    };
  }

  // Valid: Exactly one organization
  return {
    isValid: true,
    organization: organizations[0],
    organizationCount: 1,
    errorMessage: null,
  };
};

/**
 * Gets the organization ID to be used in API requests.
 * 
 * @param organization - Parsed organization (null for super_admin)
 * @param role - User's application role
 * @returns Organization ID or null for super_admin
 */
export const getOrganizationIdForRequests = (
  organization: ParsedOrganization | null,
  role: AppRole
): string | null => {
  // Super admin doesn't send X-Organization-Id
  if (role === 'super_admin') {
    return null;
  }

  return organization?.id || null;
};
