import { corsHeaders, enforceRateLimit, json, logAdminAction, requireAdmin } from "../_shared/auth-guard.ts";

type Role = "admin" | "developer" | "designer" | "client";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const limited = enforceRateLimit(req, { scope: "admin-assign-role", limit: 15, windowMs: 60_000 });
  if (limited) return limited;

  const ctx = await requireAdmin(req);
  if (ctx instanceof Response) return ctx;

  let body: { user_id?: string; role?: Role };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const { user_id, role } = body;
  if (!user_id || !role) return json({ error: "user_id and role required" }, 400);
  if (!["admin", "developer", "designer", "client"].includes(role)) {
    return json({ error: "Invalid role" }, 400);
  }
  if (user_id === ctx.userId && role !== "admin") {
    return json({ error: "Cannot demote yourself" }, 400);
  }

  const sc = ctx.serviceClient;
  await sc.from("user_roles").delete().eq("user_id", user_id);
  const { error } = await sc.from("user_roles").insert({ user_id, role });
  if (error) return json({ error: error.message }, 400);

  await sc.from("notifications").insert({
    user_id, type: "admin_action",
    title: "Role updated", body: `Your role has been changed to ${role}.`,
  });

  await logAdminAction(ctx, "assign_role", user_id, { role });
  return json({ ok: true, role });
});
