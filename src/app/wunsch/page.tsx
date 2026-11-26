import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, ExternalLinkIcon, MusicIcon } from "@/lib/icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Song wünschen",
  description: "Songwünsche an VoltFM laufen über das VoltFM-Portal.",
  alternates: { canonical: "/wunsch" },
};

/**
 * Songwuensche nimmt nicht diese Seite an, sondern das Portal
 * (`site.portalUrl`). Hier steht nur der Weg dorthin — kein eigenes Formular.
 */
export default function WunschPage() {
  const portalHost = new URL(site.portalUrl).host;

  return (
    <>
      <PageHeader
        title="Song wünschen"
        description="Deine Songwünsche schickst du uns über das VoltFM-Portal. Diese Seite nimmt selbst keine Wünsche an."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/wunsch", label: "Song wünschen" },
        ]}
        size="large"
      />

      <section className="shell pt-2">
        <div className="grid gap-2 lg:grid-cols-12">
          <div className="display-panel display-dots flex flex-col items-start gap-6 rounded-[var(--radius)] p-6 sm:p-10 lg:col-span-8">
            <p className="flex items-center gap-2 font-meta text-display-muted">
              <span className="led" aria-hidden="true" />
              wunschleitung
            </p>
            <h2 className="font-display text-[2rem] text-balance text-display-foreground sm:text-5xl">
              Wünsche laufen über das Portal
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-display-muted">
              Im VoltFM-Portal trägst du deinen Wunsch ein. Das Portal öffnet sich in
              einem neuen Tab.
            </p>
            <p className="font-dot text-xl break-all text-volt sm:text-2xl">{portalHost}</p>
            <a
              href={site.portalUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="key inline-flex items-center gap-3 rounded-[var(--radius)] bg-volt px-6 py-4 font-wide text-lg font-bold text-graphite sm:px-8 sm:py-5 sm:text-xl"
            >
              <Icon icon={MusicIcon} />
              Zum Portal
              <Icon icon={ExternalLinkIcon} className="text-[0.75em]" />
              <span className="sr-only"> (öffnet einen neuen Tab)</span>
            </a>
          </div>

          <div className="flex flex-col gap-2 lg:col-span-4">
            <div className="surface-card flex flex-1 flex-col items-start gap-4 rounded-[var(--radius)] p-6 sm:p-8">
              <p className="font-meta text-muted">gut zu wissen</p>
              <h2 className="font-wide text-xl font-bold text-foreground">Auch für Bewerbungen</h2>
              <p className="leading-relaxed text-muted">
                Im selben Portal schreiben wir offene Stellen aus. Mehr dazu auf{" "}
                <Link href="/mitmachen" className="font-semibold text-foreground underline underline-offset-4">
                  Mitmachen
                </Link>
                .
              </p>
            </div>
            <div className="surface-card flex flex-col items-start gap-4 rounded-[var(--radius)] p-6 sm:p-8">
              <p className="font-meta text-muted">fragen</p>
              <p className="leading-relaxed text-muted">
                Klappt etwas nicht, öffne ein Ticket im Discord ({site.supportChannelHint}).
              </p>
              <ButtonLink href={site.discordUrl} external variant="secondary" size="sm">
                <Icon icon={DiscordIcon} />
                Zum Discord
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
