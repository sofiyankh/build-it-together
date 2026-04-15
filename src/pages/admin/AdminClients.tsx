import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  active: { bg: "rgba(16,185,129,0.12)", text: "#34D399", border: "rgba(16,185,129,0.3)" },
  paused: { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
  churned: { bg: "rgba(239,68,68,0.12)", text: "#FCA5A5", border: "rgba(239,68,68,0.3)" },
};

const AdminClients = () => {
  const [clients, setClients] = useState<(Tables<"clients"> & { profile_name?: string })[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: clientData } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (!clientData) return;
      // Fetch profiles for names
      const userIds = clientData.map((c) => c.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
      const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name]));
      setClients(clientData.map((c) => ({ ...c, profile_name: profileMap.get(c.user_id) || "—" })));
    };
    load();
  }, []);

  const filtered = clients.filter((c) =>
    (c.profile_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.company_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-bold text-foreground">Clients</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="h-9 rounded-md border border-border bg-secondary text-foreground font-body text-sm px-3 w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="card-agency overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Name", "Company", "Country", "Status", "Joined"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-body text-[10px] uppercase tracking-wider text-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const ss = statusColors[c.status] || statusColors.active;
              return (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-body text-sm text-foreground">{c.profile_name}</td>
                  <td className="px-4 py-3 font-body text-sm text-text-secondary">{c.company_name || "—"}</td>
                  <td className="px-4 py-3 font-body text-xs text-text-muted">{c.country}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-body px-2 py-0.5 rounded-full capitalize" style={{ background: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center font-body text-sm text-text-muted">No clients found.</p>}
      </div>
    </div>
  );
};

export default AdminClients;
