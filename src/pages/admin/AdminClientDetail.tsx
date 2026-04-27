import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building2, Mail, Phone, Briefcase, Receipt, LifeBuoy, FolderKanban } from "lucide-react";

type Client = Tables<"clients">;
type Profile = Tables<"profiles">;
type Project = Tables<"projects">;
type Invoice = Tables<"invoices">;
type Ticket = Tables<"tickets">;

const AdminClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: c } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
      if (!c) { setLoading(false); return; }
      setClient(c);

      const [{ data: p }, { data: pr }, { data: inv }, { data: tk }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", c.user_id).maybeSingle(),
        supabase.from("projects").select("*").eq("client_id", c.id).order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").eq("client_id", c.id).order("created_at", { ascending: false }),
        supabase.from("tickets").select("*").eq("client_id", c.id).order("created_at", { ascending: false }),
      ]);
      setProfile(p);
      setProjects(pr ?? []);
      setInvoices(inv ?? []);
      setTickets(tk ?? []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="font-mono text-xs text-text-muted py-12 text-center">Loading client…</div>;
  if (!client) return <div className="font-mono text-xs text-text-muted py-12 text-center">Client not found</div>;

  const initials = (profile?.display_name || "?").charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <Link to="/admin/clients" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-text-muted hover:text-foreground transition-colors">
        <ArrowLeft size={12} /> Back to clients
      </Link>

      <div className="flex items-start gap-4 card-agency p-6">
        <div className="w-16 h-16 rounded-xl bg-destructive/20 border border-destructive/30 flex items-center justify-center text-2xl font-mono font-bold text-foreground">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-h2 font-bold text-foreground">{profile?.display_name || "Unnamed"}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-text-secondary font-body text-xs">
            {client.company_name && <span className="flex items-center gap-1.5"><Building2 size={12} /> {client.company_name}</span>}
            {profile?.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {profile.phone}</span>}
            {profile?.job_title && <span className="flex items-center gap-1.5"><Briefcase size={12} /> {profile.job_title}</span>}
            <span className="flex items-center gap-1.5"><Mail size={12} /> {client.country}</span>
          </div>
        </div>
        <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded border ${
          client.status === "active" ? "bg-success/10 text-success border-success/30" :
          client.status === "paused" ? "bg-warning/10 text-warning border-warning/30" :
          "bg-destructive/10 text-destructive border-destructive/30"
        }`}>{client.status}</span>
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="projects" className="font-mono text-[10px] uppercase tracking-wider">
            <FolderKanban size={12} className="mr-1.5" /> Projects ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="invoices" className="font-mono text-[10px] uppercase tracking-wider">
            <Receipt size={12} className="mr-1.5" /> Invoices ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="tickets" className="font-mono text-[10px] uppercase tracking-wider">
            <LifeBuoy size={12} className="mr-1.5" /> Tickets ({tickets.length})
          </TabsTrigger>
          <TabsTrigger value="profile" className="font-mono text-[10px] uppercase tracking-wider">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-4">
          {projects.length === 0 ? (
            <p className="card-agency p-6 text-center font-mono text-xs text-text-muted">No projects yet</p>
          ) : (
            <div className="grid gap-3">
              {projects.map((p) => (
                <div key={p.id} className="card-agency p-4 flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">{p.name}</p>
                    <p className="font-mono text-[10px] text-text-muted mt-0.5">{p.type} · {p.status}</p>
                  </div>
                  {p.deadline && <span className="font-mono text-[10px] text-text-muted">Due {new Date(p.deadline).toLocaleDateString()}</span>}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          {invoices.length === 0 ? (
            <p className="card-agency p-6 text-center font-mono text-xs text-text-muted">No invoices</p>
          ) : (
            <div className="grid gap-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="card-agency p-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-foreground">{inv.invoice_number}</p>
                    <p className="font-body text-[10px] text-text-muted mt-0.5">Due {new Date(inv.due_date).toLocaleDateString()} · {inv.status}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-foreground">{Number(inv.total).toFixed(2)} {inv.currency}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tickets" className="mt-4">
          {tickets.length === 0 ? (
            <p className="card-agency p-6 text-center font-mono text-xs text-text-muted">No tickets</p>
          ) : (
            <div className="grid gap-3">
              {tickets.map((t) => (
                <div key={t.id} className="card-agency p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">{t.title}</p>
                      <p className="font-mono text-[10px] text-text-muted mt-0.5">{t.category} · {t.priority}</p>
                    </div>
                    <span className="font-mono text-[10px] uppercase text-accent-cyan">{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          <div className="card-agency p-6 grid grid-cols-2 gap-4 font-body text-sm">
            <div><p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1">Display Name</p><p className="text-foreground">{profile?.display_name || "—"}</p></div>
            <div><p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1">Phone</p><p className="text-foreground">{profile?.phone || "—"}</p></div>
            <div><p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1">Job Title</p><p className="text-foreground">{profile?.job_title || "—"}</p></div>
            <div><p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1">Country</p><p className="text-foreground">{client.country}</p></div>
            <div><p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1">VAT</p><p className="text-foreground">{client.vat_number || "—"}</p></div>
            <div><p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1">Joined</p><p className="text-foreground">{new Date(client.created_at).toLocaleDateString()}</p></div>
            {client.notes && <div className="col-span-2"><p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1">Notes</p><p className="text-foreground whitespace-pre-wrap">{client.notes}</p></div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminClientDetail;
