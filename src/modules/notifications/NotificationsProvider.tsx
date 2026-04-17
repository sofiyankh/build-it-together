import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth";
import { toast } from "sonner";
import { notificationService } from "./notification-service";
import type { AppNotification } from "./types";

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationsProvider>");
  return ctx;
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setNotifications([]); return; }
    setLoading(true);
    try {
      setNotifications(await notificationService.list(user.id));
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => { refresh(); }, [refresh]);

  // Realtime WebSocket subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as AppNotification;
          setNotifications((prev) => [n, ...prev]);
          toast(n.title, { description: n.body ?? undefined });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as AppNotification;
          setNotifications((prev) => prev.map((x) => (x.id === n.id ? n : x)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => prev.filter((x) => x.id !== (payload.old as { id: string }).id));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markRead = useCallback(async (id: string) => { await notificationService.markRead(id); }, []);
  const markAllRead = useCallback(async () => { if (user) await notificationService.markAllRead(user.id); }, [user]);
  const remove = useCallback(async (id: string) => { await notificationService.remove(id); }, []);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, loading, markRead, markAllRead, remove, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
};
