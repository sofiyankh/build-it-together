import { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "./NotificationsProvider";

const fmt = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

export const NotificationBell = () => {
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative text-text-secondary hover:text-foreground transition-colors" aria-label="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-[10px] font-mono font-bold text-destructive-foreground flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0 bg-card border-border" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-display text-sm font-bold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="font-body text-xs text-accent-blue hover:text-accent-cyan transition-colors">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="font-body text-xs text-text-muted">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => {
              const Inner = (
                <div className={`group px-4 py-3 border-b border-border/50 hover:bg-secondary/50 transition-colors ${!n.read_at ? "bg-primary/5" : ""}`}>
                  <div className="flex items-start gap-2">
                    {!n.read_at && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-cyan shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium text-foreground truncate">{n.title}</p>
                      {n.body && <p className="font-body text-xs text-text-secondary mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="font-mono text-[10px] text-text-muted mt-1">{fmt(n.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read_at && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); markRead(n.id); }} className="p-1 text-text-muted hover:text-success" aria-label="Mark read">
                          <Check size={12} />
                        </button>
                      )}
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(n.id); }} className="p-1 text-text-muted hover:text-destructive" aria-label="Delete">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
              return n.link ? (
                <Link key={n.id} to={n.link} onClick={() => { setOpen(false); if (!n.read_at) markRead(n.id); }} className="block">
                  {Inner}
                </Link>
              ) : (
                <div key={n.id}>{Inner}</div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
