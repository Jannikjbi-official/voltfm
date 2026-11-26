import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

import { cn } from "@heroui/react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ButtonLink } from "@/components/common/button-link";
import { eventDateParts } from "@/components/events/event-date";
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
  const isCancelled = event.status === "cancelled";
  const { day, monthLong, weekday, year } = eventDateParts(event.startsAt);

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

      {/* Kopf, Ticket und Inhalt in einem Raster: Am Handy steht das Ticket
          direkt unter dem Titel, am Desktop daneben und bleibt beim Lesen
          stehen. */}
      <div className="shell pt-2">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <header className="surface-card min-w-0 rounded-[var(--radius)] px-5 pt-5 pb-7 sm:px-8 sm:pt-6 sm:pb-10">
            <Breadcrumbs
              items={[
                { href: "/", label: "Start" },
                { href: "/events", label: "Events" },
                { href: `/events/${event.slug}`, label: event.title },
              ]}
            />
            <div className="mt-8 flex flex-wrap gap-2 sm:mt-12">
              <span className="rounded-[3px] bg-volt px-2 py-0.5 font-mono text-[0.7rem] font-semibold lowercase text-graphite">
                {event.category}
              </span>
              {isPast && (
                <span className="rounded-[3px] bg-default px-2 py-0.5 font-mono text-[0.7rem] font-semibold lowercase text-foreground">
                  Vergangenes Event
                </span>
              )}
              {isCancelled && (
                <span className="rounded-[3px] bg-danger-soft px-2 py-0.5 font-mono text-[0.7rem] font-semibold lowercase text-danger-soft-foreground">
                  Abgesagt
                </span>
              )}
            </div>
            <h1 className="mt-6 font-display text-[2.4rem] text-balance break-words hyphens-auto text-foreground sm:text-6xl lg:text-7xl">
              {event.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted sm:text-xl">
              {event.description}
            </p>
          </header>

          <aside
            aria-label="Termin"
            className="lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
          >
            <div className="surface-card flex flex-col gap-2 rounded-[var(--radius)] p-2">
              {/* Das Datum als Display: gelb, solange der Termin noch kommt. */}
              <div
                aria-hidden="true"
                className="display-panel display-dots flex items-end justify-between gap-4 rounded-[var(--radius)] p-5"
              >
                <div>
                  <span
                    className={cn(
                      "block font-dot text-7xl leading-none",
                      isPast || isCancelled ? "text-display-muted" : "text-volt",
                    )}
                  >
                    {day}
                  </span>
                  <span className="mt-2 block font-display text-2xl text-display-foreground">
                    {monthLong} {year}
                  </span>
                </div>
                <span className="flex items-center gap-2 pb-1 font-meta text-display-muted">
                  {!isPast && !isCancelled && <span className="led" />}
                  {weekday}
                </span>
              </div>

              <dl className="flex flex-col px-3 pt-2">
                <InfoRow icon={CalendarIcon} label="Datum">
                  {formatDate(event.startsAt)}
                </InfoRow>
                <InfoRow icon={ClockIcon} label="Uhrzeit">
                  {/* Endet es an einem anderen Tag, muss der Tag dabei
                      stehen — "18:00 – 18:00 Uhr" liest sich wie null Minuten. */}
                  {formatTime(event.startsAt)} Uhr
                  {event.endsAt &&
                    (formatDate(event.endsAt) === formatDate(event.startsAt)
                      ? ` bis ${formatTime(event.endsAt)} Uhr`
                      : ` bis ${formatDate(event.endsAt)}, ${formatTime(event.endsAt)} Uhr`)}
                </InfoRow>
                <InfoRow icon={LocationIcon} label="Ort">
                  {event.location}
                </InfoRow>
              </dl>

              <div className="well flex flex-col gap-2 rounded-[var(--radius)] p-2">
                {!isPast && (
                  <ButtonLink href={event.url ?? site.discordUrl} external fullWidth>
                    Teilnehmen
                    <Icon icon={ExternalLinkIcon} />
                  </ButtonLink>
                )}
                <ButtonLink href="/events" variant="secondary" size="sm" fullWidth>
                  Alle Events
                </ButtonLink>
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-2">
            {event.image && (
              <div className="surface-card rounded-[var(--radius)] p-2">
                <div className="well overflow-hidden rounded-[3px]">
                  <Image
                    src={event.image}
                    alt=""
                    width={1200}
                    height={675}
                    sizes="(max-width: 1024px) 100vw, 900px"
                    priority
                    className="h-auto w-full"
                  />
                </div>
              </div>
            )}

            <div className="surface-card rounded-[var(--radius)] px-5 py-8 sm:px-10 sm:py-12">
              <div className="max-w-[68ch]">
                {event.content ? (
                  <div className="vfm-prose" dangerouslySetInnerHTML={{ __html: event.content }} />
                ) : (
                  <p className="vfm-prose">{event.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** Eine Zeile im Ticket: Symbol in einer Mulde, Bezeichnung als Beschriftung, Wert darunter. */
function InfoRow({
  icon,
  label,
  children,
}: {
  icon: typeof CalendarIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-separator py-3 last:border-b-0">
      <span aria-hidden="true" className="well grid size-9 shrink-0 place-items-center rounded-[var(--radius)] text-xs text-muted">
        <Icon icon={icon} />
      </span>
      <div className="min-w-0">
        <dt className="font-meta text-muted">{label}</dt>
        <dd className="font-semibold break-words text-foreground">{children}</dd>
      </div>
    </div>
  );
}
