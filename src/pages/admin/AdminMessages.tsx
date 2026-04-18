import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth";
import type { Tables } from "@/integrations/supabase/types";

const AdminMessages = () => {
  const { user, role } = useAuth();
  const [projects, setProjects] = useState<Tables<"projects">[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Tables<"messages">[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("projects").select("*").order("name").then(({ data }) => {
      const p = data ?? [];
      setProjects(p);
      if (p.length > 0) setActiveId(p[0].id);
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const load = async () => {
      const { data } = await supabase
        .from("messages").select("*")
        .eq("project_id", activeId).order("created_at", { ascending: true });
      setMessages(data ?? []);
    };
    load();
    const ch = supabase
      .channel(`admin-msgs-${activeId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `project_id=eq.${activeId}` },
        (p) => setMessages((prev) => [...prev, p.new as Tables<"messages">]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!draft.trim() || !activeId || !user) return;
    setSending(true);
    await supabase.from("messages").insert({
      project_id: activeId,
      sender_id: user.id,
      sender_role: (role ?? "admin") as Tables<"messages">["sender_role"],
      content: draft.trim(),
    });
    setDraft("");
    setSending(false);
  };

  return (
    <div className="max-w-6xl h-[calc(100vh-8rem)]">
      <h1 className="font-display text-h2 font-bold text-foreground mb-6">All Messages</h1>
      <div className="flex h-[calc(100%-3rem)] card-agency overflow-hidden">
        <div className="w-64 border-r border-border shrink-0 overflow-y-auto">
          <div className="p-3"><p className="font-body text-[10px] uppercase tracking-widest text-text-muted mb-3">Projects</p></div>
          {projects.map((p) => (
            <button key={p.id} onClick={() => setActiveId(p.id)} className={`w-full text-left px-4 py-3 transition-colors ${activeId === p.id ? "bg-primary/10 border-r-2 border-accent-blue" : "hover:bg-secondary"}`}>
              <span className={`font-body text-sm ${activeId === p.id ? "text-foreground font-medium" : "text-text-secondary"}`}>{p.name}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && <p className="text-center font-body text-sm text-text-muted py-10">No messages in this project.</p>}
            {messages.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-md rounded-xl px-4 py-3 ${mine ? "bg-primary/20 border border-primary/30" : "bg-secondary border border-border"}`}>
                    <p className="font-body text-[10px] text-text-muted mb-1 capitalize">{mine ? "You" : m.sender_role}</p>
                    <p className="font-body text-sm text-foreground">{m.content}</p>
                    <p className="font-body text-[10px] text-text-muted mt-1">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </motion.div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <Input value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder={activeId ? "Reply to client..." : "Select a project"}
                disabled={!activeId}
                className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body flex-1" />
              <Button size="icon" onClick={send} disabled={sending || !draft.trim() || !activeId}>
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
