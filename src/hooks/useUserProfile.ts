import { useState, useEffect, useCallback, useRef } from 'react';
import keycloak from '@/keycloak/config/keycloak';
import { useAuth } from '@/keycloak/context/AuthContext';
import { KEYCLOAK_USERINFO_URL, BACKEND_URL } from '@/config/env';
import { safeParseResponse } from '@/lib/safeFetch';

// ─── Keycloak userinfo response shape ───
interface KeycloakUserInfo {
  sub: string;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  organization?: Record<string, {
    client_name?: string[];
    client_id?: string[];
    id?: string;
  }>;
  // Legacy / alternate claim
  'Avis-Sentramind'?: Record<string, {
    client_name?: string[];
    client_id?: string[];
    id?: string;
  }>;
}

// ─── Mapped profile types ───
export interface UserOrganization {
  code: string;       // key from the org object, e.g. "Monarch_Insurance"
  displayName: string; // from client_name[0] or fallback to code
  clientId: string;    // from client_id[0]
  id: string;          // internal org id
}

export interface UserProfile {
  sub: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  emailVerified: boolean;
  organizations: UserOrganization[];
}

// ─── Mapper utility ───
function mapUserInfo(raw: KeycloakUserInfo): UserProfile {
  // Prefer 'organization' over 'Avis-Sentramind'
  const orgObj = raw.organization || raw['Avis-Sentramind'] || {};

  const organizations: UserOrganization[] = Object.entries(orgObj).map(
    ([code, entry]) => ({
      code,
      displayName: entry?.client_name?.[0] || code.replace(/_/g, ' '),
      clientId: entry?.client_id?.[0] || '',
      id: entry?.id || '',
    })
  );

  return {
    sub: raw.sub || '',
    firstName: raw.given_name || '',
    lastName: raw.family_name || '',
    fullName: raw.name || '',
    username: raw.preferred_username || '',
    email: raw.email || '',
    emailVerified: raw.email_verified ?? false,
    organizations,
  };
}

// ─── Hook ───
export function useUserProfile() {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fetchedRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    if (!keycloak.token) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = KEYCLOAK_USERINFO_URL;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      const result = await safeParseResponse<KeycloakUserInfo>(response, url);
      if (!result.ok) {
        throw new Error(result.userMessage || 'Failed to load profile');
      }

      setProfile(mapUserInfo(result.data));
    } catch (err: any) {
      console.error('[useUserProfile] Fetch error:', err);
      setError(err.message || 'We couldn\'t load your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
  async (updates: { given_name: string; family_name: string }) => {
    if (!keycloak.token) {
      throw new Error('Not authenticated');
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${BACKEND_URL}/update-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        let errorMsg = `Update failed (${response.status})`;
        try {
          const errorResult = await safeParseResponse<any>(response, `${BACKEND_URL}/update-profile`);
          if (!errorResult.ok) errorMsg = errorResult.userMessage;
          else if (errorResult.data?.error) errorMsg = errorResult.data.error;
        } catch { /* use default */ }
        throw new Error(errorMsg);
      }

      // Re-fetch profile to get official state
      await fetchProfile();
      return true;
    } catch (err: any) {
      console.error('[useUserProfile] Update error:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  },
  [fetchProfile]
);


  useEffect(() => {
    if (isAuthenticated && keycloak.token && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    isSaving,
    fetchProfile,
    updateProfile,
  };
}

export default useUserProfile;
