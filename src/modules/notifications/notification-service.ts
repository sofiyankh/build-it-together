import { supabase } from "@/integrations/supabase/client";
import type { AppNotification } from "./types";

export const notificationService = {
  async list(userId: string, limit = 50): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as AppNotification[];
  },

  async unreadCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null);
    return count ?? 0;
  },

  async markRead(id: string) {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  },

  async markAllRead(userId: string) {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);
  },

  async remove(id: string) {
    await supabase.from("notifications").delete().eq("id", id);
  },
};
