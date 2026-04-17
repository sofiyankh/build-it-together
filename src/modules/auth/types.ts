import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "admin" | "developer" | "designer" | "client";

export interface AuthState {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
}

export interface AuthService {
  signIn(email: string, password: string): Promise<{ error: Error | null }>;
  signUp(email: string, password: string, displayName?: string): Promise<{ error: Error | null }>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<{ error: Error | null }>;
  updatePassword(newPassword: string): Promise<{ error: Error | null }>;
  hasRole(role: AppRole): boolean;
  verifyRoleServerSide(role: AppRole): Promise<boolean>;
}
