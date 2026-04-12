import { motion } from "framer-motion";
import { FolderOpen, ArrowUpRight, Clock, Calendar } from "lucide-react";

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  planning: { bg: "rgba(99,102,241,0.15)", text: "#818CF8", border: "rgba(99,102,241,0.3)" },
  design: { bg: "rgba(6,182,212,0.12)", text: "#22D3EE", border: "rgba(6,182,212,0.3)" },
  development: { bg: "rgba(37,99,235,0.15)", text: "#60A5FA", border: "rgba(37,99,235,0.3)" },
  testing: { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
  live: { bg: "rgba(16,185,129,0.20)", text: "#10B981", border: "rgba(16,185,129,0.4)" },
};

const mockProjects = [
  { id: "1", name: "E-Commerce Platform", type: "SaaS", status: "development", start: "Jan 15, 2026", deadline: "May 30, 2026", progress: 45 },
  { id: "2", name: "AI Content Generator", type: "AI Tool", status: "design", start: "Mar 1, 2026", deadline: "Jul 15, 2026", progress: 20 },
  { id: "3", name: "Company Website Redesign", type: "Web App", status: "live", start: "Nov 1, 2025", deadline: "Jan 10, 2026", progress: 100 },
];

const PortalProjects = () => (
  <div className="max-w-6xl space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="font-display text-h2 font-bold text-foreground">My Projects</h1>
    </div>

    <div className="grid gap-4">
      {mockProjects.map((p, i) => {
        const sc = statusColors[p.status] || statusColors.planning;
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card-agency p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FolderOpen size={20} className="text-accent-cyan" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-body text-sm font-bold text-foreground truncate">{p.name}</h3>
                <span className="font-body text-[10px] px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
                <span className="badge-cyan text-[10px] px-2 py-0.5 rounded-full hidden sm:inline">{p.type}</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-body text-text-muted">
                <span className="flex items-center gap-1"><Calendar size={12} /> {p.start}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> Due {p.deadline}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-24">
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-[10px] text-text-muted">{p.progress}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-accent-blue" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
              <ArrowUpRight size={16} className="text-text-muted group-hover:text-accent-cyan transition-colors" />
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

export default PortalProjects;
