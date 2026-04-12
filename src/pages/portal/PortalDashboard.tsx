import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  FolderOpen, MessageCircle, AlertTriangle, Receipt,
  Send, Upload, LifeBuoy, ArrowUpRight, CheckCircle2,
  Clock, Code, Palette, TestTube, Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const statusSteps = [
  { label: "Planning", icon: Clock, done: true },
  { label: "Design", icon: Palette, done: true },
  { label: "Development", icon: Code, active: true },
  { label: "Testing", icon: TestTube },
  { label: "Deployment", icon: Rocket },
  { label: "Live", icon: CheckCircle2 },
];

const stats = [
  { label: "Active Projects", value: "2", icon: FolderOpen, color: "text-accent-blue" },
  { label: "Unread Messages", value: "3", icon: MessageCircle, color: "text-accent-cyan" },
  { label: "Open Tickets", value: "1", icon: AlertTriangle, color: "text-warning" },
  { label: "Pending Invoices", value: "0", icon: Receipt, color: "text-success" },
];

const recentActivity = [
  { text: "New deployment v1.3.0 is live", time: "2 hours ago", icon: Rocket },
  { text: "File uploaded: brand-guidelines.pdf", time: "5 hours ago", icon: Upload },
  { text: "Message from Sarah (Lead Dev)", time: "1 day ago", icon: MessageCircle },
  { text: "Project status → Development", time: "2 days ago", icon: Code },
];

const quickActions = [
  { label: "Send a Message", icon: Send, path: "/portal/messages" },
  { label: "Upload File", icon: Upload, path: "/portal/files" },
  { label: "Create Ticket", icon: LifeBuoy, path: "/portal/support" },
];

const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const PortalDashboard = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Client";

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-6 md:p-8 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(221 83% 53% / 0.15) 0%, hsl(187 92% 43% / 0.08) 100%)" }}
      >
        <div className="relative z-10">
          <h1 className="font-display text-h2 font-bold text-foreground mb-1">
            Welcome back, {displayName}
          </h1>
          <p className="font-body text-text-secondary mb-4">Here's what's happening with your projects.</p>
          <div className="flex items-center gap-3">
            <span className="badge-cyan text-xs font-body font-medium px-3 py-1 rounded-full">
              E-Commerce Platform
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-body px-3 py-1 rounded-full"
              style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.3)" }}>
              Development
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-6 relative z-10">
          <div className="flex justify-between mb-2">
            <span className="font-body text-xs text-text-secondary">Progress</span>
            <span className="font-mono text-xs text-accent-cyan">45%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "45%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, hsl(221 83% 53%), hsl(187 92% 43%))" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            variants={item}
            initial="initial"
            animate="animate"
            transition={{ delay: i * 0.07 }}
            className="card-agency p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon size={20} strokeWidth={1.5} className={s.color} />
              <ArrowUpRight size={14} className="text-text-muted" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
            <p className="font-body text-xs text-text-secondary mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Timeline + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Project Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 card-agency p-6"
        >
          <h2 className="font-body text-sm font-bold text-foreground mb-6">Project Timeline</h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center flex-1 relative">
                {/* Connector line */}
                {i > 0 && (
                  <div className={`absolute top-4 right-1/2 w-full h-px ${step.done || step.active ? "bg-accent-blue" : "bg-border"}`} style={{ transform: "translateX(-50%)" }} />
                )}
                <div className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                  step.active
                    ? "bg-accent-blue/20 border border-accent-blue text-accent-blue"
                    : step.done
                    ? "bg-success/20 text-success"
                    : "bg-secondary text-text-muted"
                }`}>
                  {step.done ? <CheckCircle2 size={16} /> : <step.icon size={16} />}
                </div>
                <span className={`font-body text-[10px] text-center ${step.active ? "text-accent-blue font-medium" : "text-text-muted"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card-agency p-6"
        >
          <h2 className="font-body text-sm font-bold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <a.icon size={14} className="text-text-muted" />
                </div>
                <div className="min-w-0">
                  <p className="font-body text-sm text-foreground truncate">{a.text}</p>
                  <p className="font-body text-[10px] text-text-muted">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.07 }}
          >
            <Link to={action.path} className="card-agency p-5 flex items-center gap-4 group block">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <action.icon size={20} className="text-accent-cyan" />
              </div>
              <span className="font-body text-sm font-medium text-foreground">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PortalDashboard;
