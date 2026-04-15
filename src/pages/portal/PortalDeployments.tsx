import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useClientId } from "@/hooks/use-client-id";
import { ExternalLink } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const envColors = { staging: "border-l-accent-cyan", production: "border-l-success" };

const PortalDeployments = () => {
  const { clientId } = useClientId();
  const [deployments, setDeployments] = useState<(Tables<"deployments"> & { project_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    const load = async () => {
      // Get client projects first
      const { data: projects } = await supabase.from("projects").select("id, name").eq("client_id", clientId);
      if (!projects || projects.length === 0) { setLoading(false); return; }

      const projectIds = projects.map((p) => p.id);
      const { data } = await supabase.from("deployments").select("*").in("project_id", projectIds).order("deployed_at", { ascending: false });

      const mapped = (data ?? []).map((d) => ({
        ...d,
        project_name: projects.find((p) => p.id === d.project_id)?.name,
      }));
      setDeployments(mapped);
      setLoading(false);
    };
    load();
  }, [clientId]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-foreground">Deployments</h1>

      {deployments.length === 0 ? (
        <div className="card-agency p-10 text-center">
          <p className="font-body text-sm text-text-secondary">No deployments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deployments.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className={`card-agency p-5 border-l-4 ${envColors[d.environment] || "border-l-border"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-foreground">{d.version}</span>
                  <span className="badge-cyan text-[10px] px-2 py-0.5 rounded-full">{d.environment}</span>
                  <span className={`text-[10px] font-body px-2 py-0.5 rounded-full ${
                    d.status === "live" ? "bg-success/20 text-success border border-success/30" : "bg-secondary text-text-muted"
                  }`}>{d.status}</span>
                </div>
                <span className="font-body text-[10px] text-text-muted">{new Date(d.deployed_at).toLocaleDateString()}</span>
              </div>
              {d.project_name && <p className="font-body text-xs text-text-secondary mb-2">{d.project_name}</p>}
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-accent-blue hover:text-accent-cyan transition-colors mb-2">
                {d.url} <ExternalLink size={10} />
              </a>
              {d.changelog && (
                <div className="mt-2">
                  <p className="font-body text-[10px] text-text-muted mb-1">Changelog:</p>
                  <p className="font-body text-xs text-text-secondary">{d.changelog}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortalDeployments;
