import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "./types";

/**
 * Pure auth service — no React. All auth I/O lives here so UI components stay thin.
 */
export const authService = {
  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  },

  async signUp(email: string, password: string, displayName?: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/portal`,
        data: displayName ? { display_name: displayName } : undefined,
      },
    });
    return { error };
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  },

  /**
   * Server-side role verification — calls the SECURITY DEFINER `has_role` RPC.
   * Use this for sensitive operations (admin-only actions, role escalation, etc.)
   * even when the JWT claim already says the user has the role.
   */
  async verifyRoleServerSide(role: AppRole): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: role,
    });
    if (error) return false;
    return data === true;
  },
};
