import { motion } from "framer-motion";
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const threads = [
  { id: "1", name: "E-Commerce Platform", unread: 2 },
  { id: "2", name: "AI Content Generator", unread: 1 },
  { id: "3", name: "General", unread: 0 },
];

const mockMessages = [
  { id: "1", sender: "Sarah (Lead Dev)", role: "team", content: "Hi! I've pushed the new checkout flow to staging. Could you test and let me know your thoughts?", time: "10:34 AM" },
  { id: "2", sender: "You", role: "client", content: "Looks great! A couple of notes — the shipping calculator seems to default to Germany. Can we set it to France?", time: "11:02 AM" },
  { id: "3", sender: "Sarah (Lead Dev)", role: "team", content: "Good catch! I'll update the default locale. Should be on staging by EOD. 👍", time: "11:15 AM" },
];

const PortalMessages = () => {
  const [activeThread, setActiveThread] = useState("1");
  const [message, setMessage] = useState("");

  return (
    <div className="max-w-6xl h-[calc(100vh-8rem)]">
      <h1 className="font-display text-h2 font-bold text-foreground mb-6">Messages</h1>

      <div className="flex h-[calc(100%-3rem)] card-agency overflow-hidden">
        {/* Thread list */}
        <div className="w-64 border-r border-border shrink-0">
          <div className="p-3">
            <p className="font-body text-[10px] uppercase tracking-widest text-text-muted mb-3">Conversations</p>
          </div>
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThread(t.id)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                activeThread === t.id ? "bg-primary/10 border-r-2 border-accent-blue" : "hover:bg-secondary"
              }`}
            >
              <span className={`font-body text-sm ${activeThread === t.id ? "text-foreground font-medium" : "text-text-secondary"}`}>
                {t.name}
              </span>
              {t.unread > 0 && (
                <span className="badge-cyan text-[10px] font-medium px-1.5 py-0.5 rounded-full">{t.unread}</span>
              )}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="text-center">
              <span className="font-body text-[10px] text-text-muted bg-secondary px-3 py-1 rounded-full">Today</span>
            </div>
            {mockMessages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "client" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-md rounded-xl px-4 py-3 ${
                  m.role === "client"
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-secondary border border-border"
                }`}>
                  <p className="font-body text-[10px] text-text-muted mb-1">{m.sender}</p>
                  <p className="font-body text-sm text-foreground">{m.content}</p>
                  <p className="font-body text-[10px] text-text-muted mt-1">{m.time}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="bg-secondary border-border text-foreground placeholder:text-text-muted font-body flex-1"
              />
              <Button size="icon" className="shrink-0">
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
