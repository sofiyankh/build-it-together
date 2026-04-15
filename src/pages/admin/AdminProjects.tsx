import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const columns = [
  { key: "planning", label: "Planning", color: "#818CF8" },
  { key: "design", label: "Design", color: "#22D3EE" },
  { key: "development", label: "Development", color: "#60A5FA" },
  { key: "testing", label: "Testing", color: "#FCD34D" },
  { key: "deployment", label: "Deployment", color: "#C084FC" },
  { key: "live", label: "Live", color: "#10B981" },
];

const AdminProjects = () => {
  const [projects, setProjects] = useState<Tables<"projects">[]>([]);

  useEffect(() => {
    supabase.from("projects").select("*").order("created_at", { ascending: false }).then(({ data }) => setProjects(data ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-h2 font-bold text-foreground">Project Kanban</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colProjects = projects.filter((p) => p.status === col.key);
          return (
            <div key={col.key} className="min-w-[260px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="font-body text-sm font-bold text-foreground">{col.label}</span>
                <span className="font-mono text-[10px] text-text-muted ml-auto">{colProjects.length}</span>
              </div>
              <div className="space-y-3">
                {colProjects.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-agency p-4">
                    <p className="font-body text-sm font-medium text-foreground mb-1">{p.name}</p>
                    <span className="badge-cyan text-[10px] px-2 py-0.5 rounded-full capitalize">{p.type.replace("_", " ")}</span>
                    {p.deadline && <p className="font-body text-[10px] text-text-muted mt-2">Due {new Date(p.deadline).toLocaleDateString()}</p>}
                  </motion.div>
                ))}
                {colProjects.length === 0 && (
                  <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                    <p className="font-body text-[10px] text-text-muted">No projects</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminProjects;
