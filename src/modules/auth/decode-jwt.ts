import type { AppRole } from "./types";

/**
 * Decodes the JWT payload (no signature verification — that's done server-side).
 * Used purely to read the embedded `user_role` claim for client-side UI gating.
 * Sensitive operations MUST re-verify via verifyRoleServerSide() / has_role RPC.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function extractRoleFromToken(token: string | undefined | null): AppRole | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const role = payload?.user_role;
  if (role === "admin" || role === "developer" || role === "designer" || role === "client") {
    return role;
  }
  return null;
}
