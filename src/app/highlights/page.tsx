import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon } from "@/lib/icons";
import { site } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { getPublicHighlights } from "@/services/discord/ideas";

export const metadata: Metadata = {
  title: "Highlights",
  description: "Ausgewählte Momente aus dem VoltFM-Discord.",
  alternates: { canonical: "/highlights" },
};

/* Die Texte kommen live aus dem Discord (höchstens einmal pro Minute gefragt). */
export const revalidate = 60;

export default async function HighlightsPage() {
  const { configured, highlights } = await getPublicHighlights();

  return (
    <>
      <PageHeader
        size="large"
        title="Highlights"
        description="Ausgewählte Momente aus dem VoltFM-Discord. Was hier steht, hat jemand aus dem Team freigegeben."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/highlights", label: "Highlights" },
        ]}
        aside={
          <ButtonLink href={site.discordUrl} external variant="secondary">
            <Icon icon={DiscordIcon} />
            Zum Discord
          </ButtonLink>
        }
      />

      <section className="shell pt-2" aria-label="Highlights aus dem Discord">
        {!configured ? (
          <EmptyState
            title="Die Highlights sind noch nicht eingerichtet"
            description="Sobald der Kanal dafür angebunden ist, stehen hier ausgewählte Momente aus unserem Discord."
          />
        ) : highlights.length === 0 ? (
          <EmptyState
            title="Noch keine Highlights ausgewählt"
            description="Hier stehen bald ausgewählte Momente aus unserem Discord. Bis dahin: schau direkt dort vorbei."
            action={
              <ButtonLink href={site.discordUrl} external size="sm">
                Zum Discord
              </ButtonLink>
            }
          />
        ) : (
          /* Kein Profilbild: das käme von Discords Servern. */
          <ul className="well grid gap-2 rounded-[var(--radius)] p-2 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
              <li key={item.id} className="surface-card flex min-w-0 flex-col gap-4 rounded-[var(--radius)] p-5">
                <p className="leading-relaxed break-words whitespace-pre-line text-foreground">{item.text}</p>
                <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-separator pt-3 text-sm text-muted">
                  <span className="font-semibold text-foreground">{item.author}</span>
                  <span className="font-mono text-xs leading-5">{formatDate(item.createdAt, "short")}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
