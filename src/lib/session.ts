import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type SessionUser } from "@/lib/auth";
import { ADMIN_ROLES, roles, type statement } from "@/lib/permissions";

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

const ADMIN_ROLE_SET = new Set<string>(ADMIN_ROLES);

/**
 * IDs from ADMIN_USER_IDS, the same list handed to the Better Auth admin
 * plugin. It exists to bootstrap the first admin, before any UI can grant a
 * role — so this guard has to honour it too. Checking only `role` would let
 * Better Auth's own endpoints accept the user while /admin bounced them.
 */
function bootstrapAdminIds(): Set<string> {
  return new Set(
    (process.env.ADMIN_USER_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export function isAdminUser(user: SessionUser | null | undefined): boolean {
  if (!user) return false;

  if (bootstrapAdminIds().has(user.id)) return true;

  // `role` may hold a comma-separated list when a user has several roles.
  const roles = String((user as { role?: string }).role ?? "")
    .split(",")
    .map((r) => r.trim());
  return roles.some((r) => ADMIN_ROLE_SET.has(r));
}

/* --- Feingranulare Rechte -------------------------------------------------
 *
 * `isAdminUser` beantwortet nur "darf ueberhaupt ins Admin". Wer was darf,
 * steht in lib/permissions.ts: Ein Redakteur pflegt Artikel, Kategorien,
 * Events und Medien — an Benutzer, Moderatoren, Sendungen und Einstellungen
 * kommt er nicht. Ohne diese Pruefung waere jede Rolle in ADMIN_ROLES
 * gleichbedeutend mit Vollzugriff.
 * ------------------------------------------------------------------------ */

export type Resource = keyof typeof statement;
export type ActionOf<R extends Resource> = (typeof statement)[R][number];

/** Die Rollen eines Benutzers. `role` kann mehrere enthalten, kommagetrennt. */
function rolesOf(user: SessionUser): string[] {
  // Wer ueber ADMIN_USER_IDS Admin ist, hat volle Rechte — sonst koennte sich
  // niemand aus einer verkorksten Rollenlage befreien.
  if (bootstrapAdminIds().has(user.id)) return ["owner"];

  const raw = String((user as { role?: string }).role ?? "user")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  return raw.length > 0 ? raw : ["user"];
}

/** Darf dieser Benutzer die Aktionen auf der Ressource ausfuehren? */
export function can<R extends Resource>(
  user: SessionUser | null | undefined,
  resource: R,
  actions: ActionOf<R>[],
): boolean {
  if (!user) return false;

  return rolesOf(user).some((name) => {
    const role = roles[name as keyof typeof roles];
    if (!role) return false;
    return role.authorize({ [resource]: actions } as never).success;
  });
}

/**
 * Wie `assertAdmin`, aber fuer eine konkrete Faehigkeit. Gehoert an den Anfang
 * jeder Server Action, die mehr tut als lesen.
 */
export async function assertCan<R extends Resource>(
  resource: R,
  actions: ActionOf<R>[],
): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthorizationError("Nicht angemeldet.", 401);
  if (!can(user, resource, actions)) {
    throw new AuthorizationError("Dafuer fehlen dir die Rechte.", 403);
  }
  return user;
}

/** Seiten-Variante: leitet weiter statt zu werfen. */
export async function requireCan<R extends Resource>(
  resource: R,
  actions: ActionOf<R>[],
): Promise<SessionUser> {
  const user = await requireAdmin();
  if (!can(user, resource, actions)) redirect("/admin?fehler=keine-berechtigung");
  return user;
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
  if (!isAdminUser(user)) redirect("/?fehler=keine-berechtigung");
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
