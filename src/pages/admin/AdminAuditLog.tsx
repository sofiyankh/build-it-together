import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldAlert } from "lucide-react";

interface Entry {
  id: string;
  actor_id: string;
  action: string;
  target_user_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  actor_name?: string;
  target_name?: string;
}

const AdminAuditLog = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      const list = (data ?? []) as Entry[];

      const ids = Array.from(new Set([...list.map((e) => e.actor_id), ...list.map((e) => e.target_user_id).filter(Boolean) as string[]]));
      if (ids.length) {
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ids);
        const map = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name]));
        list.forEach((e) => {
          e.actor_name = map.get(e.actor_id) ?? e.actor_id.slice(0, 8);
          e.target_name = e.target_user_id ? (map.get(e.target_user_id) ?? e.target_user_id.slice(0, 8)) : "—";
        });
      }
      setEntries(list);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-text-muted mb-1">[07] SECURITY</h1>
        <h2 className="font-display text-h2 font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="text-destructive" size={24} /> Audit Log
        </h2>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card/60 backdrop-blur">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {["TIMESTAMP", "ACTOR", "ACTION", "TARGET", "METADATA", "IP"].map((h) => (
                <th key={h} className="px-3 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-10 text-center font-mono text-xs text-text-muted">Loading…</td></tr>}
            {!loading && entries.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center font-mono text-xs text-text-muted">No admin actions recorded yet.</td></tr>
            )}
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="px-3 py-2 font-mono text-[10px] text-text-muted">{new Date(e.created_at).toISOString().replace("T", " ").slice(0, 19)}</td>
                <td className="px-3 py-2 font-mono text-xs text-foreground">{e.actor_name}</td>
                <td className="px-3 py-2"><span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/30">{e.action}</span></td>
                <td className="px-3 py-2 font-mono text-xs text-text-secondary">{e.target_name}</td>
                <td className="px-3 py-2 font-mono text-[10px] text-text-muted max-w-xs truncate">{Object.keys(e.metadata).length ? JSON.stringify(e.metadata) : "—"}</td>
                <td className="px-3 py-2 font-mono text-[10px] text-text-muted">{e.ip_address || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAuditLog;
