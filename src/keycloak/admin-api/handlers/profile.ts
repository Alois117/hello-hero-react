/**
 * Profile Update Handler
 * Migrated from src/keycloak/update-profile/index.ts
 * PATCH /profile — Update firstName/lastName via Keycloak Admin API
 */
import { keycloakAdminFetch, extractUserIdFromJwt } from "../lib/admin-client.ts";
import { json, extractBearerToken } from "../lib/helpers.ts";

export async function handleProfile(req: Request): Promise<Response> {
  if (req.method !== "PATCH") {
    return json({ error: "Method not allowed" }, 405);
  }

  const token = extractBearerToken(req);
  if (!token) {
    return json({ error: "Missing or invalid authorization header" }, 401);
  }

  const userId = extractUserIdFromJwt(token);
  if (!userId) {
    return json({ error: "Invalid token: missing sub claim" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { given_name, family_name } = body ?? {};
  if (!given_name || !family_name) {
    return json({ error: "given_name and family_name are required" }, 400);
  }

  const firstName = String(given_name).trim();
  const lastName = String(family_name).trim();

  if (!firstName || !lastName) {
    return json({ error: "Names cannot be empty" }, 400);
  }
  if (firstName.length > 100 || lastName.length > 100) {
    return json({ error: "Names cannot exceed 100 characters" }, 400);
  }

  // Fetch current user to merge (Keycloak PUT expects full representation)
  const getRes = await keycloakAdminFetch(`/users/${userId}`);
  if (!getRes.ok) {
    console.error("[profile] Failed to get user:", await getRes.text());
    return json({ error: "Failed to fetch current profile" }, 502);
  }

  const currentUser = await getRes.json();
  const updatedUser = { ...currentUser, firstName, lastName };

  const updateRes = await keycloakAdminFetch(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(updatedUser),
  });

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    console.error("[profile] Failed to update user:", errText);
    return json({ error: "Failed to update profile in identity provider" }, 502);
  }

  return json({
    success: true,
    message: "Profile updated successfully",
    data: { firstName, lastName },
  });
}
