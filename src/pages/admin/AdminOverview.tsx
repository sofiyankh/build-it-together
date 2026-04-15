import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, FolderOpen, Receipt, TrendingUp, MessageCircle, AlertTriangle } from "lucide-react";

const item = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const AdminOverview = () => {
  const [stats, setStats] = useState({ clients: 0, projects: 0, revenue: 0, openTickets: 0 });

  useEffect(() => {
    const load = async () => {
      const [clientsRes, projectsRes, invoicesRes, ticketsRes] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact" }),
        supabase.from("projects").select("id", { count: "exact" }),
        supabase.from("invoices").select("total").eq("status", "paid"),
        supabase.from("tickets").select("id", { count: "exact" }).in("status", ["open", "in_progress"]),
      ]);
      const revenue = (invoicesRes.data ?? []).reduce((s, i) => s + Number(i.total), 0);
      setStats({
        clients: clientsRes.count ?? 0,
        projects: projectsRes.count ?? 0,
        revenue,
        openTickets: ticketsRes.count ?? 0,
      });
    };
    load();
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

  const cards = [
    { label: "Total Clients", value: String(stats.clients), icon: Users, color: "text-accent-blue" },
    { label: "Active Projects", value: String(stats.projects), icon: FolderOpen, color: "text-accent-cyan" },
    { label: "Total Revenue", value: fmt(stats.revenue), icon: TrendingUp, color: "text-success" },
    { label: "Open Tickets", value: String(stats.openTickets), icon: AlertTriangle, color: "text-warning" },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-h2 font-bold text-foreground mb-1">Admin Overview</h1>
        <p className="font-body text-text-secondary">High-level view of your agency.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((s, i) => (
          <motion.div key={s.label} variants={item} initial="initial" animate="animate" transition={{ delay: i * 0.07 }} className="card-agency p-5">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={20} strokeWidth={1.5} className={s.color} />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
            <p className="font-body text-xs text-text-secondary mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
