import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Download, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useClientId } from "@/hooks/use-client-id";
import type { Tables } from "@/integrations/supabase/types";

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  draft: { bg: "rgba(107,114,128,0.12)", text: "#9CA3AF", border: "rgba(107,114,128,0.3)" },
  paid: { bg: "rgba(16,185,129,0.12)", text: "#34D399", border: "rgba(16,185,129,0.3)" },
  pending: { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
  overdue: { bg: "rgba(239,68,68,0.12)", text: "#FCA5A5", border: "rgba(239,68,68,0.3)" },
  cancelled: { bg: "rgba(107,114,128,0.12)", text: "#9CA3AF", border: "rgba(107,114,128,0.3)" },
};

const PortalBilling = () => {
  const { clientId } = useClientId();
  const [invoices, setInvoices] = useState<Tables<"invoices">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    supabase.from("invoices").select("*").eq("client_id", clientId).order("created_at", { ascending: false }).then(({ data }) => {
      setInvoices(data ?? []);
      setLoading(false);
    });
  }, [clientId]);

  const totalBilled = invoices.reduce((s, i) => s + Number(i.total), 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total), 0);
  const outstanding = totalBilled - totalPaid;

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="font-display text-h2 font-bold text-foreground">Invoices</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Billed", value: fmt(totalBilled), color: "text-foreground" },
          { label: "Total Paid", value: fmt(totalPaid), color: "text-success" },
          { label: "Outstanding", value: fmt(outstanding), color: "text-warning" },
        ].map((s) => (
          <div key={s.label} className="card-agency p-4 text-center">
            <p className="font-body text-[10px] text-text-muted mb-1">{s.label}</p>
            <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {invoices.length === 0 ? (
        <div className="card-agency p-10 text-center">
          <p className="font-body text-sm text-text-secondary">No invoices yet.</p>
        </div>
      ) : (
        <div className="card-agency overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Invoice", "Date", "Amount", "Status", "Due", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-body text-[10px] uppercase tracking-wider text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => {
                const ss = statusStyles[inv.status] || statusStyles.pending;
                return (
                  <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-accent-blue">{inv.invoice_number}</td>
                    <td className="px-4 py-3 font-body text-xs text-text-secondary">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-mono text-sm text-foreground">{fmt(Number(inv.total))}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-body px-2 py-0.5 rounded-full capitalize" style={{ background: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-text-muted">{new Date(inv.due_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {inv.pdf_url && (
                          <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-foreground transition-colors">
                            <Download size={14} />
                          </a>
                        )}
                        {inv.status === "pending" && (
                          <Button size="sm" className="text-xs h-7 font-body">
                            <CreditCard size={12} className="mr-1" /> Pay
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PortalBilling;
