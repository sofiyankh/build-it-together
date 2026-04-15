import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useClientId } from "@/hooks/use-client-id";
import type { Tables } from "@/integrations/supabase/types";

const PortalMessages = () => {
  const { user } = useAuth();
  const { clientId } = useClientId();
  const [projects, setProjects] = useState<Tables<"projects">[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Tables<"messages">[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load projects
  useEffect(() => {
    if (!clientId) return;
    supabase.from("projects").select("*").eq("client_id", clientId).then(({ data }) => {
      const p = data ?? [];
      setProjects(p);
      if (p.length > 0) setActiveProjectId(p[0].id);
    });
  }, [clientId]);

  // Load & subscribe to messages
  useEffect(() => {
    if (!activeProjectId) return;

    const load = async () => {
      const { data } = await supabase.from("messages").select("*").eq("project_id", activeProjectId).order("created_at", { ascending: true });
      setMessages(data ?? []);
    };
    load();

    const channel = supabase
      .channel(`messages-${activeProjectId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `project_id=eq.${activeProjectId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Tables<"messages">]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeProjectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !activeProjectId || !user) return;
    setSending(true);
    await supabase.from("messages").insert({
      project_id: activeProjectId,
      sender_id: user.id,
      sender_role: "client",
      content: message.trim(),
    });
    setMessage("");
    setSending(false);
  };

  return (
    <div className="max-w-6xl h-[calc(100vh-8rem)]">
      <h1 className="font-display text-h2 font-bold text-foreground mb-6">Messages</h1>

      <div className="flex h-[calc(100%-3rem)] card-agency overflow-hidden">
        {/* Thread list */}
        <div className="w-64 border-r border-border shrink-0">
          <div className="p-3">
            <p className="font-body text-[10px] uppercase tracking-widest text-text-muted mb-3">Projects</p>
          </div>
          {projects.length === 0 && (
            <p className="px-4 font-body text-xs text-text-muted">No projects yet</p>
          )}
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProjectId(p.id)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                activeProjectId === p.id ? "bg-primary/10 border-r-2 border-accent-blue" : "hover:bg-secondary"
              }`}
            >
              <span className={`font-body text-sm ${activeProjectId === p.id ? "text-foreground font-medium" : "text-text-secondary"}`}>
                {p.name}
              </span>
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <p className="text-center font-body text-sm text-text-muted py-10">No messages yet. Start the conversation!</p>
            )}
            {messages.map((m) => {
              const isMe = m.sender_id === user?.id;
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-md rounded-xl px-4 py-3 ${
                    isMe ? "bg-primary/20 border border-primary/30" : "bg-secondary border border-border"
                  }`}>
                    <p className="font-body text-[10px] text-text-muted mb-1">{isMe ? "You" : m.sender_role}</p>
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
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body flex-1"
              />
              <Button size="icon" className="shrink-0" onClick={handleSend} disabled={sending || !message.trim()}>
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalMessages;
