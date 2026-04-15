import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  user_id: string;
  role: string;
  display_name: string | null;
}

const roleColors: Record<string, string> = {
  admin: "text-destructive",
  developer: "text-accent-blue",
  designer: "text-accent-cyan",
  client: "text-text-muted",
};

const AdminTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id, role").in("role", ["admin", "developer", "designer"]);
      if (!roles) return;
      const userIds = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
      const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name]));
      setMembers(roles.map((r) => ({ ...r, display_name: profileMap.get(r.user_id) || "Unknown" })));
    };
    load();
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-foreground">Team</h1>

      {members.length === 0 ? (
        <div className="card-agency p-10 text-center">
          <p className="font-body text-sm text-text-secondary">No team members found. Assign roles to users via the database.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {members.map((m, i) => (
            <motion.div key={m.user_id + m.role} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card-agency p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-display font-bold text-foreground">
                {(m.display_name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-body text-sm font-bold text-foreground">{m.display_name}</p>
                <p className={`font-body text-xs capitalize ${roleColors[m.role] || "text-text-muted"}`}>{m.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTeam;
