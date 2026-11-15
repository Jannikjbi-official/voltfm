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
      <div className="shell pt-10 pb-10 sm:pt-14 sm:pb-14">
        <Breadcrumbs
          items={[
            { href: "/", label: "Start" },
            { href: "/events", label: "Events" },
            { href: `/events/${event.slug}`, label: event.title },
          ]}
        />

        <div className="mt-8 grid gap-10 sm:mt-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-16">
          <header className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-soft-foreground">
                {event.category}
              </span>
              {isPast && (
                <span className="rounded-full bg-default px-3 py-1 text-xs font-semibold text-foreground">
                  Vergangenes Event
                </span>
              )}
              {isCancelled && (
                <span className="rounded-full bg-danger-soft px-3 py-1 text-xs font-semibold text-danger-soft-foreground">
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
            className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
          >
            <div className="surface-card relative overflow-hidden rounded-3xl">
              {/* Das Kalenderblatt: gelb, solange der Termin noch kommt. */}
              <div
                aria-hidden="true"
                className={cn(
                  "flex items-end justify-between gap-4 p-6",
                  isPast || isCancelled ? "bg-surface-secondary text-foreground" : "bg-volt text-ink",
                )}
              >
                <div>
                  <span className="block font-display text-7xl leading-none tabular-nums">{day}</span>
                  <span className="mt-1 block text-lg font-bold">
                    {monthLong} {year}
                  </span>
                </div>
                <span className="pb-1 font-mono text-xs">{weekday}</span>
              </div>

              <div className="flex flex-col gap-6 p-6">
                <dl className="flex flex-col gap-4">
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

                <div className="flex flex-col gap-2">
                  {!isPast && (
                    <ButtonLink href={event.url ?? site.discordUrl} external fullWidth>
                      Teilnehmen
                      <Icon icon={ExternalLinkIcon} />
                    </ButtonLink>
                  )}
                  <ButtonLink href="/events" variant="tertiary" size="sm" fullWidth>
                    Alle Events
                  </ButtonLink>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            {event.image && (
              <div className="mb-10 overflow-hidden rounded-[2rem] border border-border bg-surface-secondary">
                <Image
                  src={event.image}
                  alt=""
                  width={1200}
                  height={675}
                  sizes="(max-width: 1024px) 100vw, 800px"
                  priority
                  className="h-auto w-full"
                />
              </div>
            )}

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
    </>
  );
}

/** Eine Zeile im Ticket: Symbol als Kachel, Bezeichnung klein, Wert darunter. */
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
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-xl bg-default text-xs text-muted">
        <Icon icon={icon} />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="font-semibold break-words text-foreground">{children}</dd>
      </div>
    </div>
  );
}
