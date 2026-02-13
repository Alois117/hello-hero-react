import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { decode as decodeJwt } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "PATCH, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "PATCH") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Missing or invalid authorization header" }, 401);
    }

    const token = authHeader.slice("Bearer ".length);
    const [_h, payload, _s] = decodeJwt(token);
    const userId = (payload as Record<string, unknown>).sub as string;

    if (!userId) return json({ error: "Invalid token: missing sub claim" }, 401);

    const body = await req.json();
    const { given_name, family_name } = body ?? {};
    if (!given_name || !family_name) {
      return json({ error: "given_name and family_name are required" }, 400);
    }

    const firstName = String(given_name).trim();
    const lastName = String(family_name).trim();

    if (!firstName || !lastName) return json({ error: "Names cannot be empty" }, 400);
    if (firstName.length > 100 || lastName.length > 100) {
      return json({ error: "Names cannot exceed 100 characters" }, 400);
    }

    const keycloakBaseUrl = Deno.env.get("KEYCLOAK_BASE_URL");
    const keycloakRealm = Deno.env.get("KEYCLOAK_REALM") ?? "Jarvis";
    const adminClientId = Deno.env.get("KEYCLOAK_ADMIN_CLIENT_ID");
    const adminClientSecret = Deno.env.get("KEYCLOAK_ADMIN_CLIENT_SECRET");

    if (!keycloakBaseUrl || !adminClientId || !adminClientSecret) {
      console.error("[update-profile] Missing Keycloak admin configuration");
      return json({ error: "Server configuration error" }, 500);
    }

    const tokenUrl =
      `${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`;

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: adminClientId,
        client_secret: adminClientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("[update-profile] Failed to obtain admin token:", errText);
      return json({ error: "Failed to authenticate with identity provider" }, 502);
    }

    const { access_token: adminToken } = await tokenResponse.json();

    const updateUrl =
      `${keycloakBaseUrl}/admin/realms/${keycloakRealm}/users/${userId}`;

    const updateResponse = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ firstName, lastName }),
    });

    if (!updateResponse.ok) {
      const errText = await updateResponse.text();
      console.error("[update-profile] Failed to update user:", errText);
      return json({ error: "Failed to update profile in identity provider" }, 502);
    }

    return json({
      success: true,
      message: "Profile updated successfully",
      data: { firstName, lastName },
    });
  } catch (err) {
    console.error("[update-profile] Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
};

const port = Number(Deno.env.get("PORT") ?? "8000");

serve(handler, { hostname: "0.0.0.0", port });
console.log(`[update-profile] Listening on http://0.0.0.0:${port}/`);
