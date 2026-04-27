import { corsHeaders, enforceRateLimit, json, logAdminAction, requireAdmin } from "../_shared/auth-guard.ts";

type Action = "suspend" | "reactivate" | "reset_password" | "change_email";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const limited = enforceRateLimit(req, { scope: "admin-update-user", limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const ctx = await requireAdmin(req);
  if (ctx instanceof Response) return ctx;

  let body: { user_id?: string; action?: Action; email?: string; ban_hours?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { user_id, action } = body;
  if (!user_id || !action) return json({ error: "user_id and action required" }, 400);
  if (user_id === ctx.userId) return json({ error: "Cannot modify your own account" }, 400);

  switch (action) {
    case "suspend": {
      const hours = Math.max(1, Math.min(8760, body.ban_hours ?? 168)); // 1h–1y, default 7d
      const { error } = await ctx.serviceClient.auth.admin.updateUserById(user_id, {
        ban_duration: `${hours}h`,
      });
      if (error) return json({ error: error.message }, 400);
      await ctx.serviceClient.from("notifications").insert({
        user_id, type: "admin_action",
        title: "Account suspended", body: `Your account has been suspended for ${hours}h.`,
      });
      await logAdminAction(ctx, "suspend_user", user_id, { ban_hours: hours });
      return json({ ok: true, action: "suspend", ban_hours: hours });
    }
    case "reactivate": {
      const { error } = await ctx.serviceClient.auth.admin.updateUserById(user_id, {
        ban_duration: "none",
      });
      if (error) return json({ error: error.message }, 400);
      await logAdminAction(ctx, "reactivate_user", user_id);
      return json({ ok: true, action: "reactivate" });
    }
    case "reset_password": {
      // Fetch email then send reset link
      const { data: u, error: getErr } = await ctx.serviceClient.auth.admin.getUserById(user_id);
      if (getErr || !u.user?.email) return json({ error: "User email not found" }, 400);
      const { error } = await ctx.serviceClient.auth.resetPasswordForEmail(u.user.email, {
        redirectTo: `${new URL(req.url).origin.replace(/^https?:\/\/[^/]+/, "")}/reset-password`,
      });
      if (error) return json({ error: error.message }, 400);
      await logAdminAction(ctx, "send_password_reset", user_id, { email: u.user.email });
      return json({ ok: true, action: "reset_password" });
    }
    case "change_email": {
      if (!body.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
        return json({ error: "Valid email required" }, 400);
      }
      const { error } = await ctx.serviceClient.auth.admin.updateUserById(user_id, {
        email: body.email, email_confirm: true,
      });
      if (error) return json({ error: error.message }, 400);
      await logAdminAction(ctx, "change_email", user_id, { new_email: body.email });
      return json({ ok: true, action: "change_email", email: body.email });
    }
    default:
      return json({ error: "Unknown action" }, 400);
  }
});
