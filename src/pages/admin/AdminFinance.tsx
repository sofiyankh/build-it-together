import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  draft: { bg: "rgba(107,114,128,0.12)", text: "#9CA3AF", border: "rgba(107,114,128,0.3)" },
  paid: { bg: "rgba(16,185,129,0.12)", text: "#34D399", border: "rgba(16,185,129,0.3)" },
  pending: { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
  overdue: { bg: "rgba(239,68,68,0.12)", text: "#FCA5A5", border: "rgba(239,68,68,0.3)" },
  cancelled: { bg: "rgba(107,114,128,0.12)", text: "#9CA3AF", border: "rgba(107,114,128,0.3)" },
};

const AdminFinance = () => {
  const [invoices, setInvoices] = useState<Tables<"invoices">[]>([]);

  useEffect(() => {
    supabase.from("invoices").select("*").order("created_at", { ascending: false }).then(({ data }) => setInvoices(data ?? []));
  }, []);

  const total = invoices.reduce((s, i) => s + Number(i.total), 0);
  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total), 0);
  const outstanding = total - paid;
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-foreground">Finance</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: fmt(total), color: "text-foreground" },
          { label: "Collected", value: fmt(paid), color: "text-success" },
          { label: "Outstanding", value: fmt(outstanding), color: "text-warning" },
        ].map((s) => (
          <div key={s.label} className="card-agency p-5 text-center">
            <p className="font-body text-[10px] text-text-muted mb-1">{s.label}</p>
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card-agency overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Invoice #", "Date", "Amount", "Status", "Due"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-body text-[10px] uppercase tracking-wider text-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => {
              const ss = statusStyles[inv.status] || statusStyles.pending;
              return (
                <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-accent-blue">{inv.invoice_number}</td>
                  <td className="px-4 py-3 font-body text-xs text-text-secondary">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-mono text-sm text-foreground">{fmt(Number(inv.total))}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-body px-2 py-0.5 rounded-full capitalize" style={{ background: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-text-muted">{new Date(inv.due_date).toLocaleDateString()}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {invoices.length === 0 && <p className="p-6 text-center font-body text-sm text-text-muted">No invoices yet.</p>}
      </div>
    </div>
  );
};

export default AdminFinance;
