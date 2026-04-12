import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const priorityColors: Record<string, string> = {
  low: "text-text-muted",
  medium: "text-warning",
  high: "text-destructive",
};

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  open: { bg: "rgba(239,68,68,0.12)", text: "#FCA5A5", border: "rgba(239,68,68,0.3)" },
  in_progress: { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
  resolved: { bg: "rgba(16,185,129,0.12)", text: "#34D399", border: "rgba(16,185,129,0.3)" },
};

const mockTickets = [
  { id: "TK-001", title: "Checkout page timeout on mobile", category: "Bug", priority: "high", status: "open", updated: "2 hours ago" },
  { id: "TK-002", title: "Add export to CSV feature", category: "Feature Request", priority: "medium", status: "in_progress", updated: "1 day ago" },
  { id: "TK-003", title: "How to update billing info?", category: "Question", priority: "low", status: "resolved", updated: "3 days ago" },
];

const PortalSupport = () => (
  <div className="max-w-5xl space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="font-display text-h2 font-bold text-foreground">Support Tickets</h1>
      <Button className="font-body text-sm">
        <Plus size={16} className="mr-2" /> New Ticket
      </Button>
    </div>

    <div className="card-agency overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {["ID", "Title", "Category", "Priority", "Status", "Updated"].map((h) => (
              <th key={h} className="px-4 py-3 text-left font-body text-[10px] uppercase tracking-wider text-text-muted">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockTickets.map((t, i) => {
            const ss = statusStyles[t.status] || statusStyles.open;
            return (
              <motion.tr
                key={t.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 font-mono text-xs text-text-muted">{t.id}</td>
                <td className="px-4 py-3 font-body text-sm text-foreground">{t.title}</td>
                <td className="px-4 py-3"><span className="badge-cyan text-[10px] px-2 py-0.5 rounded-full">{t.category}</span></td>
                <td className="px-4 py-3 font-body text-xs capitalize"><span className={priorityColors[t.priority]}>{t.priority}</span></td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-body px-2 py-0.5 rounded-full" style={{ background: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>
                    {t.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 font-body text-xs text-text-muted">{t.updated}</td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default PortalSupport;
