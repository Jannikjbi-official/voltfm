import type { Metadata } from "next";

import { EmptyState } from "@/components/common/empty-state";
import { HostCard } from "@/components/common/host-card";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon } from "@/lib/icons";
import { PageHeader } from "@/components/common/page-header";
import { listHosts, listShows } from "@/services/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Moderatoren",
  description:
    "Die Leute hinter VoltFM: Profile, Musikgeschmack und Beiträge.",
  alternates: { canonical: "/moderatoren" },
};

export const revalidate = 3600;

export default async function ModeratorenPage() {
  const [hosts, shows] = await Promise.all([listHosts(), listShows()]);

  /* Zahlen aus den Daten, nicht geschätzt: wie viele Leute, wie viele
     Sendungen, und welche Musikrichtungen überhaupt vertreten sind. */
  const genres = [...new Set(hosts.flatMap((host) => host.genres))];

  return (
    <>
      <PageHeader
        size="large"
        title="Die Stimmen hinter VoltFM."
        description="Das sind die Leute hinter VoltFM, mit ihrer Musik und ihren Eigenheiten."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/moderatoren", label: "Moderatoren" },
        ]}
      >
        {hosts.length > 0 && (
          <dl className="mt-10 flex max-w-xl flex-wrap gap-2 sm:gap-3">
            <Stat label="Am Mikrofon" value={hosts.length} />
            {shows.length > 0 && <Stat label="Feste Sendungen" value={shows.length} />}
            {genres.length > 0 && <Stat label="Musikrichtungen" value={genres.length} />}
          </dl>
        )}
      </PageHeader>

      <section className="shell pb-16 sm:pb-24">
        {hosts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hosts.map((host) => (
              <HostCard key={host.id} host={host} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Noch keine Profile hinterlegt"
            description="Die Moderatorenprofile werden gerade eingepflegt."
          />
        )}
      </section>

      {/* --- Mitmachen -----------------------------------------------------
          Eine Karte mit dem Discord-Symbol als gelber Kachel. */}
      <section className="shell">
        <div className="surface-card flex flex-col gap-8 rounded-[2rem] p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-2xl flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-2xl bg-volt text-2xl text-ink">
              <Icon icon={DiscordIcon} />
            </span>
            <div>
              <h2 className="font-display text-[1.75rem] text-balance text-foreground sm:text-4xl">
                Du willst selbst ans Mikrofon?
              </h2>
              <p className="mt-3 text-pretty text-muted">
                Wir sind ein kleines Team und freuen uns über jede Stimme, die
                dazukommt. Vorerfahrung braucht es nicht — Lust auf Musik und
                Verlässlichkeit schon.
              </p>
            </div>
          </div>
          <ButtonLink href={site.discordUrl} external size="lg" className="shrink-0">
            <Icon icon={DiscordIcon} />
            Im Discord melden
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

/** Eine Kennzahl als Kachel: gross die Zahl, klein darunter, was sie zaehlt. */
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-card flex min-w-[7.5rem] flex-1 flex-col-reverse gap-1.5 rounded-2xl px-4 py-4 sm:flex-none sm:min-w-[10rem] sm:px-5">
      <dt className="text-xs leading-snug text-muted sm:text-sm">{label}</dt>
      <dd className="font-display text-4xl leading-none text-foreground tabular-nums sm:text-5xl">{value}</dd>
    </div>
  );
}
