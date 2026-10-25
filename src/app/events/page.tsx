import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { EventCard } from "@/components/events/event-card";
import { ButtonLink } from "@/components/common/button-link";
import { listEvents } from "@/services/content";
import { site } from "@/lib/site";
import styles from "./page.module.css";

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
        eyebrow="Termine"
        title="Events"
        description="Was bei VoltFM ansteht und was schon war, mit Datum und Uhrzeit."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/events", label: "Events" },
        ]}
        size="large"
        aside={
          <ButtonLink href={site.discordUrl} external variant="primary" mode="filled" size="md">
            Im Discord dabei sein
          </ButtonLink>
        }
      />

      <section className="section shell">
        <h2 className={styles.groupTitle}>Kommende Events</h2>

        {upcoming.length > 0 ? (
          <div className={styles.list}>
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aktuell sind keine Events geplant"
            description="Neue Termine kündigen wir zuerst im Discord an — dort verpasst du nichts."
            action={
              <ButtonLink href={site.discordUrl} external variant="primary" mode="filled" size="sm">
                Zum Discord
              </ButtonLink>
            }
          />
        )}

        {past.length > 0 && (
          <section className={styles.pastSection} aria-labelledby="past-title">
            <h2 id="past-title" className={styles.groupTitle}>
              Vergangene Events
            </h2>
            <div className={styles.list}>
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
