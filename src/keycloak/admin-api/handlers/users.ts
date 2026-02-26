/**
 * User Management Handler
 * Keycloak Admin REST API — Users
 *
 * Endpoints proxied:
 *   GET    /users/:id                       → Get single user
 *   POST   /users                           → Create user
 *   PUT    /users/:id                       → Update user (firstName, lastName, email, enabled)
 *   PUT    /users/:id/toggle                → Toggle user enabled/disabled
 *   POST   /users/:id/roles/realm           → Assign a realm role to user (body: { roleName })
 *   POST|PUT /users/:id/execute-actions-email → Send required actions email (invite)
 */
import { keycloakAdminFetch } from "../lib/admin-client.ts";
import { json } from "../lib/helpers.ts";

export async function handleUsers(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // ✅ Route: /users/:id/execute-actions-email (handle FIRST)
  const execActionsMatch = path.match(/^\/users\/([^/]+)\/execute-actions-email\/?$/);
  if (execActionsMatch) {
    const userId = execActionsMatch[1];

    // Allow both POST and PUT from frontend to avoid client mismatch issues
    if (req.method !== "POST" && req.method !== "PUT") {
      return json({ error: "Method not allowed" }, 405);
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const actions: string[] = Array.isArray(body?.actions) && body.actions.length
      ? body.actions
      : ["VERIFY_EMAIL", "UPDATE_PASSWORD"];

    const lifespan = typeof body?.lifespan === "number" ? body.lifespan : 86400;

    // Keycloak expects query params: lifespan, client_id, redirect_uri
    const qs = new URLSearchParams();
    qs.set("lifespan", String(lifespan));
    if (typeof body?.clientId === "string" && body.clientId.trim()) {
      qs.set("client_id", body.clientId.trim());
    }
    if (typeof body?.redirectUri === "string" && body.redirectUri.trim()) {
      qs.set("redirect_uri", body.redirectUri.trim());
    }

    // Keycloak expects PUT and body = string[]
    const kcRes = await keycloakAdminFetch(
      `/users/${userId}/execute-actions-email?${qs.toString()}`,
      {
        method: "PUT",
        body: JSON.stringify(actions),
      }
    );

    if (kcRes.status === 204 || kcRes.ok) {
      return json({ success: true });
    }

    const err = await kcRes.text();
    console.error("[users] execute-actions-email failed:", err);
    return json({ error: "Failed to send actions email", detail: err }, kcRes.status);
  }

  // Match /users/:id/toggle
  const toggleMatch = path.match(/^\/users\/([^/]+)\/toggle\/?$/);

  // Match /users/:id/roles/realm
  const realmRoleMatch = path.match(/^\/users\/([^/]+)\/roles\/realm\/?$/);

  // Match /users/:id
  const idMatch = path.match(/^\/users\/([^/]+)\/?$/);

  const userId = toggleMatch?.[1] || realmRoleMatch?.[1] || idMatch?.[1];

  switch (req.method) {
    // ── GET /users/:id ──────────────────────────────────────────────
    case "GET": {
      if (!userId) return json({ error: "User ID required" }, 400);

      const response = await keycloakAdminFetch(`/users/${userId}`);
      if (!response.ok) {
        const err = await response.text();
        console.error("[users] GET failed:", err);
        return json({ error: "Failed to fetch user", detail: err }, response.status);
      }
      return json(await response.json());
    }

    // ── POST endpoints ──────────────────────────────────────────────
    case "POST": {
      // ✅ POST /users/:id/roles/realm
      if (realmRoleMatch) {
        if (!userId) return json({ error: "User ID required" }, 400);

        let body: any;
        try {
          body = await req.json();
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }

        const roleName = body?.roleName;
        if (!roleName || typeof roleName !== "string") {
          return json({ error: "roleName (string) is required" }, 400);
        }

        // 1) fetch the realm role representation
        const roleRes = await keycloakAdminFetch(`/roles/${encodeURIComponent(roleName)}`);
        if (!roleRes.ok) {
          const err = await roleRes.text();
          console.error("[users] Role lookup failed:", err);
          return json({ error: "Role not found", detail: err }, roleRes.status);
        }
        const roleRep = await roleRes.json();

        // 2) assign realm role to user
        const mapRes = await keycloakAdminFetch(`/users/${userId}/role-mappings/realm`, {
          method: "POST",
          body: JSON.stringify([roleRep]),
        });

        if (mapRes.status === 204 || mapRes.ok) {
          return json({ success: true });
        }

        const err = await mapRes.text();
        console.error("[users] Role assign failed:", err);
        return json({ error: "Failed to assign role", detail: err }, mapRes.status);
      }

      // ── POST /users (create user) ──
      if (userId) {
        // If someone hits POST /users/:id (not allowed)
        return json({ error: "Use PUT to update existing users" }, 400);
      }

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return json({ error: "Invalid JSON body" }, 400);
      }

      const {
        username,
        firstName,
        lastName,
        email,
        enabled,
        temporaryPassword,
        requiredActions,
      } = body as Record<string, any>;

      if (!username && !email) {
        return json({ error: "username or email is required" }, 400);
      }

      const userRep: Record<string, unknown> = {
        username: username || email,
        firstName: firstName ?? "",
        lastName: lastName ?? "",
        email: email ?? "",
        enabled: enabled !== false,
        emailVerified: false,
      };

      if (Array.isArray(requiredActions)) {
        userRep.requiredActions = requiredActions;
      }

      if (temporaryPassword && typeof temporaryPassword === "string") {
        userRep.credentials = [{ type: "password", value: temporaryPassword, temporary: true }];
      }

      const response = await keycloakAdminFetch("/users", {
        method: "POST",
        body: JSON.stringify(userRep),
      });

      if (response.status === 201) {
        const location = response.headers.get("Location");
        const createdId = location?.split("/").pop();
        return json({ success: true, id: createdId }, 201);
      }

      const err = await response.text();
      console.error("[users] Create failed:", err);
      return json({ error: "Failed to create user", detail: err }, response.status);
    }

    // ── PUT /users/:id OR /users/:id/toggle ─────────────────────────
    case "PUT": {
      if (!userId) return json({ error: "User ID required" }, 400);

      // Fetch current user for merge
      const getRes = await keycloakAdminFetch(`/users/${userId}`);
      if (!getRes.ok) {
        return json({ error: "User not found" }, 404);
      }
      const currentUser = await getRes.json();

      // ── Toggle endpoint ──
      if (toggleMatch) {
        const newEnabled = !currentUser.enabled;
        const updateRes = await keycloakAdminFetch(`/users/${userId}`, {
          method: "PUT",
          body: JSON.stringify({ ...currentUser, enabled: newEnabled }),
        });

        if (updateRes.status === 204 || updateRes.ok) {
          return json({ success: true, enabled: newEnabled });
        }

        const err = await updateRes.text();
        console.error("[users] Toggle failed:", err);
        return json({ error: "Failed to toggle user", detail: err }, updateRes.status);
      }

      // ── Regular update ──
      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return json({ error: "Invalid JSON body" }, 400);
      }

      const updatedUser = { ...currentUser };
      if (body.firstName !== undefined) updatedUser.firstName = body.firstName;
      if (body.lastName !== undefined) updatedUser.lastName = body.lastName;
      if (body.email !== undefined) updatedUser.email = body.email;
      if (body.enabled !== undefined) updatedUser.enabled = body.enabled;

      const response = await keycloakAdminFetch(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updatedUser),
      });

      if (response.status === 204 || response.ok) {
        return json({ success: true });
      }

      const err = await response.text();
      console.error("[users] Update failed:", err);
      return json({ error: "Failed to update user", detail: err }, response.status);
    }

    default:
      return json({ error: "Method not allowed" }, 405);
  }
}
