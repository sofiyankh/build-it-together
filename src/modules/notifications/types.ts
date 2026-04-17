export type NotificationType =
  | "message" | "project_update" | "invoice" | "ticket" | "deployment" | "system" | "admin_action";

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}
