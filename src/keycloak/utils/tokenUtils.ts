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
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const extractRoles = (decoded: DecodedToken | null, clientId: string): string[] => {
  if (!decoded) return [];

  const realmRoles = decoded.realm_access?.roles || [];
  const clientRoles = decoded.resource_access?.[clientId]?.roles || [];

  // Merge and deduplicate roles
  return [...new Set([...realmRoles, ...clientRoles])];
};

export const extractOrganizations = (
  decoded: DecodedToken | null
): (string | Record<string, unknown>)[] => {
  if (!decoded) return [];

  // Return whichever field exists, or empty array
  return (decoded.orgs || decoded.organization || []) as (string | Record<string, unknown>)[];
};

export const extractUsername = (decoded: DecodedToken | null): string => {
  if (!decoded) return 'Unknown User';

  return (
    decoded.preferred_username ||
    decoded.email ||
    decoded.name ||
    decoded.sub ||
    'Unknown User'
  );
};

export const isTokenExpired = (decoded: DecodedToken | null): boolean => {
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};