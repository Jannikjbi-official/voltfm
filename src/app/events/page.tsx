import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { EventCard } from "@/components/events/event-card";
import { EventSpotlight } from "@/components/events/event-spotlight";
import { ButtonLink } from "@/components/common/button-link";
import { listEvents } from "@/services/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Was bei VoltFM ansteht und was schon war, mit Datum und Uhrzeit.",
  alternates: { canonical: "/events" },
};

export const revalidate = 600;

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([listEvents("upcoming"), listEvents("past")]);

  return (
    <>
      <PageHeader
        title="Events"
        description="Was bei VoltFM ansteht und was schon war, mit Datum und Uhrzeit."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/events", label: "Events" },
        ]}
        size="large"
        aside={
          <ButtonLink href={site.discordUrl} external variant="secondary">
            Im Discord dabei sein
          </ButtonLink>
        }
      />

      <section className="shell pb-12 sm:pb-16" aria-labelledby="upcoming-title">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h2 id="upcoming-title" className="font-display text-3xl text-foreground sm:text-4xl">
            Kommende Events
          </h2>
          {upcoming.length > 0 && (
            <span className="font-mono text-xs text-muted tabular-nums">{upcoming.length}</span>
          )}
        </div>

        {upcoming.length > 0 ? (
          <>
            {/* Der naechste Termin gross, die weiteren als Liste darunter. */}
            <EventSpotlight event={upcoming[0]} />
            {upcoming.length > 1 && (
              <div className="-mx-3 mt-8 grid gap-1 lg:grid-cols-2">
                {upcoming.slice(1).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="Aktuell sind keine Events geplant"
            description="Neue Termine kündigen wir zuerst im Discord an — dort verpasst du nichts."
            action={
              <ButtonLink href={site.discordUrl} external size="sm">
                Zum Discord
              </ButtonLink>
            }
          />
        )}

        {past.length > 0 && (
          <section className="mt-20 sm:mt-28" aria-labelledby="past-title">
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 id="past-title" className="text-2xl font-bold tracking-tight text-foreground">
                Vergangene Events
              </h2>
              <span className="font-mono text-xs text-muted tabular-nums">{past.length}</span>
            </div>
            <div className="surface-card rounded-3xl p-2 sm:p-3">
              <div className="grid gap-1 lg:grid-cols-2">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </section>
        )}
      </section>
    </>
  );
}
