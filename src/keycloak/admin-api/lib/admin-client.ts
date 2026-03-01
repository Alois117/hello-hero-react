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

const REQUIRED_KEYCLOAK_ENV_VARS = [
  "KEYCLOAK_BASE_URL",
  "KEYCLOAK_ADMIN_CLIENT_ID",
  "KEYCLOAK_ADMIN_CLIENT_SECRET",
] as const;

type RequiredKeycloakEnvVar = (typeof REQUIRED_KEYCLOAK_ENV_VARS)[number];

export class KeycloakAdminConfigError extends Error {
  missing: RequiredKeycloakEnvVar[];
  invalid: string[];

  constructor(message: string, missing: RequiredKeycloakEnvVar[] = [], invalid: string[] = []) {
    super(message);
    this.name = "KeycloakAdminConfigError";
    this.missing = missing;
    this.invalid = invalid;
  }
}

function readRequiredEnv(env: Deno.Env, key: RequiredKeycloakEnvVar): string | null {
  const value = env.get(key)?.trim();
  return value ? value : null;
}

export function getKeycloakConfigStatus() {
  try {
    getKeycloakConfig();
    return { ok: true as const, missing: [] as RequiredKeycloakEnvVar[], invalid: [] as string[] };
  } catch (err) {
    if (err instanceof KeycloakAdminConfigError) {
      return { ok: false as const, missing: err.missing, invalid: err.invalid };
    }
    return { ok: false as const, missing: [] as RequiredKeycloakEnvVar[], invalid: [] as string[] };
  }
}

/**
 * Read Keycloak configuration from environment.
 * Throws if any required variable is missing.
 */
export function getKeycloakConfig(): KeycloakConfig {
  const baseUrl = readRequiredEnv(Deno.env, "KEYCLOAK_BASE_URL");
  const realm = Deno.env.get("KEYCLOAK_REALM") ?? "Jarvis";
  const clientId = readRequiredEnv(Deno.env, "KEYCLOAK_ADMIN_CLIENT_ID");
  const clientSecret = readRequiredEnv(Deno.env, "KEYCLOAK_ADMIN_CLIENT_SECRET");

  const missing: RequiredKeycloakEnvVar[] = REQUIRED_KEYCLOAK_ENV_VARS.filter((key) => {
    if (key === "KEYCLOAK_BASE_URL") return !baseUrl;
    if (key === "KEYCLOAK_ADMIN_CLIENT_ID") return !clientId;
    if (key === "KEYCLOAK_ADMIN_CLIENT_SECRET") return !clientSecret;
    return false;
  });

  const invalid: string[] = [];
  if (baseUrl) {
    try {
      const parsed = new URL(baseUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        invalid.push("KEYCLOAK_BASE_URL");
      }
    } catch {
      invalid.push("KEYCLOAK_BASE_URL");
    }
  }

  if (missing.length > 0 || invalid.length > 0) {
    throw new KeycloakAdminConfigError(
      "Keycloak admin API is misconfigured. Check required environment variables.",
      missing,
      invalid
    );
  }

  return {
    baseUrl: baseUrl!.replace(/\/$/, ""),
    realm,
    clientId: clientId!,
    clientSecret: clientSecret!,
  };
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
