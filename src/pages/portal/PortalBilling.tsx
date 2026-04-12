import { motion } from "framer-motion";
import { Download, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockInvoices = [
  { id: "INV-2026-003", date: "Apr 1, 2026", project: "E-Commerce Platform", amount: "€7,450.00", status: "pending", due: "Apr 30, 2026" },
  { id: "INV-2026-002", date: "Mar 1, 2026", project: "E-Commerce Platform", amount: "€7,450.00", status: "paid", due: "Mar 30, 2026" },
  { id: "INV-2026-001", date: "Jan 15, 2026", project: "Website Redesign", amount: "€4,900.00", status: "paid", due: "Feb 15, 2026" },
];

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  paid: { bg: "rgba(16,185,129,0.12)", text: "#34D399", border: "rgba(16,185,129,0.3)" },
  pending: { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
  overdue: { bg: "rgba(239,68,68,0.12)", text: "#FCA5A5", border: "rgba(239,68,68,0.3)" },
};

const PortalBilling = () => (
  <div className="max-w-5xl space-y-6">
    <h1 className="font-display text-h2 font-bold text-foreground">Invoices</h1>

    {/* Summary */}
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: "Total Billed", value: "€19,800.00", color: "text-foreground" },
        { label: "Total Paid", value: "€12,350.00", color: "text-success" },
        { label: "Outstanding", value: "€7,450.00", color: "text-warning" },
      ].map((s) => (
        <div key={s.label} className="card-agency p-4 text-center">
          <p className="font-body text-[10px] text-text-muted mb-1">{s.label}</p>
          <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>

    {/* Table */}
    <div className="card-agency overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {["Invoice", "Date", "Project", "Amount", "Status", "Due", ""].map((h) => (
              <th key={h} className="px-4 py-3 text-left font-body text-[10px] uppercase tracking-wider text-text-muted">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockInvoices.map((inv, i) => {
            const ss = statusStyles[inv.status] || statusStyles.pending;
            return (
              <motion.tr
                key={inv.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-accent-blue">{inv.id}</td>
                <td className="px-4 py-3 font-body text-xs text-text-secondary">{inv.date}</td>
                <td className="px-4 py-3 font-body text-sm text-foreground">{inv.project}</td>
                <td className="px-4 py-3 font-mono text-sm text-foreground">{inv.amount}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-body px-2 py-0.5 rounded-full capitalize" style={{ background: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-body text-xs text-text-muted">{inv.due}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="text-text-muted hover:text-foreground transition-colors" aria-label="Download PDF">
                      <Download size={14} />
                    </button>
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
  </div>
);

export default PortalBilling;
