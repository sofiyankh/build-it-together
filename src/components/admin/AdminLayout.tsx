import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/modules/auth";
import { NotificationBell } from "@/modules/notifications";
import { LanguageToggle } from "@/components/LanguageToggle";
import {
  Activity, Users, FolderKanban, MessagesSquare, Receipt, ShieldAlert,
  Settings, LogOut, ChevronLeft, Terminal, Radio, LifeBuoy, Rocket,
} from "lucide-react";

const useNavItems = () => {
  const { t } = useTranslation();
  return [
    { label: t("admin.commandCenter"), icon: Activity, path: "/admin", group: "OPERATIONS" },
    { label: t("admin.clients"), icon: Users, path: "/admin/clients", group: "OPERATIONS" },
    { label: t("admin.projects"), icon: FolderKanban, path: "/admin/projects", group: "OPERATIONS" },
    { label: t("admin.messages"), icon: MessagesSquare, path: "/admin/messages", group: "OPERATIONS" },
    { label: t("admin.tickets"), icon: LifeBuoy, path: "/admin/tickets", group: "OPERATIONS" },
    { label: t("admin.deployments"), icon: Rocket, path: "/admin/deployments", group: "OPERATIONS" },
    { label: t("admin.finance"), icon: Receipt, path: "/admin/finance", group: "BUSINESS" },
    { label: t("admin.team"), icon: Users, path: "/admin/team", group: "BUSINESS" },
    { label: t("admin.auditLog"), icon: ShieldAlert, path: "/admin/audit", group: "SECURITY" },
    { label: t("admin.settings"), icon: Settings, path: "/admin/settings", group: "SECURITY" },
  ];
};

const groups = ["OPERATIONS", "BUSINESS", "SECURITY"];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut, role } = useAuth();
  const location = useLocation();
  const navItems = useNavItems();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) =>
    path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Subtle scanline overlay for ops feel */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 2px, hsl(var(--accent-cyan)) 2px 3px)",
        }}
      />

      <aside
        className={`fixed top-0 left-0 h-screen flex flex-col border-r border-destructive/20 bg-card/95 backdrop-blur-xl transition-all duration-200 z-40 ${
          collapsed ? "w-[64px]" : "w-[260px]"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-destructive/20">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-destructive" />
              <span className="font-mono text-sm font-bold text-foreground tracking-tight">SYS.ADMIN</span>
              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-text-muted hover:text-foreground transition-colors p-1">
            <ChevronLeft size={18} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <Radio size={10} className="text-success animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-success">ROLE: {role ?? "—"}</span>
          </div>
        )}

        <nav className="flex-1 py-2 overflow-y-auto">
          {groups.map((g) => (
            <div key={g} className="mb-3">
              {!collapsed && (
                <p className="px-4 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted/60">{g}</p>
              )}
              {navItems.filter((n) => n.group === g).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-md font-body text-sm transition-all duration-150 ${
                    isActive(item.path)
                      ? "bg-destructive/10 text-foreground border border-destructive/30 shadow-[0_0_20px_-12px_hsl(var(--destructive))]"
                      : "text-text-secondary hover:text-foreground hover:bg-secondary/60"
                  } ${collapsed ? "justify-center px-2" : ""}`}
                >
                  <item.icon size={16} strokeWidth={1.5} className={isActive(item.path) ? "text-destructive" : ""} />
                  {!collapsed && <span className="flex-1 font-mono text-xs uppercase tracking-wide">{item.label}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-destructive/20 p-3">
          {collapsed ? (
            <button onClick={signOut} className="w-full flex justify-center text-text-muted hover:text-destructive transition-colors">
              <LogOut size={18} />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-destructive/20 border border-destructive/40 flex items-center justify-center text-xs font-mono font-bold text-foreground">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-foreground truncate">{user?.email?.split("@")[0]}</p>
                <p className="font-mono text-[10px] text-destructive/70 uppercase">root@admin</p>
              </div>
              <button onClick={signOut} className="text-text-muted hover:text-destructive transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className={`flex-1 flex flex-col transition-all duration-200 relative z-10 ${collapsed ? "ml-[64px]" : "ml-[260px]"}`}>
        <header className="h-16 flex items-center justify-between px-6 border-b border-destructive/20 bg-background/60 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">/admin</span>
            <span className="text-text-muted">›</span>
            <span className="font-mono text-xs text-foreground uppercase tracking-wide">
              {navItems.find((n) => isActive(n.path))?.label || "Command Center"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle variant="compact" />
            <NotificationBell />
            <Link to="/portal" className="font-mono text-[10px] text-accent-cyan hover:text-accent-blue transition-colors uppercase tracking-widest">
              ↗ Client Portal
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
