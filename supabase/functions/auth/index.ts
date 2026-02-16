import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getAdminClient() {
  const url = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  return createClient(url, serviceKey);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case "login":
        return await handleLogin(params.name, params.password);
      case "create-user":
        return await handleCreateUser(
          params.name,
          params.password,
          params.adminUserId
        );
      case "delete-user":
        return await handleDeleteUser(params.userId, params.adminUserId);
      case "list-users":
        return await handleListUsers(params.adminUserId);
      default:
        return jsonResponse({ error: "Ukjent handling" }, 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ukjent feil";
    return jsonResponse({ error: message }, 500);
  }
});

// --- Login ---
// Uses PostgreSQL pgcrypto for bcrypt verification
async function handleLogin(name: string, password: string) {
  if (!name || !password) {
    return jsonResponse({ error: "Navn og passord er påkrevd" }, 400);
  }

  const supabase = getAdminClient();

  // Use RPC to verify password with pgcrypto in the database
  const { data, error } = await supabase.rpc("verify_user_password", {
    p_name: name,
    p_password: password,
  });

  if (error || !data || data.length === 0) {
    return jsonResponse({ error: "Feil brukernavn eller passord" }, 401);
  }

  const user = data[0];
  return jsonResponse({
    user: {
      id: user.id,
      name: user.name,
      is_admin: user.is_admin,
    },
  });
}

// --- Create user (admin only) ---
async function handleCreateUser(
  name: string,
  password: string,
  adminUserId: string
) {
  if (!name || !password || !adminUserId) {
    return jsonResponse({ error: "Mangler påkrevde felter" }, 400);
  }

  const supabase = getAdminClient();

  // Verify admin
  const { data: admin } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", adminUserId)
    .single();

  if (!admin?.is_admin) {
    return jsonResponse({ error: "Ingen tilgang" }, 403);
  }

  // Use RPC to create user with hashed password
  const { data: newUser, error } = await supabase.rpc("create_user_with_password", {
    p_name: name,
    p_password: password,
  });

  if (error) {
    if (error.message?.includes("unique") || error.code === "23505") {
      return jsonResponse({ error: "Brukernavn er allerede i bruk" }, 409);
    }
    return jsonResponse({ error: "Kunne ikke opprette bruker: " + error.message }, 500);
  }

  const user = newUser[0];
  return jsonResponse({ user });
}

// --- Delete user (admin only) ---
async function handleDeleteUser(userId: string, adminUserId: string) {
  if (!userId || !adminUserId) {
    return jsonResponse({ error: "Mangler påkrevde felter" }, 400);
  }

  if (userId === adminUserId) {
    return jsonResponse({ error: "Kan ikke slette deg selv" }, 400);
  }

  const supabase = getAdminClient();

  const { data: admin } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", adminUserId)
    .single();

  if (!admin?.is_admin) {
    return jsonResponse({ error: "Ingen tilgang" }, 403);
  }

  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) {
    return jsonResponse({ error: "Kunne ikke slette bruker: " + error.message }, 500);
  }

  return jsonResponse({ success: true });
}

// --- List users (admin only) ---
async function handleListUsers(adminUserId: string) {
  if (!adminUserId) {
    return jsonResponse({ error: "Mangler admin-ID" }, 400);
  }

  const supabase = getAdminClient();

  const { data: admin } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", adminUserId)
    .single();

  if (!admin?.is_admin) {
    return jsonResponse({ error: "Ingen tilgang" }, 403);
  }

  const { data: users, error } = await supabase
    .from("users")
    .select("id, name, is_admin, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ users });
}
