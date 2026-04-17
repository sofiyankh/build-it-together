
-- Create demo client and admin users with profiles, roles, and a demo client record
DO $$
DECLARE
  demo_client_uid uuid;
  demo_admin_uid uuid;
  demo_client_id uuid;
  demo_project_id uuid;
BEGIN
  -- DEMO CLIENT
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'client@demo.com') THEN
    demo_client_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', demo_client_uid, 'authenticated', 'authenticated',
      'client@demo.com', crypt('demo1234', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('display_name','Demo Client'),
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), demo_client_uid,
      jsonb_build_object('sub', demo_client_uid::text, 'email', 'client@demo.com'),
      'email', demo_client_uid::text, now(), now(), now());
  ELSE
    SELECT id INTO demo_client_uid FROM auth.users WHERE email = 'client@demo.com';
  END IF;

  -- DEMO ADMIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@demo.com') THEN
    demo_admin_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', demo_admin_uid, 'authenticated', 'authenticated',
      'admin@demo.com', crypt('demo1234', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('display_name','Demo Admin'),
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), demo_admin_uid,
      jsonb_build_object('sub', demo_admin_uid::text, 'email', 'admin@demo.com'),
      'email', demo_admin_uid::text, now(), now(), now());
  ELSE
    SELECT id INTO demo_admin_uid FROM auth.users WHERE email = 'admin@demo.com';
  END IF;

  -- Promote admin role (handle_new_user already inserts 'client' role)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (demo_admin_uid, 'admin')
  ON CONFLICT DO NOTHING;

  -- Ensure a client record exists for the demo client user
  IF NOT EXISTS (SELECT 1 FROM public.clients WHERE user_id = demo_client_uid) THEN
    INSERT INTO public.clients (user_id, company_name, country, status, notes)
    VALUES (demo_client_uid, 'Demo Co', 'FR', 'active', 'Seeded demo client')
    RETURNING id INTO demo_client_id;
  ELSE
    SELECT id INTO demo_client_id FROM public.clients WHERE user_id = demo_client_uid;
  END IF;

  -- Seed a sample project + a couple of artifacts so the portal isn't empty
  IF NOT EXISTS (SELECT 1 FROM public.projects WHERE client_id = demo_client_id) THEN
    INSERT INTO public.projects (client_id, name, description, type, status, tech_stack, budget, contract_value, start_date, deadline)
    VALUES (demo_client_id, 'Demo SaaS Platform', 'A demo project to explore the portal.', 'saas', 'development',
            ARRAY['React','Supabase','Tailwind'], 25000, 25000, current_date - 30, current_date + 60)
    RETURNING id INTO demo_project_id;

    INSERT INTO public.messages (project_id, sender_id, sender_role, content)
    VALUES
      (demo_project_id, demo_admin_uid, 'admin', 'Welcome to your client portal! Let us know if you have questions.'),
      (demo_project_id, demo_client_uid, 'client', 'Thanks! Excited to see the first deployment.');

    INSERT INTO public.deployments (project_id, version, environment, url, status, changelog)
    VALUES (demo_project_id, 'v0.1.0', 'staging', 'https://demo.staging.example.com', 'live', 'Initial staging deployment.');

    INSERT INTO public.invoices (client_id, project_id, invoice_number, due_date, status, subtotal, vat_amount, total, currency, line_items)
    VALUES (demo_client_id, demo_project_id, 'INV-DEMO-001', current_date + 14, 'pending', 5000, 1000, 6000, 'EUR',
            '[{"description":"Sprint 1","qty":1,"unit_price":5000}]'::jsonb);

    INSERT INTO public.tickets (client_id, project_id, title, description, category, priority, status)
    VALUES (demo_client_id, demo_project_id, 'How do I invite a teammate?', 'Looking to add a colleague to view the project.', 'question', 'low', 'open');
  END IF;
END $$;
