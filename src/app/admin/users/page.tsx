import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Benutzer · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();

  /* Read through Better Auth's admin API rather than querying the user
     collection directly, so its own permission checks still apply. */
  let users: { id: string; name?: string | null; email: string; role?: string | null }[] = [];
  let error: string | null = null;

  try {
    const result = await auth.api.listUsers({
      headers: await headers(),
      query: { limit: 100 },
    });
    users = (result?.users ?? []) as typeof users;
  } catch {
    error = "Benutzer konnten nicht geladen werden.";
  }

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Benutzer</h1>
          <p className={styles.subtitle}>{users.length} Konten</p>
        </div>
      </header>

      {error ? (
        <p className={styles.empty}>{error}</p>
      ) : users.length === 0 ? (
        <p className={styles.empty}>Noch keine Benutzer registriert.</p>
      ) : (
        <ul className={styles.recent} role="list">
          {users.map((user) => (
            <li key={user.id}>
              <span className={styles.recentLink}>
                <span className={styles.recentTitle}>{user.name || user.email}</span>
                <span className={styles.recentMeta}>
                  <span className={styles.status}>{user.role || "user"}</span>
                  {user.email}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
