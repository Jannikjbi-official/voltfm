import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { requireUser, effectiveRoleLabel } from "@/lib/session";
import { serverEnv } from "@/lib/env";
import { Icon, LinkIcon, PasskeyIcon, LogoutIcon, type IconDefinition } from "@/lib/icons";
import { PasskeyManager } from "./passkey-manager";
import { ConnectedAccounts } from "./connected-accounts";
import { SignOutButton } from "./sign-out-button";

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
        title={profile.name || profile.username || "Konto"}
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/konto", label: "Konto" },
        ]}
      />

      <div className="shell pt-2">
        <div className="grid items-start gap-2 lg:grid-cols-12">
          {/* Das Profil als Display, daneben die Einstellungen als Platten —
              wie die Kontoseite eines Geraets. */}
          <section
            aria-labelledby="profile-title"
            className="display-panel display-dots flex flex-col gap-6 rounded-[var(--radius)] p-5 sm:p-7 lg:sticky lg:top-[calc(var(--header-height)+1.75rem)] lg:col-span-5"
          >
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="key grid size-16 shrink-0 place-items-center rounded-[var(--radius)] bg-volt font-display text-3xl text-graphite active:translate-y-0"
              >
                {(profile.name || profile.username || "?").trim().charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="flex items-center gap-2 font-meta text-display-muted">
                  <span className="led" aria-hidden="true" />
                  angemeldet
                </p>
                <h2 id="profile-title" className="mt-1 font-display text-[2rem] text-display-foreground">
                  Profil
                </h2>
              </div>
            </div>
            <dl className="flex flex-col text-sm">
              {[
                ["Username", profile.username ?? "—"],
                ["Anzeigename", profile.name || "—"],
                ["E-Mail", profile.email],
                /* Die geltende Rolle, nicht die gespeicherte: Fest
                   hinterlegte Betreiber tragen in der Datenbank "user". */
                ["Rolle", effectiveRoleLabel(user)],
              ].map(([term, value]) => (
                <div
                  key={term}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-white/10 py-3"
                >
                  <dt className="font-meta text-display-muted">{term}</dt>
                  <dd className="min-w-0 font-mono break-all text-display-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="flex flex-col gap-2 lg:col-span-7">
            <AccountBlock
              id="accounts-title"
              icon={LinkIcon}
              title="Verknüpfte Konten"
              description="Verknüpfe Discord, um dich künftig mit einem Klick anzumelden — ohne Username und Passwort."
            >
              <ConnectedAccounts discordEnabled={serverEnv.discordEnabled} notice={linkNotice} />
            </AccountBlock>

            <AccountBlock
              id="passkeys-title"
              icon={PasskeyIcon}
              title="Passkeys"
              description="Mit einem Passkey meldest du dich ohne Passwort an — per Fingerabdruck, Gesicht oder Geräte-PIN. Du kannst mehrere hinterlegen, zum Beispiel einen pro Gerät."
            >
              <PasskeyManager />
            </AccountBlock>

            <AccountBlock
              id="session-title"
              icon={LogoutIcon}
              title="Sitzung"
              description="Du bist auf diesem Gerät angemeldet. Beim Abmelden wird die Sitzung serverseitig beendet."
            >
              <div>
                <SignOutButton />
              </div>
            </AccountBlock>
          </div>
        </div>
      </div>
    </>
  );
}

/** Eine Karte auf der Kontoseite: Symbol, Ueberschrift, ein Satz, Inhalt. */
function AccountBlock({
  id,
  icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: IconDefinition;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="surface-card flex flex-col gap-5 rounded-[var(--radius)] p-5 sm:p-7"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="well grid size-11 shrink-0 place-items-center rounded-[var(--radius)] text-foreground"
        >
          <Icon icon={icon} />
        </span>
        <div className="min-w-0">
          <h2 id={id} className="font-wide text-xl font-bold text-foreground">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
