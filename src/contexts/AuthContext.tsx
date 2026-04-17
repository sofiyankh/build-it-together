// Backward-compat shim — the auth module now lives in src/modules/auth.
// Existing imports from "@/contexts/AuthContext" continue to work.
export { AuthProvider, useAuth, ProtectedRoute, RoleGuard } from "@/modules/auth";
export type { AppRole } from "@/modules/auth";
