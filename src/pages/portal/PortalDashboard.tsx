import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useClientId } from "@/hooks/use-client-id";
import {
  FolderOpen, MessageCircle, AlertTriangle, Receipt,
  Send, Upload, LifeBuoy, ArrowUpRight, CheckCircle2,
  Clock, Code, Palette, TestTube, Rocket,
} from "lucide-react";
import { Link } from "react-router-dom";

const statusSteps = [
  { label: "Planning", icon: Clock, key: "planning" },
  { label: "Design", icon: Palette, key: "design" },
  { label: "Development", icon: Code, key: "development" },
  { label: "Testing", icon: TestTube, key: "testing" },
  { label: "Deployment", icon: Rocket, key: "deployment" },
  { label: "Live", icon: CheckCircle2, key: "live" },
];

const quickActions = [
  { label: "Send a Message", icon: Send, path: "/portal/messages" },
  { label: "Upload File", icon: Upload, path: "/portal/files" },
  { label: "Create Ticket", icon: LifeBuoy, path: "/portal/support" },
];

const item = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const PortalDashboard = () => {
  const { user } = useAuth();
  const { clientId } = useClientId();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Client";

  const [stats, setStats] = useState({ projects: 0, messages: 0, tickets: 0, invoices: 0 });
  const [latestProject, setLatestProject] = useState<{ name: string; status: string; progress: number } | null>(null);

  useEffect(() => {
    if (!clientId) return;

    const fetchStats = async () => {
      const [projectsRes, messagesRes, ticketsRes, invoicesRes] = await Promise.all([
        supabase.from("projects").select("id, name, status", { count: "exact" }).eq("client_id", clientId),
        supabase.from("messages").select("id", { count: "exact" }).is("read_at", null).eq("sender_role", "admin"),
        supabase.from("tickets").select("id", { count: "exact" }).eq("client_id", clientId).in("status", ["open", "in_progress"]),
        supabase.from("invoices").select("id", { count: "exact" }).eq("client_id", clientId).eq("status", "pending"),
      ]);

      setStats({
        projects: projectsRes.count ?? 0,
        messages: messagesRes.count ?? 0,
        tickets: ticketsRes.count ?? 0,
        invoices: invoicesRes.count ?? 0,
      });

      if (projectsRes.data && projectsRes.data.length > 0) {
        const p = projectsRes.data[0];
        const stepIndex = statusSteps.findIndex((s) => s.key === p.status);
        const progress = stepIndex >= 0 ? Math.round(((stepIndex + 1) / statusSteps.length) * 100) : 0;
        setLatestProject({ name: p.name, status: p.status, progress });
      }
    };

    fetchStats();
  }, [clientId]);

  const statCards = [
    { label: "Active Projects", value: String(stats.projects), icon: FolderOpen, color: "text-accent-blue" },
    { label: "Unread Messages", value: String(stats.messages), icon: MessageCircle, color: "text-accent-cyan" },
    { label: "Open Tickets", value: String(stats.tickets), icon: AlertTriangle, color: "text-warning" },
    { label: "Pending Invoices", value: String(stats.invoices), icon: Receipt, color: "text-success" },
  ];

  const currentStepIndex = latestProject ? statusSteps.findIndex((s) => s.key === latestProject.status) : -1;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-6 md:p-8 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(221 83% 53% / 0.15) 0%, hsl(187 92% 43% / 0.08) 100%)" }}
      >
        <div className="relative z-10">
          <h1 className="font-display text-h2 font-bold text-foreground mb-1">Welcome back, {displayName}</h1>
          <p className="font-body text-text-secondary mb-4">Here's what's happening with your projects.</p>
          {latestProject && (
            <div className="flex items-center gap-3">
              <span className="badge-cyan text-xs font-body font-medium px-3 py-1 rounded-full">{latestProject.name}</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-body px-3 py-1 rounded-full capitalize"
                style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.3)" }}>
                {latestProject.status}
              </span>
            </div>
          )}
        </div>
        {latestProject && (
          <div className="mt-6 relative z-10">
            <div className="flex justify-between mb-2">
              <span className="font-body text-xs text-text-secondary">Progress</span>
              <span className="font-mono text-xs text-accent-cyan">{latestProject.progress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${latestProject.progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full" style={{ background: "linear-gradient(90deg, hsl(221 83% 53%), hsl(187 92% 43%))" }} />
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} variants={item} initial="initial" animate="animate" transition={{ delay: i * 0.07 }} className="card-agency p-5">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={20} strokeWidth={1.5} className={s.color} />
              <ArrowUpRight size={14} className="text-text-muted" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
            <p className="font-body text-xs text-text-secondary mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Timeline */}
      {latestProject && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-agency p-6">
          <h2 className="font-body text-sm font-bold text-foreground mb-6">Project Timeline — {latestProject.name}</h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => {
              const done = i < currentStepIndex;
              const active = i === currentStepIndex;
              return (
                <div key={step.label} className="flex flex-col items-center flex-1 relative">
                  {i > 0 && (
                    <div className={`absolute top-4 right-1/2 w-full h-px ${done || active ? "bg-accent-blue" : "bg-border"}`} style={{ transform: "translateX(-50%)" }} />
                  )}
                  <div className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                    active ? "bg-accent-blue/20 border border-accent-blue text-accent-blue"
                      : done ? "bg-success/20 text-success"
                      : "bg-secondary text-text-muted"
                  }`}>
                    {done ? <CheckCircle2 size={16} /> : <step.icon size={16} />}
                  </div>
                  <span className={`font-body text-[10px] text-center ${active ? "text-accent-blue font-medium" : "text-text-muted"}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map((action, i) => (
          <motion.div key={action.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.07 }}>
            <Link to={action.path} className="card-agency p-5 flex items-center gap-4 group block">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <action.icon size={20} className="text-accent-cyan" />
              </div>
              <span className="font-body text-sm font-medium text-foreground">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PortalDashboard;
