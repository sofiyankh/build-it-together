

# Plan: Complete All Missing Parts of the Webapp

## What's Done
- Design system (tokens, fonts, globals)
- Public homepage (hero, services, pricing, why us, process, CTA, footer)
- Auth pages (login, signup, forgot/reset password)
- Auth context with Supabase
- Client portal layout + 8 pages (all with mock data)
- Database schema (10 tables with RLS)

## What's Missing

### 1. Public Site — Contact / Start a Project Page
- Full intake form: name, email, company, country dropdown, phone, project type pills, budget range slider, timeline, description textarea, file upload, GDPR consent
- Split layout: form left, info/testimonial right
- Route: `/contact`
- Navbar "Start a Project" button and "Client Login" link need to use `<Link>` to `/contact` and `/login`

### 2. Public Site — Portfolio / Case Studies Section
- Add a portfolio section to homepage (or dedicated `/portfolio` page)
- Filterable grid with project cards, tech stack badges, mockup images
- Categories: SaaS, AI Tool, Web App, MVP

### 3. Public Site — About Page
- Team section, mission, values
- Route: `/about`

### 4. Connect Portal Pages to Real Database
All portal pages currently use hardcoded mock data. Wire them up:
- **Dashboard**: Fetch real project count, unread messages, open tickets, pending invoices from Supabase
- **Projects**: Query `projects` table via client's `client_id`
- **Messages**: Query `messages` table, send real messages with insert, group by project
- **Files**: Create a `client-files` storage bucket, implement upload/download with Supabase Storage
- **Deployments**: Query `deployments` table
- **Support**: Query `tickets` table, create new tickets with insert
- **Billing**: Query `invoices` table
- **Settings**: Update `profiles` table (display_name, phone) via Supabase

### 5. Admin Dashboard (Section 6 of spec)
- New zone: `/admin/*` with its own layout
- **Admin Overview**: Revenue chart, active projects count, team utilization, recent activity
- **Client Management**: Table of all clients, status badges, search/filter
- **Project Management**: Kanban board (planning → design → dev → testing → live), drag cards between columns
- **Communications**: View all project message threads, respond as admin
- **Finance**: Invoice management, create/send invoices, revenue tracking
- **Team**: Team members list, role assignments
- **Settings**: Admin settings panel
- Admin guard: check `has_role(uid, 'admin')` before rendering

### 6. Storage Bucket for Files
- Create `client-files` bucket in Supabase Storage
- RLS policies: clients can upload/download their own project files
- Wire up PortalFiles to use real storage

### 7. Realtime for Messages
- Enable realtime on `messages` table
- Subscribe to new messages in PortalMessages for live chat experience

### 8. Navbar Fix
- "Client Login" → `<Link to="/login">`
- "Start a Project" → `<Link to="/contact">`
- Add portfolio and about nav links pointing to `/portfolio` and `/about`

## Implementation Order
1. Fix Navbar links + add `/contact`, `/about`, `/portfolio` routes
2. Build Contact page with intake form
3. Build About page
4. Build Portfolio page/section
5. Create storage bucket for files
6. Wire all portal pages to real Supabase data (projects, messages, tickets, invoices, deployments, settings)
7. Add realtime messaging
8. Build Admin layout + all admin pages
9. Add admin route guard

## Technical Notes
- All new pages follow existing patterns: `framer-motion` animations, `card-agency` class, design token colors
- Forms validated with inline checks (matching existing pattern) or zod
- Admin routes wrapped in a role-checking guard component similar to `ProtectedRoute`
- Storage bucket needs a migration for bucket creation + RLS policies
- Realtime requires `ALTER PUBLICATION supabase_realtime ADD TABLE public.messages`

