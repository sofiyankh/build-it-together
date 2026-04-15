import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useClientId } from "@/hooks/use-client-id";
import { FolderOpen, ArrowUpRight, Clock, Calendar } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  planning: { bg: "rgba(99,102,241,0.15)", text: "#818CF8", border: "rgba(99,102,241,0.3)" },
  design: { bg: "rgba(6,182,212,0.12)", text: "#22D3EE", border: "rgba(6,182,212,0.3)" },
  development: { bg: "rgba(37,99,235,0.15)", text: "#60A5FA", border: "rgba(37,99,235,0.3)" },
  testing: { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
  deployment: { bg: "rgba(168,85,247,0.15)", text: "#C084FC", border: "rgba(168,85,247,0.3)" },
  live: { bg: "rgba(16,185,129,0.20)", text: "#10B981", border: "rgba(16,185,129,0.4)" },
  paused: { bg: "rgba(107,114,128,0.15)", text: "#9CA3AF", border: "rgba(107,114,128,0.3)" },
  cancelled: { bg: "rgba(239,68,68,0.12)", text: "#FCA5A5", border: "rgba(239,68,68,0.3)" },
};

const statusOrder = ["planning", "design", "development", "testing", "deployment", "live"];

const PortalProjects = () => {
  const { clientId, loading: clientLoading } = useClientId();
  const [projects, setProjects] = useState<Tables<"projects">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    supabase
      .from("projects")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProjects(data ?? []);
        setLoading(false);
      });
  }, [clientId]);

  const getProgress = (status: string) => {
    const idx = statusOrder.indexOf(status);
    return idx >= 0 ? Math.round(((idx + 1) / statusOrder.length) * 100) : 0;
  };

  if (clientLoading || loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-foreground">My Projects</h1>

      {projects.length === 0 ? (
        <div className="card-agency p-10 text-center">
          <FolderOpen size={32} className="mx-auto text-text-muted mb-3" />
          <p className="font-body text-sm text-text-secondary">No projects yet. Start one from the home page!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((p, i) => {
            const sc = statusColors[p.status] || statusColors.planning;
            const progress = getProgress(p.status);
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card-agency p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FolderOpen size={20} className="text-accent-cyan" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-body text-sm font-bold text-foreground truncate">{p.name}</h3>
                    <span className="font-body text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                      {p.status}
                    </span>
                    <span className="badge-cyan text-[10px] px-2 py-0.5 rounded-full hidden sm:inline capitalize">{p.type.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-body text-text-muted">
                    {p.start_date && <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(p.start_date).toLocaleDateString()}</span>}
                    {p.deadline && <span className="flex items-center gap-1"><Clock size={12} /> Due {new Date(p.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-24">
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-[10px] text-text-muted">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-accent-blue" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-text-muted group-hover:text-accent-cyan transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortalProjects;
