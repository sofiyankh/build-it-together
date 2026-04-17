// Shared admin auth guard for edge functions.
// Implements the "JWT claim + DB fallback" verification chosen by the user.
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export { corsHeaders };

export interface AdminContext {
  userId: string;
  email: string | null;
  userClient: SupabaseClient; // RLS-scoped to caller
  serviceClient: SupabaseClient; // bypasses RLS — use carefully
  ip: string | null;
}

export async function requireAdmin(req: Request): Promise<AdminContext | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Missing Authorization header" }, 401);
  }
  const token = authHeader.replace("Bearer ", "");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  // 1. Verify JWT signature + extract claims
  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) {
    return json({ error: "Invalid token" }, 401);
  }
  const claims = claimsData.claims as Record<string, unknown>;
  const userId = String(claims.sub);
  const claimRole = claims.user_role;

  // 2. Fast check on JWT claim
  if (claimRole !== "admin") {
    return json({ error: "Forbidden — admin role required" }, 403);
  }

  // 3. DB fallback — re-verify with has_role() against the source of truth
  const serviceClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: hasRole, error: roleErr } = await serviceClient.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (roleErr || hasRole !== true) {
    return json({ error: "Forbidden — DB role mismatch" }, 403);
  }

  return {
    userId,
    email: typeof claims.email === "string" ? claims.email : null,
    userClient,
    serviceClient,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  };
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function logAdminAction(
  ctx: AdminContext,
  action: string,
  targetUserId: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await ctx.serviceClient.from("admin_audit_log").insert({
    actor_id: ctx.userId,
    action,
    target_user_id: targetUserId,
    metadata,
    ip_address: ctx.ip,
  });
}
