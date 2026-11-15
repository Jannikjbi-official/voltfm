import { requireAdmin, can, effectiveRoleLabel } from "@/lib/session";
import { features } from "@/lib/site";
import { getAccountAvatar } from "@/services/content/account";
import { AdminShell, type ShellEntry } from "@/components/admin/shell/admin-shell";
import { AdminToasts } from "@/components/admin/admin-toasts";
import { adminNav, OVERVIEW, QUICK_CREATE, type AdminNavEntry } from "@/components/admin/nav-config";

/** Nur, was der Browser braucht — ohne die Rechte-Angabe. */
function toShell({ href, label, icon, off }: AdminNavEntry): ShellEntry {
  return { href, label, icon, off };
}

/**
 * The admin gate.
 *
 * This runs on the server for every request to any /admin route, including
 * nested ones. Hiding the admin link in the header is a convenience, never the
 * protection — this check is. Server actions and admin API routes re-check
 * independently, because a layout does not guard a POST.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, account] = await Promise.all([requireAdmin(), getAccountAvatar()]);
  const profile = user as typeof user & { username?: string | null };

  const allowed = (entry: AdminNavEntry) =>
    !entry.needs || can(user, entry.needs.resource, entry.needs.actions as never);

  const groups = adminNav(features.schedule)
    .map((group) => ({ label: group.label, items: group.items.filter(allowed).map(toShell) }))
    .filter((group) => group.items.length > 0);

  return (
    <AdminShell
      overview={toShell(OVERVIEW)}
      groups={groups}
      quick={QUICK_CREATE.filter(allowed).map(toShell)}
      user={{
        name: profile.name || profile.username || "Admin",
        role: effectiveRoleLabel(user),
        image: account.image,
      }}
    >
      {children}
      <AdminToasts />
    </AdminShell>
  );
}
