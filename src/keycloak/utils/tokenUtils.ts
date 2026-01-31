import { jwtDecode, type JwtPayload } from "jwt-decode";

export interface DecodedToken extends JwtPayload {
  sub: string;
  email?: string;
  preferred_username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
  orgs?: string[] | Record<string, unknown>[];
  organization?: string[] | Record<string, unknown>[];
  // Optional: add any other custom claims you might use
}

/**
 * Safely decodes a JWT token string into DecodedToken.
 * Returns null if decoding fails (invalid format, malformed, etc.).
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Extracts all roles from both realm_access and resource_access (client-specific).
 * Deduplicates and returns an array of unique role strings.
 */
export const extractRoles = (decoded: DecodedToken | null, clientId: string): string[] => {
  if (!decoded) return [];

  const realmRoles = decoded.realm_access?.roles || [];
  const clientRoles = decoded.resource_access?.[clientId]?.roles || [];

  // Merge and remove duplicates
  return [...new Set([...realmRoles, ...clientRoles])];
};

/**
 * Extracts organization-related claims from the token.
 * Tries multiple possible claim names (orgs, organization) and returns array or empty.
 */
export const extractOrganizations = (
  decoded: DecodedToken | null
): (string | Record<string, unknown>)[] => {
  if (!decoded) return [];

  // Return whichever field exists, or empty array
  return (decoded.orgs || decoded.organization || []) as (string | Record<string, unknown>)[];
};

/**
 * Extracts the most appropriate username from the token claims.
 * Falls back in a sensible order.
 */
export const extractUsername = (decoded: DecodedToken | null): string => {
  if (!decoded) return 'Unknown User';

  return (
    decoded.preferred_username ||
    decoded.email ||
    decoded.name ||
    decoded.given_name ||
    decoded.sub ||
    'Unknown User'
  );
};

/**
 * Checks if the decoded token is expired (or near expiry).
 *
 * @param decoded - The decoded JWT payload
 * @param safetyMarginSeconds - Optional: how many seconds before actual expiry
 *                               to consider it "expired" (default: 60s)
 * @returns true if expired (or within safety margin), false otherwise
 */
export const isTokenExpired = (
  decoded: DecodedToken | null,
  safetyMarginSeconds: number = 60
): boolean => {
  if (!decoded || typeof decoded.exp !== 'number') {
    return true; // No exp claim → treat as expired/invalid
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const effectiveExpiry = decoded.exp - safetyMarginSeconds;

  return effectiveExpiry < currentTime;
};

/**
 * Optional helper: Returns the remaining seconds until token expiry.
 * Useful for countdown timers in UI or logging.
 *
 * @param decoded - Decoded token
 * @param safetyMarginSeconds - Same margin as isTokenExpired
 * @returns seconds remaining (can be negative if already expired)
 */
export const getTokenExpiryTime = (
  decoded: DecodedToken | null,
  safetyMarginSeconds: number = 60
): number => {
  if (!decoded || typeof decoded.exp !== 'number') {
    return -Infinity; // Treat as already expired
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp - currentTime - safetyMarginSeconds;
};