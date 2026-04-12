import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutGrid, FolderOpen, MessageCircle, Paperclip,
  Rocket, LifeBuoy, Receipt, Settings, LogOut, ChevronLeft, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: LayoutGrid, path: "/portal" },
  { label: "My Projects", icon: FolderOpen, path: "/portal/projects" },
  { label: "Messages", icon: MessageCircle, path: "/portal/messages", badge: 3 },
  { label: "Files", icon: Paperclip, path: "/portal/files" },
  { label: "Deployments", icon: Rocket, path: "/portal/deployments" },
  { label: "Support", icon: LifeBuoy, path: "/portal/support", badge: 1 },
  { label: "Invoices", icon: Receipt, path: "/portal/billing" },
  { label: "Settings", icon: Settings, path: "/portal/settings" },
];

const PortalLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) =>
    path === "/portal"
      ? location.pathname === "/portal"
      : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen flex flex-col border-r border-border bg-card transition-all duration-200 z-40 ${
          collapsed ? "w-[60px]" : "w-[260px]"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-1">
              <span className="font-display text-lg font-bold text-foreground tracking-tight">STUDIO</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-text-muted hover:text-foreground transition-colors p-1"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft size={18} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 py-2">
            <span className="font-body text-[10px] uppercase tracking-widest text-text-muted">Client Portal</span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg font-body text-sm transition-all duration-150 ${
                isActive(item.path)
                  ? "bg-primary/10 text-foreground font-medium border border-primary/20"
                  : "text-text-secondary hover:text-foreground hover:bg-secondary"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              <item.icon size={18} strokeWidth={1.5} className={isActive(item.path) ? "text-accent-cyan" : ""} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="badge-cyan text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-border p-3">
          {collapsed ? (
            <button onClick={signOut} className="w-full flex justify-center text-text-muted hover:text-destructive transition-colors" aria-label="Sign out">
              <LogOut size={18} />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-body font-bold text-foreground">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-foreground truncate">
                  {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
                </p>
                <p className="font-body text-[10px] text-text-muted">Client</p>
              </div>
              <button onClick={signOut} className="text-text-muted hover:text-destructive transition-colors" aria-label="Sign out">
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${collapsed ? "ml-[60px]" : "ml-[260px]"}`}>
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="font-body text-sm text-text-secondary">
            {navItems.find((n) => isActive(n.path))?.label || "Dashboard"}
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-text-secondary hover:text-foreground transition-colors" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-body font-bold text-foreground">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
