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

      <section className="shell pt-12 sm:pt-16" aria-labelledby="upcoming-title">
        <GroupHeader id="upcoming-title" title="Kommende Events" count={upcoming.length} />

        {upcoming.length > 0 ? (
          <>
            {/* Der naechste Termin gross, die weiteren als Raster darunter. */}
            <EventSpotlight event={upcoming[0]} />
            {upcoming.length > 1 && (
              <div className="mt-2 grid gap-2 lg:grid-cols-2">
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
      </section>

      {past.length > 0 && (
        <section className="shell pt-12 sm:pt-16" aria-labelledby="past-title">
          <GroupHeader id="past-title" title="Vergangene Events" count={past.length} />
          {/* Das Archiv liegt in einer Mulde — es ist vorbei, aber noch da. */}
          <div className="well grid gap-2 rounded-[var(--radius)] p-2 lg:grid-cols-2">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/** Abschnittskopf mit der Anzahl als kleinem Display. */
function GroupHeader({ id, title, count }: { id: string; title: string; count: number }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-5">
      <h2 id={id} className="font-display text-[2.1rem] text-balance text-foreground sm:text-5xl">
        {title}
      </h2>
      {count > 0 && (
        <span className="display-panel shrink-0 rounded-[3px] px-2.5 py-1 font-dot text-sm text-volt">
          {count}
        </span>
      )}
    </div>
  );
}
