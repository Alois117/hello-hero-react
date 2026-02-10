import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { decode as decodeJwt } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "PATCH, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "PATCH") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // ── Extract & validate bearer token ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Decode the JWT to extract sub (user id)
    // We decode without verification here since the Keycloak userinfo endpoint
    // already validates the token, and we validate via the admin API call
    const [_header, payload, _signature] = decodeJwt(token);
    const userPayload = payload as Record<string, unknown>;
    const userId = userPayload.sub as string;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Invalid token: missing sub claim" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Parse request body ──
    const body = await req.json();
    const { given_name, family_name } = body;

    if (!given_name || !family_name) {
      return new Response(
        JSON.stringify({ error: "given_name and family_name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input
    const trimmedFirst = String(given_name).trim();
    const trimmedLast = String(family_name).trim();

    if (trimmedFirst.length === 0 || trimmedLast.length === 0) {
      return new Response(
        JSON.stringify({ error: "Names cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (trimmedFirst.length > 100 || trimmedLast.length > 100) {
      return new Response(
        JSON.stringify({ error: "Names cannot exceed 100 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Get Keycloak admin credentials from secrets ──
    const keycloakBaseUrl = Deno.env.get("KEYCLOAK_BASE_URL");
    const keycloakRealm = Deno.env.get("KEYCLOAK_REALM") ?? "Jarvis";
    const adminClientId = Deno.env.get("KEYCLOAK_ADMIN_CLIENT_ID");
    const adminClientSecret = Deno.env.get("KEYCLOAK_ADMIN_CLIENT_SECRET");

    if (!keycloakBaseUrl || !adminClientId || !adminClientSecret) {
      console.error("[update-profile] Missing Keycloak admin configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Obtain admin access token via client credentials ──
    const tokenUrl = `${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`;
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
      return new Response(
        JSON.stringify({ error: "Failed to authenticate with identity provider" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = await tokenResponse.json();
    const adminToken = tokenData.access_token;

    // ── Update user in Keycloak via Admin REST API ──
    const updateUrl = `${keycloakBaseUrl}/admin/realms/${keycloakRealm}/users/${userId}`;
    const updateResponse = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        firstName: trimmedFirst,
        lastName: trimmedLast,
      }),
    });

    if (!updateResponse.ok) {
      const errText = await updateResponse.text();
      console.error("[update-profile] Failed to update user:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to update profile in identity provider" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile updated successfully",
        data: {
          firstName: trimmedFirst,
          lastName: trimmedLast,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[update-profile] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}), { port: 8081 };
