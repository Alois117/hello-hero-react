/**
 * Organization Members Handler
 * Keycloak 26 Organization Members REST API
 *
 * Endpoints proxied:
 *   GET  /organizations/:orgId/members  → List members (?first, ?max)
 *   POST /organizations/:orgId/members  → Add member (body: userId)
 *   DELETE /organizations/:orgId/members/:memberId → Remove member
 */
import { keycloakAdminFetch } from "../lib/admin-client.ts";
import { json } from "../lib/helpers.ts";

export async function handleMembers(
  req: Request,
  orgId: string
): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // Check for member ID: /organizations/:orgId/members/:memberId
  const memberIdMatch = path.match(
    /^\/organizations\/[^/]+\/members\/([^/]+)\/?$/
  );
  const memberId = memberIdMatch?.[1];

  switch (req.method) {
    case "GET": {
      const first = url.searchParams.get("first") || "0";
      const max = url.searchParams.get("max") || "100";

      const response = await keycloakAdminFetch(
        `/organizations/${orgId}/members?first=${first}&max=${max}`
      );

      if (!response.ok) {
        const err = await response.text();
        console.error("[members] List failed:", err);
        return json(
          { error: "Failed to fetch members", detail: err },
          response.status
        );
      }

      const members = await response.json();
      return json(members);
    }

    case "POST": {
      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return json({ error: "Invalid JSON body" }, 400);
      }

      const { userId } = body;
      if (!userId || typeof userId !== "string") {
        return json({ error: "userId (string) is required" }, 400);
      }

      // Keycloak expects the userId as the request body string
      const response = await keycloakAdminFetch(
        `/organizations/${orgId}/members`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userId),
        }
      );

      if (
        response.status === 201 ||
        response.status === 204 ||
        response.ok
      ) {
        return json({ success: true });
      }

      const err = await response.text();
      console.error("[members] Add failed:", err);
      return json(
        { error: "Failed to add member", detail: err },
        response.status
      );
    }

    case "DELETE": {
      if (!memberId) {
        return json({ error: "Member ID required for DELETE" }, 400);
      }

      const response = await keycloakAdminFetch(
        `/organizations/${orgId}/members/${memberId}`,
        { method: "DELETE" }
      );

      if (response.status === 204 || response.ok) {
        return json({ success: true });
      }

      const err = await response.text();
      console.error("[members] Remove failed:", err);
      return json(
        { error: "Failed to remove member", detail: err },
        response.status
      );
    }

    default:
      return json({ error: "Method not allowed" }, 405);
  }
}
