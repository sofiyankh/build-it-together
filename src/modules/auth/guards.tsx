import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import type { AppRole } from "./types";

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);
  if (loading) return <Spinner />;
  return user ? <>{children}</> : null;
};

/**
 * Role-gated route. Two-layer check:
 *  1) Fast: read `user_role` claim from JWT (already in memory)
 *  2) Authoritative: call has_role() RPC against DB to confirm
 * Both must pass to render. Prevents JWT-claim spoofing edge cases.
 */
export const RoleGuard = ({ role, children, fallback = "/portal" }: {
  role: AppRole;
  children: ReactNode;
  fallback?: string;
}) => {
  const { user, loading, hasRole, verifyRoleServerSide } = useAuth();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    if (!hasRole(role)) { navigate(fallback); return; }
    verifyRoleServerSide(role).then((ok) => {
      if (!ok) { navigate(fallback); return; }
      setVerified(true);
      setChecking(false);
    });
  }, [user, loading, role, hasRole, verifyRoleServerSide, navigate, fallback]);

  if (loading || checking) return <Spinner />;
  return verified ? <>{children}</> : null;
};
