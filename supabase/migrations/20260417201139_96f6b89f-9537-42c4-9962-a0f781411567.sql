-- ============================================================
-- 1. NOTIFICATIONS TABLE
-- ============================================================
CREATE TYPE public.notification_type AS ENUM (
  'message', 'project_update', 'invoice', 'ticket', 'deployment', 'system', 'admin_action'
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type public.notification_type NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users mark own notifications read"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Inserts only via service role / edge functions (no public insert policy)

-- ============================================================
-- 2. ADMIN AUDIT LOG
-- ============================================================
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_user_id UUID,
  target_resource TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_actor ON public.admin_audit_log(actor_id, created_at DESC);
CREATE INDEX idx_audit_target ON public.admin_audit_log(target_user_id, created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit log"
  ON public.admin_audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 3. CUSTOM ACCESS TOKEN HOOK — embeds role in every JWT
-- ============================================================
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims jsonb;
  user_role public.app_role;
BEGIN
  -- Pick highest-priority role for this user
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = (event->>'user_id')::uuid
  ORDER BY CASE role
    WHEN 'admin' THEN 1
    WHEN 'developer' THEN 2
    WHEN 'designer' THEN 3
    WHEN 'client' THEN 4
  END
  LIMIT 1;

  claims := event->'claims';

  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role::text));
  ELSE
    claims := jsonb_set(claims, '{user_role}', '"client"'::jsonb);
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- Allow Supabase Auth to call the hook
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM authenticated, anon, public;
GRANT SELECT ON public.user_roles TO supabase_auth_admin;

-- ============================================================
-- 4. AUDIT-LOG HELPER (called from edge functions via RPC)
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action TEXT,
  _target_user_id UUID DEFAULT NULL,
  _target_resource TEXT DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb,
  _ip TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO public.admin_audit_log (actor_id, action, target_user_id, target_resource, metadata, ip_address)
  VALUES (auth.uid(), _action, _target_user_id, _target_resource, _metadata, _ip)
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;

-- ============================================================
-- 5. NOTIFICATION HELPER
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _type public.notification_type,
  _title TEXT,
  _body TEXT DEFAULT NULL,
  _link TEXT DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, link, metadata)
  VALUES (_user_id, _type, _title, _body, _link, _metadata)
  RETURNING id INTO n_id;
  RETURN n_id;
END;
$$;

-- ============================================================
-- 6. AUTO-NOTIFY ON NEW MESSAGE
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id UUID;
  project_name TEXT;
BEGIN
  SELECT p.name INTO project_name FROM public.projects p WHERE p.id = NEW.project_id;

  -- If sender is client, notify all admins; if sender is admin/dev, notify the client
  IF NEW.sender_role = 'client' THEN
    FOR recipient_id IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
      PERFORM public.create_notification(
        recipient_id, 'message', 'New client message',
        left(NEW.content, 140), '/admin/messages',
        jsonb_build_object('project_id', NEW.project_id, 'project_name', project_name)
      );
    END LOOP;
  ELSE
    SELECT c.user_id INTO recipient_id
    FROM public.projects p JOIN public.clients c ON p.client_id = c.id
    WHERE p.id = NEW.project_id;
    IF recipient_id IS NOT NULL AND recipient_id <> NEW.sender_id THEN
      PERFORM public.create_notification(
        recipient_id, 'message', 'New message from your team',
        left(NEW.content, 140), '/portal/messages',
        jsonb_build_object('project_id', NEW.project_id, 'project_name', project_name)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

-- ============================================================
-- 7. REALTIME
-- ============================================================
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;