/**
 * Direct Authentication Utility for Keycloak
 * 
 * This module handles direct username/password authentication with Keycloak
 * using the Resource Owner Password Credentials (ROPC) grant type.
 * 
 * SECURITY NOTES:
 * - Tokens are returned but should ONLY be stored in memory
 * - Never persist tokens to localStorage, sessionStorage, or cookies
 * - This requires "Direct Access Grants Enabled" on the Keycloak client
 * - All communication must be over HTTPS in production
 */

export interface DirectAuthResult {
  success: boolean;
  error?: string;
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface DirectAuthCredentials {
  username: string;
  password: string;
}

/**
 * Authenticate directly with Keycloak using username and password
 * This bypasses the redirect flow and authenticates in the background
 */
export async function authenticateWithKeycloak(
  credentials: DirectAuthCredentials
): Promise<DirectAuthResult> {
  const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://10.100.12.54:8080';
  const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'Jarvis';
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'react-frontend';

  const tokenEndpoint = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

  const formData = new URLSearchParams();
  formData.append('grant_type', 'password');
  formData.append('client_id', clientId);
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);
  formData.append('scope', 'openid profile email');

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Map Keycloak error responses to user-friendly messages
      if (response.status === 401 || errorData.error === 'invalid_grant') {
        return {
          success: false,
          error: 'Invalid username or password',
        };
      }
      
      if (response.status === 400 && errorData.error_description) {
        return {
          success: false,
          error: errorData.error_description,
        };
      }

      return {
        success: false,
        error: 'Authentication failed. Please try again.',
      };
    }

    const tokenData = await response.json();

    return {
      success: true,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      id_token: tokenData.id_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    };
  } catch (error) {
    console.error('[DirectAuth] Network error:', error);
    return {
      success: false,
      error: 'Unable to connect to authentication server. Please check your connection.',
    };
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password length
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}
