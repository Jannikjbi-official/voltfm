import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type SessionUser } from "@/lib/auth";

/**
 * Server-side authorization helpers.
 *
 * Every protected surface calls one of these. Hiding UI is never treated as
 * protection: the admin layout, every admin server action and every admin API
 * route re-checks here, on the server, on each request.
 */

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

import { ADMIN_ROLES } from "@/lib/permissions";

const ADMIN_ROLE_SET = new Set<string>(ADMIN_ROLES);

export function isAdminUser(user: SessionUser | null | undefined): boolean {
  if (!user) return false;
  // `role` may hold a comma-separated list when a user has several roles.
  const roles = String((user as { role?: string }).role ?? "")
    .split(",")
    .map((r) => r.trim());
  return roles.some((r) => ADMIN_ROLE_SET.has(r));
}

/** Redirects to login unless a session exists. Returns the user otherwise. */
export async function requireUser(returnTo = "/"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(returnTo)}`);
  return user;
}

/** Redirects non-admins away. The only gate for /admin and admin actions. */
export async function requireAdmin(returnTo = "/admin"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(returnTo)}`);
  if (!isAdminUser(user)) redirect("/");
  return user;
}

/**
 * Same check for route handlers and server actions, but throwing instead of
 * redirecting so callers can return a proper status code.
 */
export async function assertAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthorizationError("Nicht angemeldet.", 401);
  if (!isAdminUser(user)) throw new AuthorizationError("Keine Berechtigung.", 403);
  return user;
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}
