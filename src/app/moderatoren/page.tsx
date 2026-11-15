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
          <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-5">
            <Stat label="Am Mikrofon" value={hosts.length} />
            {shows.length > 0 && <Stat label="Feste Sendungen" value={shows.length} />}
            {genres.length > 0 && <Stat label="Musikrichtungen" value={genres.length} />}
          </dl>
        )}
      </PageHeader>

      <section className="shell py-12 sm:py-16">
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

      {/* --- Mitmachen ----------------------------------------------------- */}
      <section className="shell">
        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
              Du willst selbst ans Mikrofon?
            </h2>
            <p className="mt-3 text-pretty text-muted">
              Wir sind ein kleines Team und freuen uns über jede Stimme, die
              dazukommt. Vorerfahrung braucht es nicht — Lust auf Musik und
              Verlässlichkeit schon.
            </p>
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

/** Eine Kennzahl: gross die Zahl, klein darunter, was sie zaehlt. */
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse gap-1">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-display text-4xl leading-none text-foreground tabular-nums">{value}</dd>
    </div>
  );
}
