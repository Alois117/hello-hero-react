/**
 * Organizations Handler
 * Keycloak 26 Organizations Admin REST API
 *
 * Endpoints proxied:
 *   GET    /organizations          → List orgs (supports ?first, ?max, ?search)
 *   GET    /organizations/:id      → Get single org
 *   POST   /organizations          → Create org
 *   PUT    /organizations/:id      → Update org
 *   DELETE /organizations/:id      → Delete org
 */
import { keycloakAdminFetch } from "../lib/admin-client.ts";
import { json } from "../lib/helpers.ts";

export async function handleOrganizations(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // Extract org ID: /organizations/:id
  const idMatch = path.match(/^\/organizations\/([^/]+)\/?$/);
  const orgId = idMatch?.[1];

  switch (req.method) {
    case "GET": {
      if (orgId) {
        // ── Get single organization ──
        const response = await keycloakAdminFetch(`/organizations/${orgId}`);
        if (!response.ok) {
          const err = await response.text();
          console.error("[organizations] GET by id failed:", err);
          return json(
            { error: "Failed to fetch organization", detail: err },
            response.status
          );
        }
        return json(await response.json());
      }

      // ── List organizations with pagination ──
      const first = url.searchParams.get("first") || "0";
      const max = url.searchParams.get("max") || "100";
      const search = url.searchParams.get("search") || "";

      let queryPath = `/organizations?first=${first}&max=${max}`;
      if (search) {
        queryPath += `&search=${encodeURIComponent(search)}`;
      }

      const response = await keycloakAdminFetch(queryPath);
      if (!response.ok) {
        const err = await response.text();
        console.error("[organizations] List failed:", err);
        return json(
          { error: "Failed to fetch organizations", detail: err },
          response.status
        );
      }

      const orgs = await response.json();

      // Also fetch total count for pagination metadata
      let total = Array.isArray(orgs) ? orgs.length : 0;
      try {
        const countPath = `/organizations/count${
          search ? `?search=${encodeURIComponent(search)}` : ""
        }`;
        const countRes = await keycloakAdminFetch(countPath);
        if (countRes.ok) {
          const countData = await countRes.json();
          total = typeof countData === "number" ? countData : total;
        }
      } catch {
        // Count endpoint may not exist in all KC versions; fall back to array length
      }

      return json({ organizations: orgs, total });
    }

    case "POST": {
      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return json({ error: "Invalid JSON body" }, 400);
      }

      if (!body.name || typeof body.name !== "string") {
        return json({ error: "Organization name is required" }, 400);
      }

      const response = await keycloakAdminFetch("/organizations", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (response.status === 201) {
        const location = response.headers.get("Location");
        const createdId = location?.split("/").pop();
        return json({ success: true, id: createdId }, 201);
      }

      const err = await response.text();
      console.error("[organizations] Create failed:", err);
      return json(
        { error: "Failed to create organization", detail: err },
        response.status
      );
    }

    case "PUT": {
      if (!orgId) return json({ error: "Organization ID required" }, 400);

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return json({ error: "Invalid JSON body" }, 400);
      }

      // Keycloak PUT /organizations/{id} expects the full OrganizationRepresentation
      // Fetch current first, then merge
      const getRes = await keycloakAdminFetch(`/organizations/${orgId}`);
      if (!getRes.ok) {
        return json({ error: "Organization not found" }, 404);
      }
      const current = await getRes.json();
      const merged = { ...current, ...body, id: orgId };

      const response = await keycloakAdminFetch(`/organizations/${orgId}`, {
        method: "PUT",
        body: JSON.stringify(merged),
      });

      if (response.status === 204 || response.ok) {
        return json({ success: true });
      }

      const err = await response.text();
      console.error("[organizations] Update failed:", err);
      return json(
        { error: "Failed to update organization", detail: err },
        response.status
      );
    }

    case "DELETE": {
      if (!orgId) return json({ error: "Organization ID required" }, 400);

      const response = await keycloakAdminFetch(`/organizations/${orgId}`, {
        method: "DELETE",
      });

      if (response.status === 204 || response.ok) {
        return json({ success: true });
      }

      const err = await response.text();
      console.error("[organizations] Delete failed:", err);
      return json(
        { error: "Failed to delete organization", detail: err },
        response.status
      );
    }

    default:
      return json({ error: "Method not allowed" }, 405);
  }
}
