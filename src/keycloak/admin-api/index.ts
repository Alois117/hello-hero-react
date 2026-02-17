/**
 * Keycloak Admin API — Deno HTTP Server
 *
 * Unified router for all Keycloak admin operations:
 *   PATCH  /profile                            → Update user profile
 *   GET    /organizations                      → List organizations
 *   POST   /organizations                      → Create organization
 *   GET    /organizations/:id                  → Get organization
 *   PUT    /organizations/:id                  → Update organization
 *   DELETE /organizations/:id                  → Delete organization
 *   GET    /organizations/:id/members          → List org members
 *   POST   /organizations/:id/members          → Add member to org
 *   DELETE /organizations/:id/members/:mid     → Remove member
 *   GET    /users/:id                          → Get user
 *   POST   /users                              → Create user
 *   PUT    /users/:id                          → Update user
 *   PUT    /users/:id/toggle                   → Toggle user enabled
 *
 * Env vars required:
 *   KEYCLOAK_BASE_URL, KEYCLOAK_REALM,
 *   KEYCLOAK_ADMIN_CLIENT_ID, KEYCLOAK_ADMIN_CLIENT_SECRET
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleCors, json } from "./lib/helpers.ts";
import { handleProfile } from "./handlers/profile.ts";
import { handleOrganizations } from "./handlers/organizations.ts";
import { handleMembers } from "./handlers/members.ts";
import { handleUsers } from "./handlers/users.ts";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // ── Profile ──
    if (path === "/profile" || path === "/profile/") {
      return await handleProfile(req);
    }

    // ── Organizations + Members ──
    if (path.startsWith("/organizations")) {
      // Check for members sub-resource first
      const membersMatch = path.match(
        /^\/organizations\/([^/]+)\/members/
      );
      if (membersMatch) {
        return await handleMembers(req, membersMatch[1]);
      }
      return await handleOrganizations(req);
    }

    // ── Users ──
    if (path.startsWith("/users")) {
      return await handleUsers(req);
    }

    // ── Health check ──
    if (path === "/health" || path === "/") {
      return json({ status: "ok", service: "keycloak-admin-api" });
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    console.error("[admin-api] Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
};

const port = Number(Deno.env.get("PORT") ?? "8000");
serve(handler, { hostname: "0.0.0.0", port });
console.log(`[admin-api] Listening on http://0.0.0.0:${port}/`);
