import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useClientId } from "@/hooks/use-client-id";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const priorityColors: Record<string, string> = { low: "text-text-muted", medium: "text-warning", high: "text-destructive", urgent: "text-destructive" };
const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  open: { bg: "rgba(239,68,68,0.12)", text: "#FCA5A5", border: "rgba(239,68,68,0.3)" },
  in_progress: { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
  resolved: { bg: "rgba(16,185,129,0.12)", text: "#34D399", border: "rgba(16,185,129,0.3)" },
  closed: { bg: "rgba(107,114,128,0.12)", text: "#9CA3AF", border: "rgba(107,114,128,0.3)" },
};

const categories = ["bug", "feature_request", "question", "billing", "other"] as const;
const priorities = ["low", "medium", "high", "urgent"] as const;

const PortalSupport = () => {
  const { clientId } = useClientId();
  const [tickets, setTickets] = useState<Tables<"tickets">[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "bug" as string, priority: "medium" as string });

  useEffect(() => {
    if (!clientId) return;
    supabase.from("tickets").select("*").eq("client_id", clientId).order("created_at", { ascending: false }).then(({ data }) => {
      setTickets(data ?? []);
      setLoading(false);
    });
  }, [clientId]);

  const handleCreate = async () => {
    if (!clientId || !form.title || !form.description) { toast.error("Fill in all fields"); return; }
    const { error } = await supabase.from("tickets").insert({
      client_id: clientId,
      title: form.title,
      description: form.description,
      category: form.category as Tables<"tickets">["category"],
      priority: form.priority as Tables<"tickets">["priority"],
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Ticket created!");
    setOpen(false);
    setForm({ title: "", description: "", category: "bug", priority: "medium" });
    // Reload
    const { data } = await supabase.from("tickets").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
    setTickets(data ?? []);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-bold text-foreground">Support Tickets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="font-body text-sm"><Plus size={16} className="mr-2" /> New Ticket</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display text-foreground">New Support Ticket</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="font-body text-sm text-text-secondary">Title</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Brief summary" className="bg-secondary border-border text-foreground font-body" />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm text-text-secondary">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the issue in detail..." rows={4} className="bg-secondary border-border text-foreground font-body resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-body text-sm text-text-secondary">Category</Label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full h-10 rounded-md border border-border bg-secondary text-foreground font-body text-sm px-3">
                    {categories.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-body text-sm text-text-secondary">Priority</Label>
                  <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} className="w-full h-10 rounded-md border border-border bg-secondary text-foreground font-body text-sm px-3">
                    {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full font-body">Submit Ticket</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tickets.length === 0 ? (
        <div className="card-agency p-10 text-center">
          <p className="font-body text-sm text-text-secondary">No support tickets. Create one if you need help!</p>
        </div>
      ) : (
        <div className="card-agency overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Title", "Category", "Priority", "Status", "Created"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-body text-[10px] uppercase tracking-wider text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((t, i) => {
                const ss = statusStyles[t.status] || statusStyles.open;
                return (
                  <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-body text-sm text-foreground">{t.title}</td>
                    <td className="px-4 py-3"><span className="badge-cyan text-[10px] px-2 py-0.5 rounded-full capitalize">{t.category.replace("_", " ")}</span></td>
                    <td className="px-4 py-3 font-body text-xs capitalize"><span className={priorityColors[t.priority]}>{t.priority}</span></td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-body px-2 py-0.5 rounded-full" style={{ background: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-text-muted">{new Date(t.created_at).toLocaleDateString()}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PortalSupport;
