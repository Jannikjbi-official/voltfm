import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { requireUser } from "@/lib/session";
import { serverEnv } from "@/lib/env";
import { PasskeyManager } from "./passkey-manager";
import { ConnectedAccounts } from "./connected-accounts";
import { SignOutButton } from "./sign-out-button";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Konto",
  robots: { index: false, follow: false },
};

export default async function KontoPage(props: PageProps<"/konto">) {
  // Server-side gate. There is no client check standing in for this.
  const [user, params] = await Promise.all([requireUser("/konto"), props.searchParams]);

  /* Better Auth sends the browser back here after the Discord round-trip, with
     the outcome in the query string. */
  const linkNotice =
    params.verknuepft === "discord"
      ? ("linked" as const)
      : params.fehler === "discord"
        ? ("failed" as const)
        : null;

  const profile = user as typeof user & { username?: string | null; role?: string | null };

  return (
    <>
      <PageHeader
        eyebrow="Dein Konto"
        title={profile.name || profile.username || "Konto"}
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/konto", label: "Konto" },
        ]}
      />

      <section className="section shell">
        <div className={styles.layout}>
          <section className={styles.block} aria-labelledby="profile-title">
            <h2 id="profile-title" className={styles.blockTitle}>
              Profil
            </h2>
            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>Username</dt>
                <dd>{profile.username ?? "—"}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Anzeigename</dt>
                <dd>{profile.name || "—"}</dd>
              </div>
              <div className={styles.fact}>
                <dt>E-Mail</dt>
                <dd>{profile.email}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Rolle</dt>
                <dd>{profile.role || "user"}</dd>
              </div>
            </dl>
          </section>

          <section className={styles.block} aria-labelledby="accounts-title">
            <h2 id="accounts-title" className={styles.blockTitle}>
              Verknüpfte Konten
            </h2>
            <p className={styles.blockText}>
              Verknüpfe Discord, um dich künftig mit einem Klick anzumelden —
              ohne Username und Passwort.
            </p>
            <ConnectedAccounts discordEnabled={serverEnv.discordEnabled} notice={linkNotice} />
          </section>

          <section className={styles.block} aria-labelledby="passkeys-title">
            <h2 id="passkeys-title" className={styles.blockTitle}>
              Passkeys
            </h2>
            <p className={styles.blockText}>
              Mit einem Passkey meldest du dich ohne Passwort an — per
              Fingerabdruck, Gesicht oder Geräte-PIN. Du kannst mehrere
              hinterlegen, zum Beispiel einen pro Gerät.
            </p>
            <PasskeyManager />
          </section>

          <section className={styles.block} aria-labelledby="session-title">
            <h2 id="session-title" className={styles.blockTitle}>
              Sitzung
            </h2>
            <p className={styles.blockText}>
              Du bist auf diesem Gerät angemeldet. Beim Abmelden wird die Sitzung
              serverseitig beendet.
            </p>
            <SignOutButton />
          </section>
        </div>
      </section>
    </>
  );
}
