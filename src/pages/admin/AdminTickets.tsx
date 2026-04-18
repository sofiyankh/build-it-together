import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
type TicketStatus = (typeof STATUSES)[number];

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  open: { bg: "rgba(239,68,68,0.12)", text: "#FCA5A5", border: "rgba(239,68,68,0.3)" },
  in_progress: { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
  resolved: { bg: "rgba(16,185,129,0.12)", text: "#34D399", border: "rgba(16,185,129,0.3)" },
  closed: { bg: "rgba(107,114,128,0.12)", text: "#9CA3AF", border: "rgba(107,114,128,0.3)" },
};
const priorityColors: Record<string, string> = { low: "text-text-muted", medium: "text-warning", high: "text-destructive", urgent: "text-destructive" };

const AdminTickets = () => {
  const { user, role } = useAuth();
  const [tickets, setTickets] = useState<Tables<"tickets">[]>([]);
  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  const [active, setActive] = useState<Tables<"tickets"> | null>(null);
  const [responses, setResponses] = useState<Tables<"ticket_responses">[]>([]);
  const [reply, setReply] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await supabase.from("tickets").select("*").order("created_at", { ascending: false });
    setTickets(data ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("admin-tickets")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    if (!active) return;
    supabase.from("ticket_responses").select("*").eq("ticket_id", active.id).order("created_at").then(({ data }) => setResponses(data ?? []));
    const ch = supabase.channel(`admin-ticket-${active.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_responses", filter: `ticket_id=eq.${active.id}` },
        (p) => setResponses((prev) => [...prev, p.new as Tables<"ticket_responses">]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [responses]);

  const updateStatus = async (id: string, status: TicketStatus) => {
    const patch: Partial<Tables<"tickets">> = { status };
    if (status === "resolved") patch.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("tickets").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Status updated"); if (active?.id === id) setActive({ ...active, ...patch } as Tables<"tickets">); }
  };

  const sendReply = async () => {
    if (!reply.trim() || !active || !user) return;
    const { error } = await supabase.from("ticket_responses").insert({
      ticket_id: active.id, sender_id: user.id,
      sender_role: (role ?? "admin") as Tables<"ticket_responses">["sender_role"],
      content: reply.trim(),
    });
    if (error) toast.error(error.message); else setReply("");
  };

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tickets.filter((t) => t.status === s).length }), {} as Record<TicketStatus, number>);

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="font-mono text-xl font-bold text-foreground uppercase tracking-wide">Support Tickets</h1>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wide border ${filter === "all" ? "bg-destructive/10 border-destructive/40 text-foreground" : "bg-card border-border text-text-secondary hover:text-foreground"}`}>
          All ({tickets.length})
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wide border ${filter === s ? "bg-destructive/10 border-destructive/40 text-foreground" : "bg-card border-border text-text-secondary hover:text-foreground"}`}>
            {s.replace("_", " ")} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-agency p-10 text-center"><p className="font-body text-sm text-text-secondary">No tickets in this view.</p></div>
      ) : (
        <div className="card-agency overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Title", "Category", "Priority", "Status", "Created", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const ss = statusStyles[t.status] || statusStyles.open;
                return (
                  <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3 font-body text-sm text-foreground cursor-pointer" onClick={() => setActive(t)}>{t.title}</td>
                    <td className="px-4 py-3"><span className="badge-cyan text-[10px] px-2 py-0.5 rounded-full capitalize">{t.category.replace("_", " ")}</span></td>
                    <td className="px-4 py-3 font-body text-xs capitalize"><span className={priorityColors[t.priority]}>{t.priority}</span></td>
                    <td className="px-4 py-3">
                      <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value as TicketStatus)} className="bg-transparent border border-border rounded px-2 py-0.5 text-[10px] font-mono uppercase" style={{ color: ss.text }}>
                        {STATUSES.map((s) => <option key={s} value={s} className="bg-card text-foreground">{s.replace("_", " ")}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-text-muted">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setActive(t)}>Open</Button></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader><DialogTitle className="font-mono text-foreground uppercase">{active?.title}</DialogTitle></DialogHeader>
          {active && (
            <>
              <p className="font-body text-sm text-text-secondary border-l-2 border-destructive/40 pl-3">{active.description}</p>
              <div className="flex-1 overflow-y-auto space-y-3 border-t border-border pt-3">
                {responses.length === 0 && <p className="font-body text-xs text-text-muted text-center py-4">No replies yet.</p>}
                {responses.map((r) => {
                  const mine = r.sender_id === user?.id;
                  return (
                    <div key={r.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-md rounded-xl px-3 py-2 ${mine ? "bg-destructive/15 border border-destructive/30" : "bg-secondary border border-border"}`}>
                        <p className="font-body text-[10px] text-text-muted mb-1 capitalize">{mine ? "You" : r.sender_role}</p>
                        <p className="font-body text-sm text-foreground">{r.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="flex items-center gap-2 border-t border-border pt-3">
                <Input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()} placeholder="Reply as admin..." className="bg-secondary border-border font-body" />
                <Button size="icon" onClick={sendReply} disabled={!reply.trim()}><Send size={16} /></Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTickets;
