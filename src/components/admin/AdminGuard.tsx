// Backward-compat shim — replaced by RoleGuard in @/modules/auth.
import { RoleGuard } from "@/modules/auth";
import { ReactNode } from "react";

export const AdminGuard = ({ children }: { children: ReactNode }) => (
  <RoleGuard role="admin" fallback="/portal">{children}</RoleGuard>
);
