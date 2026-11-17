import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireCan } from "@/lib/session";
import { UserTable, type AdminUser } from "./user-table";
import { setUserRole, setUserBanned, revokeUserSessions } from "./actions";
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "./roles";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const metadata: Metadata = { title: "Benutzer · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Raw shape Better Auth returns; only the fields this page renders. */
interface RawUser {
  id: string;
  name?: string | null;
  email: string;
  username?: string | null;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  createdAt?: Date | string | null;
}

export default async function AdminUsersPage() {
  const me = await requireCan("user", ["list"]);

  /* Read through Better Auth's admin API rather than querying the user
     collection directly, so its own permission checks still apply. */
  let raw: RawUser[] = [];
  let error: string | null = null;

  try {
    const result = await auth.api.listUsers({
      headers: await headers(),
      query: { limit: 200, sortBy: "createdAt", sortDirection: "desc" },
    });
    raw = (result?.users ?? []) as RawUser[];
  } catch (listError) {
    console.error("[admin] listUsers failed", listError);
    error = "Benutzer konnten nicht geladen werden.";
  }

  const bootstrapIds = new Set(
    (process.env.ADMIN_USER_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );

  const users: AdminUser[] = raw.map((user) => ({
    id: user.id,
    name: user.name ?? "",
    email: user.email,
    username: user.username ?? null,
    role: user.role ?? "user",
    banned: Boolean(user.banned),
    banReason: user.banReason ?? null,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
    isSelf: user.id === me.id,
    bootstrapAdmin: bootstrapIds.has(user.id),
  }));

  return (
    <>
      <AdminPageHeader
        title="Benutzer"
        description="Rollen vergeben, sperren und Sitzungen beenden."
      />

      {error ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
          {error}
        </p>
      ) : users.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
          Noch keine Benutzer registriert.
        </p>
      ) : (
        <UserTable
          users={users}
          roles={ASSIGNABLE_ROLES}
          roleLabels={ROLE_LABELS}
          setRoleAction={setUserRole}
          banAction={setUserBanned}
          revokeAction={revokeUserSessions}
        />
      )}
    </>
  );
}
