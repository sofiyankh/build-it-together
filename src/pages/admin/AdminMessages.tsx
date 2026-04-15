import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const AdminMessages = () => {
  const [projects, setProjects] = useState<Tables<"projects">[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Tables<"messages">[]>([]);

  useEffect(() => {
    supabase.from("projects").select("*").order("name").then(({ data }) => {
      const p = data ?? [];
      setProjects(p);
      if (p.length > 0) setActiveId(p[0].id);
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    supabase.from("messages").select("*").eq("project_id", activeId).order("created_at", { ascending: true }).then(({ data }) => setMessages(data ?? []));
  }, [activeId]);

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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && <p className="text-center font-body text-sm text-text-muted py-10">No messages in this project.</p>}
          {messages.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.sender_role === "client" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-md rounded-xl px-4 py-3 ${m.sender_role === "client" ? "bg-primary/20 border border-primary/30" : "bg-secondary border border-border"}`}>
                <p className="font-body text-[10px] text-text-muted mb-1 capitalize">{m.sender_role}</p>
                <p className="font-body text-sm text-foreground">{m.content}</p>
                <p className="font-body text-[10px] text-text-muted mt-1">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
