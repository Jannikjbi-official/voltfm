import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { EventCard } from "@/components/events/event-card";
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

      <section className="shell py-12 sm:py-16" aria-labelledby="upcoming-title">
        <h2 id="upcoming-title" className="mb-8 font-display text-3xl text-foreground sm:text-4xl">
          Kommende Events
        </h2>

        {upcoming.length > 0 ? (
          <div className="flex flex-col">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
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
          <section
            className="mt-16 border-t border-separator pt-12 sm:mt-20"
            aria-labelledby="past-title"
          >
            <h2 id="past-title" className="mb-8 font-wide text-xl font-bold text-foreground">
              Vergangene Events
            </h2>
            <div className="flex flex-col">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
      </section>
    </>
  );
}
