import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useClientId } from "@/hooks/use-client-id";
import { useAuth } from "@/modules/auth";
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
  const { user, role } = useAuth();
  const [tickets, setTickets] = useState<Tables<"tickets">[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "bug" as string, priority: "medium" as string });
  const [activeTicket, setActiveTicket] = useState<Tables<"tickets"> | null>(null);
  const [responses, setResponses] = useState<Tables<"ticket_responses">[]>([]);
  const [reply, setReply] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const reload = async () => {
    if (!clientId) return;
    const { data } = await supabase.from("tickets").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
    setTickets(data ?? []);
  };

  useEffect(() => {
    if (!clientId) return;
    reload().then(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // Realtime: replies to active ticket
  useEffect(() => {
    if (!activeTicket) return;
    const load = async () => {
      const { data } = await supabase.from("ticket_responses").select("*").eq("ticket_id", activeTicket.id).order("created_at");
      setResponses(data ?? []);
    };
    load();
    const ch = supabase.channel(`ticket-${activeTicket.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_responses", filter: `ticket_id=eq.${activeTicket.id}` },
        (p) => setResponses((prev) => [...prev, p.new as Tables<"ticket_responses">]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeTicket]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [responses]);

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
    reload();
  };

  const sendReply = async () => {
    if (!reply.trim() || !activeTicket || !user) return;
    const { error } = await supabase.from("ticket_responses").insert({
      ticket_id: activeTicket.id,
      sender_id: user.id,
      sender_role: (role ?? "client") as Tables<"ticket_responses">["sender_role"],
      content: reply.trim(),
    });
    if (error) { toast.error(error.message); return; }
    setReply("");
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
                  <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} onClick={() => setActiveTicket(t)} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer">
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

      {/* Ticket detail / thread */}
      <Dialog open={!!activeTicket} onOpenChange={(o) => !o && setActiveTicket(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">{activeTicket?.title}</DialogTitle>
          </DialogHeader>
          {activeTicket && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <span className="badge-cyan px-2 py-0.5 rounded-full capitalize">{activeTicket.category.replace("_", " ")}</span>
                <span className={`px-2 py-0.5 rounded-full capitalize ${priorityColors[activeTicket.priority]}`}>{activeTicket.priority}</span>
                <span className="px-2 py-0.5 rounded-full capitalize" style={statusStyles[activeTicket.status] && { background: statusStyles[activeTicket.status].bg, color: statusStyles[activeTicket.status].text, border: `1px solid ${statusStyles[activeTicket.status].border}` }}>
                  {activeTicket.status.replace("_", " ")}
                </span>
              </div>
              <p className="font-body text-sm text-text-secondary border-l-2 border-border pl-3">{activeTicket.description}</p>
              <div className="flex-1 overflow-y-auto space-y-3 border-t border-border pt-3">
                {responses.length === 0 && <p className="font-body text-xs text-text-muted text-center py-4">No replies yet.</p>}
                {responses.map((r) => {
                  const mine = r.sender_id === user?.id;
                  return (
                    <div key={r.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-md rounded-xl px-3 py-2 ${mine ? "bg-primary/20 border border-primary/30" : "bg-secondary border border-border"}`}>
                        <p className="font-body text-[10px] text-text-muted mb-1 capitalize">{mine ? "You" : r.sender_role}</p>
                        <p className="font-body text-sm text-foreground">{r.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="flex items-center gap-2 border-t border-border pt-3">
                <Input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()} placeholder="Reply..." className="bg-secondary border-border font-body" />
                <Button size="icon" onClick={sendReply} disabled={!reply.trim()}><Send size={16} /></Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortalSupport;
