/**
 * Organizations Handler
 * Keycloak 26 Organizations Admin REST API
 *
 * Endpoints proxied:
 * GET    /organizations           → List orgs (supports ?first, ?max, ?search)
 * GET    /organizations/:id       → Get single org
 * POST   /organizations           → Create org
 * PUT    /organizations/:id       → Update org
 * DELETE /organizations/:id       → Delete org
 */
import { keycloakAdminFetch } from "../lib/admin-client.ts";
import { json } from "../lib/helpers.ts";

function normalizeAttributes(input: unknown): Record<string, string[]> | undefined {
  if (!input || typeof input !== "object") return undefined;

  const raw = input as Record<string, unknown>;
  const out: Record<string, string[]> = {};

  for (const [k, v] of Object.entries(raw)) {
    if (Array.isArray(v)) {
      out[k] = v.map((x) => String(x));
    } else if (v != null) {
      out[k] = [String(v)];
    }
  }

  return Object.keys(out).length ? out : undefined;
}

function extractIdFromLocation(location: string | null): string | undefined {
  if (!location) return undefined;
  const parts = location.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : undefined;
}

export async function handleOrganizations(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // Extract org ID: /organizations/:id
  const idMatch = path.match(/^\/organizations\/([^/]+)\/?$/);
  const orgId = idMatch?.[1];

  switch (req.method) {
    case "GET": {
      if (orgId) {
        const response = await keycloakAdminFetch(`/organizations/${orgId}`);
        if (!response.ok) {
          const err = await response.text();
          console.error("[organizations] GET by id failed:", err);
          return json({ error: "Failed to fetch organization", detail: err }, response.status);
        }
        return json(await response.json());
      }

      const first = url.searchParams.get("first") || "0";
      const max = url.searchParams.get("max") || "100";
      const search = url.searchParams.get("search") || "";

      let queryPath = `/organizations?first=${first}&max=${max}`;
      if (search) queryPath += `&search=${encodeURIComponent(search)}`;

      const response = await keycloakAdminFetch(queryPath);
      if (!response.ok) {
        const err = await response.text();
        console.error("[organizations] List failed:", err);
        return json({ error: "Failed to fetch organizations", detail: err }, response.status);
      }

      const orgs = await response.json();

      // total count (optional)
      let total = Array.isArray(orgs) ? orgs.length : 0;
      try {
        const countPath = `/organizations/count${search ? `?search=${encodeURIComponent(search)}` : ""}`;
        const countRes = await keycloakAdminFetch(countPath);
        if (countRes.ok) {
          const countData = await countRes.json();
          total = typeof countData === "number" ? countData : total;
        }
      } catch {
        // ignore
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

      const name = body.name;
      if (!name || typeof name !== "string" || !name.trim()) {
        return json({ error: "Organization name is required" }, 400);
      }

      const normalizedAttributes = normalizeAttributes(body.attributes);

      const payload = {
        ...body,
        name: name.trim(),
        attributes: normalizedAttributes,
      };

      const response = await keycloakAdminFetch("/organizations", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        const createdId = extractIdFromLocation(response.headers.get("Location"));
        return json({ success: true, id: createdId }, 201);
      }

      if (response.status === 204 || response.ok) {
        // Some setups return 204 on create; still succeed.
        const createdId = extractIdFromLocation(response.headers.get("Location"));
        return json({ success: true, id: createdId }, 200);
      }

      const err = await response.text();
      console.error("[organizations] Create failed:", err);
      return json({ error: "Failed to create organization", detail: err }, response.status);
    }

    case "PUT": {
      if (!orgId) return json({ error: "Organization ID required" }, 400);

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return json({ error: "Invalid JSON body" }, 400);
      }

      // Fetch current first, then merge (Keycloak expects full representation)
      const getRes = await keycloakAdminFetch(`/organizations/${orgId}`);
      if (!getRes.ok) return json({ error: "Organization not found" }, 404);

      const current = await getRes.json();

      const normalizedAttributes =
        body.attributes !== undefined ? normalizeAttributes(body.attributes) : undefined;

      const merged = {
        ...current,
        ...body,
        id: orgId,
        ...(body.attributes !== undefined ? { attributes: normalizedAttributes } : {}),
      };

      const response = await keycloakAdminFetch(`/organizations/${orgId}`, {
        method: "PUT",
        body: JSON.stringify(merged),
      });

      if (response.status === 204 || response.ok) {
        return json({ success: true });
      }

      const err = await response.text();
      console.error("[organizations] Update failed:", err);
      return json({ error: "Failed to update organization", detail: err }, response.status);
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
      return json({ error: "Failed to delete organization", detail: err }, response.status);
    }

    default:
      return json({ error: "Method not allowed" }, 405);
  }
}
