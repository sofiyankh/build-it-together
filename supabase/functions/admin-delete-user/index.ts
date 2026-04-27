import { corsHeaders, enforceRateLimit, json, logAdminAction, requireAdmin } from "../_shared/auth-guard.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const limited = enforceRateLimit(req, { scope: "admin-delete-user", limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  const ctx = await requireAdmin(req);
  if (ctx instanceof Response) return ctx;

  let body: { user_id?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const { user_id } = body;
  if (!user_id) return json({ error: "user_id required" }, 400);
  if (user_id === ctx.userId) return json({ error: "Cannot delete your own account" }, 400);

  // Cascade-clean app data first (FKs are not declared, so we do it manually)
  const sc = ctx.serviceClient;

  // Find the client row (if any) so we can clean dependent records
  const { data: client } = await sc.from("clients").select("id").eq("user_id", user_id).maybeSingle();
  if (client) {
    const { data: projects } = await sc.from("projects").select("id").eq("client_id", client.id);
    const projectIds = (projects ?? []).map((p) => p.id);
    if (projectIds.length) {
      await sc.from("messages").delete().in("project_id", projectIds);
      await sc.from("deployments").delete().in("project_id", projectIds);
    }
    await sc.from("tickets").delete().eq("client_id", client.id);
    await sc.from("invoices").delete().eq("client_id", client.id);
    await sc.from("projects").delete().eq("client_id", client.id);
    await sc.from("clients").delete().eq("id", client.id);
  }

  await sc.from("notifications").delete().eq("user_id", user_id);
  await sc.from("user_roles").delete().eq("user_id", user_id);
  await sc.from("profiles").delete().eq("user_id", user_id);

  // Finally delete the auth user
  const { error } = await sc.auth.admin.deleteUser(user_id);
  if (error) return json({ error: error.message }, 400);

  await logAdminAction(ctx, "delete_user", user_id);
  return json({ ok: true });
});
