import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Chip } from "@heroui/react";
import { Icon, ClockIcon, LocationIcon, CalendarIcon, ExternalLinkIcon } from "@/lib/icons";
import { getEventBySlug } from "@/services/content";
import { formatDate, formatTime } from "@/lib/format";
import { site } from "@/lib/site";

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
        title={event.title}
        description={event.description}
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/events", label: "Events" },
          { href: `/events/${event.slug}`, label: event.title },
        ]}
      />

      <section className="shell py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div className="min-w-0">
            {event.image && (
              <Image
                src={event.image}
                alt=""
                width={1200}
                height={675}
                priority
                className="mb-10 h-auto w-full rounded-2xl"
              />
            )}

            <div className="max-w-[68ch]">
              {event.content ? (
                <div className="vfm-prose" dangerouslySetInnerHTML={{ __html: event.content }} />
              ) : (
                <p className="vfm-prose">{event.description}</p>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6">
              <div className="flex flex-wrap gap-2">
                <Chip size="sm" variant="soft">
                  {event.category}
                </Chip>
                {isPast && (
                  <Chip size="sm" variant="soft">
                    Vergangenes Event
                  </Chip>
                )}
                {event.status === "cancelled" && (
                  <Chip size="sm" color="danger" variant="soft">
                    Abgesagt
                  </Chip>
                )}
              </div>

              <dl className="flex flex-col divide-y divide-separator">
                <div className="flex flex-col gap-1 pb-4">
                  <dt className="inline-flex items-center gap-2 text-sm text-muted">
                    <Icon icon={CalendarIcon} className="text-xs" /> Datum
                  </dt>
                  <dd className="font-semibold text-foreground">{formatDate(event.startsAt)}</dd>
                </div>
                <div className="flex flex-col gap-1 py-4">
                  <dt className="inline-flex items-center gap-2 text-sm text-muted">
                    <Icon icon={ClockIcon} className="text-xs" /> Uhrzeit
                  </dt>
                  <dd className="font-semibold text-foreground">
                    {/* Endet es an einem anderen Tag, muss der Tag dabei
                        stehen — "18:00 – 18:00 Uhr" liest sich wie null Minuten. */}
                    {formatTime(event.startsAt)} Uhr
                    {event.endsAt &&
                      (formatDate(event.endsAt) === formatDate(event.startsAt)
                        ? ` bis ${formatTime(event.endsAt)} Uhr`
                        : ` bis ${formatDate(event.endsAt)}, ${formatTime(event.endsAt)} Uhr`)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1 pt-4">
                  <dt className="inline-flex items-center gap-2 text-sm text-muted">
                    <Icon icon={LocationIcon} className="text-xs" /> Ort
                  </dt>
                  <dd className="font-semibold break-words text-foreground">{event.location}</dd>
                </div>
              </dl>

              <div className="flex flex-col gap-2">
                {!isPast && (
                  <ButtonLink href={event.url ?? site.discordUrl} external fullWidth>
                    Teilnehmen
                    <Icon icon={ExternalLinkIcon} />
                  </ButtonLink>
                )}
                <ButtonLink href="/events" variant="ghost" size="sm" fullWidth>
                  Alle Events
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
