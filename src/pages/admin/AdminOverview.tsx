import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Users, FolderOpen, AlertTriangle, TrendingUp, Cpu, Database, Radio } from "lucide-react";

interface Activity { id: string; action: string; created_at: string; actor_id: string }

const AdminOverview = () => {
  const [stats, setStats] = useState({ clients: 0, projects: 0, revenue: 0, openTickets: 0, msgs24h: 0, deployments: 0 });
  const [activity, setActivity] = useState<Activity[]>([]);
  const [series, setSeries] = useState<number[]>([]);

  useEffect(() => {
    const load = async () => {
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const [clients, projects, invoices, tickets, msgs, deploys, audit] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("invoices").select("total").eq("status", "paid"),
        supabase.from("tickets").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
        supabase.from("messages").select("id", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("deployments").select("id", { count: "exact", head: true }),
        supabase.from("admin_audit_log").select("id, action, created_at, actor_id").order("created_at", { ascending: false }).limit(8),
      ]);
      const revenue = (invoices.data ?? []).reduce((s, i) => s + Number(i.total), 0);
      setStats({
        clients: clients.count ?? 0,
        projects: projects.count ?? 0,
        revenue,
        openTickets: tickets.count ?? 0,
        msgs24h: msgs.count ?? 0,
        deployments: deploys.count ?? 0,
      });
      setActivity((audit.data ?? []) as Activity[]);
    };
    load();

    // Generate fake live sparkline ticking
    const t = setInterval(() => {
      setSeries((prev) => {
        const next = [...prev, 30 + Math.random() * 70];
        return next.slice(-40);
      });
    }, 800);
    return () => clearInterval(t);
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const panels = [
    { label: "ACTIVE.CLIENTS", value: String(stats.clients), icon: Users, accent: "text-accent-cyan", glow: "shadow-[0_0_30px_-15px_hsl(var(--accent-cyan))]" },
    { label: "PROJECTS.LIVE", value: String(stats.projects), icon: FolderOpen, accent: "text-accent-blue", glow: "shadow-[0_0_30px_-15px_hsl(var(--accent-blue))]" },
    { label: "REVENUE.TOTAL", value: fmt(stats.revenue), icon: TrendingUp, accent: "text-success", glow: "shadow-[0_0_30px_-15px_hsl(var(--success))]" },
    { label: "TICKETS.OPEN", value: String(stats.openTickets), icon: AlertTriangle, accent: "text-warning", glow: "shadow-[0_0_30px_-15px_hsl(var(--warning))]" },
    { label: "MSGS.24H", value: String(stats.msgs24h), icon: Radio, accent: "text-accent-cyan", glow: "shadow-[0_0_30px_-15px_hsl(var(--accent-cyan))]" },
    { label: "DEPLOYS.TOTAL", value: String(stats.deployments), icon: Cpu, accent: "text-accent-blue", glow: "shadow-[0_0_30px_-15px_hsl(var(--accent-blue))]" },
  ];

  // Sparkline points
  const max = Math.max(100, ...series);
  const points = series.map((v, i) => `${(i / Math.max(1, series.length - 1)) * 100},${100 - (v / max) * 100}`).join(" ");

  return (
    <div className="space-y-6">
      {/* Alert ribbon */}
      <div className="border border-destructive/30 bg-destructive/5 rounded-lg px-4 py-2 flex items-center gap-3">
        <Radio size={12} className="text-destructive animate-pulse" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-destructive">SYSTEM STATUS</span>
        <span className="font-mono text-xs text-foreground">All services operational · {stats.openTickets} unresolved tickets</span>
        <span className="ml-auto font-mono text-[10px] text-text-muted">{new Date().toISOString().slice(0, 19).replace("T", " ")}</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-text-muted mb-1">[01] OVERVIEW</h1>
        <h2 className="font-display text-h2 font-bold text-foreground">Command Center</h2>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {panels.map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`border border-border bg-card/60 backdrop-blur rounded-lg p-4 hover:border-destructive/30 transition-all ${p.glow}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p.icon size={14} strokeWidth={1.5} className={p.accent} />
              <span className="font-mono text-[8px] text-text-muted">[{String(i + 1).padStart(2, "0")}]</span>
            </div>
            <p className="font-mono text-xl font-bold text-foreground tracking-tight">{p.value}</p>
            <p className="font-mono text-[9px] text-text-muted mt-1 tracking-wider">{p.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Multi-panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live activity graph */}
        <div className="lg:col-span-2 border border-border bg-card/60 backdrop-blur rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-accent-cyan" />
              <span className="font-mono text-xs uppercase tracking-widest text-foreground">REQ.PER.SEC</span>
            </div>
            <span className="font-mono text-[10px] text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> LIVE
            </span>
          </div>
          <div className="h-40 relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent-cyan))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--accent-cyan))" stopOpacity="0" />
                </linearGradient>
              </defs>
              {points && (
                <>
                  <polyline fill="none" stroke="hsl(var(--accent-cyan))" strokeWidth="0.5" points={points} />
                  <polygon fill="url(#g1)" points={`0,100 ${points} 100,100`} />
                </>
              )}
              {[20, 40, 60, 80].map((y) => (
                <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="hsl(var(--border))" strokeWidth="0.2" strokeDasharray="0.5,0.5" />
              ))}
            </svg>
          </div>
        </div>

        {/* Recent admin actions */}
        <div className="border border-border bg-card/60 backdrop-blur rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database size={14} className="text-destructive" />
            <span className="font-mono text-xs uppercase tracking-widest text-foreground">AUDIT.STREAM</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {activity.length === 0 ? (
              <p className="font-mono text-[10px] text-text-muted">No admin actions yet.</p>
            ) : (
              activity.map((a) => (
                <div key={a.id} className="flex items-center gap-2 py-1 border-b border-border/30 last:border-0">
                  <span className="w-1 h-1 bg-destructive rounded-full" />
                  <span className="font-mono text-[10px] text-foreground flex-1 truncate">{a.action}</span>
                  <span className="font-mono text-[9px] text-text-muted">{new Date(a.created_at).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
