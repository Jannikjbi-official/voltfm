import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { requireUser, effectiveRoleLabel } from "@/lib/session";
import { serverEnv } from "@/lib/env";
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

      <div className="shell py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <AccountBlock id="profile-title" title="Profil">
            <dl className="flex flex-col divide-y divide-separator text-sm">
              {[
                ["Username", profile.username ?? "—"],
                ["Anzeigename", profile.name || "—"],
                ["E-Mail", profile.email],
                /* Die geltende Rolle, nicht die gespeicherte: Fest
                   hinterlegte Betreiber tragen in der Datenbank "user". */
                ["Rolle", effectiveRoleLabel(user)],
              ].map(([term, value]) => (
                <div key={term} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <dt className="text-muted">{term}</dt>
                  <dd className="min-w-0 break-all font-semibold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </AccountBlock>

          <AccountBlock
            id="accounts-title"
            title="Verknüpfte Konten"
            description="Verknüpfe Discord, um dich künftig mit einem Klick anzumelden — ohne Username und Passwort."
          >
            <ConnectedAccounts discordEnabled={serverEnv.discordEnabled} notice={linkNotice} />
          </AccountBlock>

          <AccountBlock
            id="passkeys-title"
            title="Passkeys"
            description="Mit einem Passkey meldest du dich ohne Passwort an — per Fingerabdruck, Gesicht oder Geräte-PIN. Du kannst mehrere hinterlegen, zum Beispiel einen pro Gerät."
          >
            <PasskeyManager />
          </AccountBlock>

          <AccountBlock
            id="session-title"
            title="Sitzung"
            description="Du bist auf diesem Gerät angemeldet. Beim Abmelden wird die Sitzung serverseitig beendet."
          >
            <div>
              <SignOutButton />
            </div>
          </AccountBlock>
        </div>
      </div>
    </>
  );
}

/** Ein Kasten auf der Kontoseite: Ueberschrift, ein Satz, Inhalt. */
function AccountBlock({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6"
    >
      <div>
        <h2 id={id} className="font-wide text-lg font-bold text-foreground">
          {title}
        </h2>
        {description && <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
