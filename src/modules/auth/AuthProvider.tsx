import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "./auth-service";
import { extractRoleFromToken } from "./decode-jwt";
import type { AppRole, AuthState } from "./types";

interface AuthContextValue extends AuthState {
  signIn: typeof authService.signIn;
  signUp: typeof authService.signUp;
  signOut: typeof authService.signOut;
  resetPassword: typeof authService.resetPassword;
  updatePassword: typeof authService.updatePassword;
  hasRole: (role: AppRole) => boolean;
  verifyRoleServerSide: (role: AppRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((s: Session | null) => {
    setSession(s);
    setUser(s?.user ?? null);
    setRole(extractRoleFromToken(s?.access_token));
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      applySession(s);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      applySession(s);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  const hasRole = useCallback((r: AppRole) => role === r, [role]);

  const value: AuthContextValue = {
    session,
    user,
    role,
    loading,
    signIn: authService.signIn,
    signUp: authService.signUp,
    signOut: authService.signOut,
    resetPassword: authService.resetPassword,
    updatePassword: authService.updatePassword,
    hasRole,
    verifyRoleServerSide: authService.verifyRoleServerSide,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
