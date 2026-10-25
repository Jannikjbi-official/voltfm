import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Badge } from "@/components/ui/badge";
import { Icon, ClockIcon, LocationIcon, CalendarIcon, ExternalLinkIcon } from "@/lib/icons";
import { getEventBySlug } from "@/services/content";
import { formatDate, formatTime } from "@/lib/format";
import { site } from "@/lib/site";
import styles from "./page.module.css";

type Params = { slug: string };

/* Kein generateStaticParams: Das Root-Layout liest das Theme-Cookie, jede
   Seite rendert also ohnehin pro Anfrage. Mit vorab erzeugten Pfaden
   behandelt Vercel jeden spaeter angelegten Slug als statische Seite, und
   die scheitert an cookies() mit DYNAMIC_SERVER_USAGE (500). So erging es
   /events/radioaid-2026 bis zum naechsten Deploy. */

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event nicht gefunden" };

  return {
    title: event.title,
    description: event.description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      type: "article",
      title: event.title,
      description: event.description,
      images: event.image ? [event.image] : undefined,
    },
  };
}

export const revalidate = 600;

export default async function EventPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const isPast = event.status === "past";

  /* Event structured data so the date can surface in search results. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startsAt,
    ...(event.endsAt ? { endDate: event.endsAt } : {}),
    eventStatus:
      event.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: { "@type": "VirtualLocation", url: event.url ?? site.discordUrl },
    organizer: { "@type": "Organization", name: site.name, url: site.url },
    ...(event.image ? { image: [event.image] } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow={event.category}
        title={event.title}
        description={event.description}
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/events", label: "Events" },
          { href: `/events/${event.slug}`, label: event.title },
        ]}
      />

      <section className="section shell">
        <div className={styles.layout}>
          <div className={styles.main}>
            {event.image && (
              <Image
                src={event.image}
                alt=""
                width={1200}
                height={675}
                priority
                className={styles.image}
              />
            )}

            {event.content ? (
              <div
                className={styles.prose}
                dangerouslySetInnerHTML={{ __html: event.content }}
              />
            ) : (
              <p className={styles.prose}>{event.description}</p>
            )}
          </div>

          <aside className={styles.side}>
            {isPast && (
              <Badge mode="lighter" size="sm">
                Vergangenes Event
              </Badge>
            )}
            {event.status === "cancelled" && (
              <Badge variant="primary" mode="filled" size="sm">
                Abgesagt
              </Badge>
            )}

            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>
                  <Icon icon={CalendarIcon} /> Datum
                </dt>
                <dd>{formatDate(event.startsAt)}</dd>
              </div>
              <div className={styles.fact}>
                <dt>
                  <Icon icon={ClockIcon} /> Uhrzeit
                </dt>
                <dd>
                  {/* Endet es an einem anderen Tag, muss der Tag dabei
                      stehen — "18:00 – 18:00 Uhr" liest sich wie null Minuten. */}
                  {formatTime(event.startsAt)} Uhr
                  {event.endsAt &&
                    (formatDate(event.endsAt) === formatDate(event.startsAt)
                      ? ` bis ${formatTime(event.endsAt)} Uhr`
                      : ` bis ${formatDate(event.endsAt)}, ${formatTime(event.endsAt)} Uhr`)}
                </dd>
              </div>
              <div className={styles.fact}>
                <dt>
                  <Icon icon={LocationIcon} /> Ort
                </dt>
                <dd>{event.location}</dd>
              </div>
            </dl>

            {!isPast && (
              <ButtonLink
                href={event.url ?? site.discordUrl}
                external
                variant="primary"
                mode="filled"
                size="md"
              >
                Teilnehmen
                <Icon icon={ExternalLinkIcon} />
              </ButtonLink>
            )}

            <ButtonLink href="/events" variant="neutral" mode="ghost" size="sm">
              Alle Events
            </ButtonLink>
          </aside>
        </div>
      </section>
    </>
  );
}
