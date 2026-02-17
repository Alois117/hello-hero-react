/**
 * Keycloak Admin Client
 * Shared utility for obtaining admin tokens and making authenticated
 * requests to the Keycloak Admin REST API.
 *
 * Uses client_credentials grant with env vars:
 *   KEYCLOAK_BASE_URL, KEYCLOAK_REALM,
 *   KEYCLOAK_ADMIN_CLIENT_ID, KEYCLOAK_ADMIN_CLIENT_SECRET
 */

interface KeycloakConfig {
  baseUrl: string;
  realm: string;
  clientId: string;
  clientSecret: string;
}

/**
 * Read Keycloak configuration from environment.
 * Throws if any required variable is missing.
 */
export function getKeycloakConfig(): KeycloakConfig {
  const baseUrl = Deno.env.get("KEYCLOAK_BASE_URL");
  const realm = Deno.env.get("KEYCLOAK_REALM") ?? "Jarvis";
  const clientId = Deno.env.get("KEYCLOAK_ADMIN_CLIENT_ID");
  const clientSecret = Deno.env.get("KEYCLOAK_ADMIN_CLIENT_SECRET");

  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error("Missing Keycloak admin configuration env vars");
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), realm, clientId, clientSecret };
}

/**
 * Obtain an admin-level access token using client_credentials grant.
 */
export async function getAdminToken(): Promise<string> {
  const { baseUrl, realm, clientId, clientSecret } = getKeycloakConfig();

  const tokenUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("[admin-client] Failed to obtain admin token:", errText);
    throw new Error("Failed to authenticate with identity provider");
  }

  const { access_token } = await response.json();
  return access_token as string;
}

/**
 * Make an authenticated request to the Keycloak Admin REST API.
 *
 * @param path - Relative to /admin/realms/{realm} e.g. "/organizations"
 * @param options - Standard RequestInit overrides
 */
export async function keycloakAdminFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { baseUrl, realm } = getKeycloakConfig();
  const adminToken = await getAdminToken();

  const url = `${baseUrl}/admin/realms/${realm}${path}`;

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
      ...(options.headers as Record<string, string> || {}),
    },
  });
}

/**
 * Extract the `sub` claim (user ID) from a raw JWT string.
 * Does NOT verify signature — caller is responsible for auth validation.
 */
export function extractUserIdFromJwt(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return (decoded.sub as string) || null;
  } catch {
    return null;
  }
}
