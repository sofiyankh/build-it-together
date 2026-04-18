import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Deployment = Tables<"deployments"> & { project_name?: string };

const AdminDeployments = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [projects, setProjects] = useState<Tables<"projects">[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ project_id: "", version: "", url: "", environment: "staging", status: "live", changelog: "" });

  const load = async () => {
    const [{ data: d }, { data: p }] = await Promise.all([
      supabase.from("deployments").select("*").order("deployed_at", { ascending: false }),
      supabase.from("projects").select("*").order("name"),
    ]);
    const ps = p ?? [];
    setProjects(ps);
    setDeployments((d ?? []).map((x) => ({ ...x, project_name: ps.find((pp) => pp.id === x.project_id)?.name })));
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.project_id || !form.version || !form.url) { toast.error("Project, version and URL are required"); return; }
    const { error } = await supabase.from("deployments").insert({
      project_id: form.project_id,
      version: form.version,
      url: form.url,
      environment: form.environment as Tables<"deployments">["environment"],
      status: form.status as Tables<"deployments">["status"],
      changelog: form.changelog || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Deployment recorded");
    setOpen(false);
    setForm({ project_id: "", version: "", url: "", environment: "staging", status: "live", changelog: "" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this deployment record?")) return;
    const { error } = await supabase.from("deployments").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-xl font-bold text-foreground uppercase tracking-wide">Deployments</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="font-mono text-xs uppercase"><Plus size={14} className="mr-1" /> New Deployment</Button></DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-mono text-foreground uppercase">New Deployment</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-3">
              <div className="space-y-1.5">
                <Label className="font-body text-xs text-text-secondary">Project</Label>
                <select value={form.project_id} onChange={(e) => setForm((p) => ({ ...p, project_id: e.target.value }))} className="w-full h-10 rounded-md border border-border bg-secondary text-foreground font-body text-sm px-3">
                  <option value="">Select project...</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-body text-xs text-text-secondary">Version</Label>
                  <Input value={form.version} onChange={(e) => setForm((p) => ({ ...p, version: e.target.value }))} placeholder="v1.0.0" className="bg-secondary border-border font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-body text-xs text-text-secondary">Environment</Label>
                  <select value={form.environment} onChange={(e) => setForm((p) => ({ ...p, environment: e.target.value }))} className="w-full h-10 rounded-md border border-border bg-secondary text-foreground text-sm px-3">
                    <option value="staging">staging</option>
                    <option value="production">production</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs text-text-secondary">URL</Label>
                <Input value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://..." className="bg-secondary border-border font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs text-text-secondary">Status</Label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="w-full h-10 rounded-md border border-border bg-secondary text-foreground text-sm px-3">
                  <option value="live">live</option>
                  <option value="archived">archived</option>
                  <option value="rollback">rollback</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs text-text-secondary">Changelog</Label>
                <Textarea value={form.changelog} onChange={(e) => setForm((p) => ({ ...p, changelog: e.target.value }))} rows={3} placeholder="Notes..." className="bg-secondary border-border font-body text-sm resize-none" />
              </div>
              <Button onClick={create} className="w-full font-mono uppercase text-xs">Record Deployment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {deployments.length === 0 ? (
        <div className="card-agency p-10 text-center"><p className="font-body text-sm text-text-secondary">No deployments yet.</p></div>
      ) : (
        <div className="space-y-3">
          {deployments.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`card-agency p-4 border-l-4 ${d.environment === "production" ? "border-l-success" : "border-l-accent-cyan"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm font-bold text-foreground">{d.version}</span>
                  <span className="badge-cyan text-[10px] px-2 py-0.5 rounded-full">{d.environment}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${d.status === "live" ? "bg-success/20 text-success border border-success/30" : "bg-secondary text-text-muted border border-border"}`}>{d.status}</span>
                  {d.project_name && <span className="font-body text-xs text-text-secondary">· {d.project_name}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-text-muted">{new Date(d.deployed_at).toLocaleString()}</span>
                  <button onClick={() => remove(d.id)} className="text-text-muted hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-accent-blue hover:text-accent-cyan transition-colors">
                {d.url} <ExternalLink size={10} />
              </a>
              {d.changelog && <p className="mt-2 font-body text-xs text-text-secondary">{d.changelog}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDeployments;
