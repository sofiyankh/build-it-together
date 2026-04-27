import { corsHeaders, enforceRateLimit, json, logAdminAction, requireAdmin } from "../_shared/auth-guard.ts";

type Role = "admin" | "developer" | "designer" | "client";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const limited = enforceRateLimit(req, { scope: "admin-create-user", limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const ctx = await requireAdmin(req);
  if (ctx instanceof Response) return ctx;

  let body: { email?: string; password?: string; display_name?: string; role?: Role; company_name?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { email, password, display_name, role = "client", company_name } = body;
  if (!email || typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: "Valid email required" }, 400);
  }
  if (!password || password.length < 8) {
    return json({ error: "Password must be at least 8 characters" }, 400);
  }
  if (!["admin", "developer", "designer", "client"].includes(role)) {
    return json({ error: "Invalid role" }, 400);
  }

  // 1. Create auth user
  const { data: created, error: createErr } = await ctx.serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: display_name ? { display_name } : undefined,
  });
  if (createErr || !created.user) {
    return json({ error: createErr?.message ?? "Could not create user" }, 400);
  }

  const newUserId = created.user.id;

  // 2. Override default 'client' role from handle_new_user trigger if a different role was requested
  if (role !== "client") {
    await ctx.serviceClient.from("user_roles").delete().eq("user_id", newUserId);
    await ctx.serviceClient.from("user_roles").insert({ user_id: newUserId, role });
  }

  // 3. If client, create matching clients row
  if (role === "client") {
    await ctx.serviceClient.from("clients").insert({
      user_id: newUserId,
      company_name: company_name ?? null,
    });
  }

  // 4. Welcome notification
  await ctx.serviceClient.from("notifications").insert({
    user_id: newUserId,
    type: "system",
    title: "Welcome to the platform",
    body: `Your ${role} account was created by an administrator.`,
  });

  await logAdminAction(ctx, "create_user", newUserId, { email, role });

  return json({ ok: true, user_id: newUserId, email, role });
});
