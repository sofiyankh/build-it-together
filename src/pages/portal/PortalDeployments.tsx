import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const mockDeployments = [
  { id: "1", version: "v1.3.0", env: "production" as const, url: "https://app.example.com", status: "live", date: "Apr 10, 2026", changes: ["New checkout flow", "French localization", "Performance improvements"] },
  { id: "2", version: "v1.3.0-rc.2", env: "staging" as const, url: "https://staging.example.com", status: "live", date: "Apr 8, 2026", changes: ["Checkout flow beta", "Bug fixes"] },
  { id: "3", version: "v1.2.1", env: "production" as const, url: "https://app.example.com", status: "archived", date: "Mar 28, 2026", changes: ["Hotfix: payment timeout", "Updated shipping rates"] },
];

const envColors = { staging: "border-l-accent-cyan", production: "border-l-success" };

const PortalDeployments = () => (
  <div className="max-w-4xl space-y-6">
    <h1 className="font-display text-h2 font-bold text-foreground">Deployments</h1>

    <div className="space-y-4">
      {mockDeployments.map((d, i) => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className={`card-agency p-5 border-l-4 ${envColors[d.env]}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-foreground">{d.version}</span>
              <span className="badge-cyan text-[10px] px-2 py-0.5 rounded-full">{d.env}</span>
              <span className={`text-[10px] font-body px-2 py-0.5 rounded-full ${
                d.status === "live"
                  ? "bg-success/20 text-success border border-success/30"
                  : "bg-secondary text-text-muted"
              }`}>{d.status}</span>
            </div>
            <span className="font-body text-[10px] text-text-muted">{d.date}</span>
          </div>
          <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-accent-blue hover:text-accent-cyan transition-colors mb-3">
            {d.url} <ExternalLink size={10} />
          </a>
          <div className="mt-2">
            <p className="font-body text-[10px] text-text-muted mb-1">Changelog:</p>
            <ul className="space-y-0.5">
              {d.changes.map((c) => (
                <li key={c} className="font-body text-xs text-text-secondary">• {c}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default PortalDeployments;
