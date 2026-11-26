import Link from "next/link";
import Image from "next/image";
import type { EventDTO } from "@/services/content";
import { formatTime } from "@/lib/format";
import { Icon, LocationIcon } from "@/lib/icons";
import { eventDateParts } from "./event-date";

/**
 * Der naechste Termin als grosses Modul: links ein Display mit dem Datum in
 * Punktmatrix (mit Bild: das Bild im Fenster, das Datum als Display darauf),
 * rechts Titel und Beschreibung. Die ganze Karte ist ueber den Titel klickbar.
 */
export function EventSpotlight({ event }: { event: EventDTO }) {
  const { day, monthLong, weekday } = eventDateParts(event.startsAt);

  const date = (
    <>
      <span className="flex items-center gap-2 font-meta text-display-muted">
        <span aria-hidden="true" className="led" />
        als nächstes
      </span>
      <span className="mt-auto block font-dot text-[5rem] leading-none text-volt sm:text-[7rem]">{day}</span>
      <span className="mt-2 block font-display text-3xl text-display-foreground">{monthLong}</span>
      <span className="mt-3 block font-dot text-base text-display-muted">
        {weekday}, {formatTime(event.startsAt)} Uhr
      </span>
    </>
  );

  return (
    <article className="group surface-card hover-lift relative grid gap-2 rounded-[var(--radius)] p-2 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {event.image ? (
        <div className="well relative min-h-64 overflow-hidden rounded-[3px] md:min-h-[22rem]">
          <Image
            src={event.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          {/* Mit Bild sitzt das Datum als kleines Display auf dem Foto. */}
          <div
            aria-hidden="true"
            className="display-panel absolute bottom-2 left-2 flex flex-col rounded-[var(--radius)] px-4 py-3"
          >
            <span className="font-dot text-5xl leading-none text-volt">{day}</span>
            <span className="mt-1 font-mono text-xs lowercase text-display-muted">
              {monthLong}, {formatTime(event.startsAt)} Uhr
            </span>
          </div>
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="display-panel display-dots flex min-h-64 flex-col rounded-[var(--radius)] p-5 sm:p-7 md:min-h-[22rem]"
        >
          {date}
        </div>
      )}

      <div className="flex min-w-0 flex-col justify-center gap-5 px-3 py-5 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <span className="rounded-[3px] bg-volt px-2 py-0.5 font-mono text-[0.7rem] font-semibold lowercase text-graphite">
            {event.category}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Icon icon={LocationIcon} className="text-xs" />
            <span className="truncate">{event.location}</span>
          </span>
        </div>

        <h3 className="font-display text-[2rem] text-balance break-words hyphens-auto text-foreground sm:text-5xl">
          <Link
            href={`/events/${event.slug}`}
            className="transition-colors after:absolute after:inset-0 group-hover:text-accent-text"
          >
            {event.title}
          </Link>
        </h3>

        <p className="max-w-xl text-lg leading-relaxed text-pretty text-muted">{event.description}</p>
      </div>
    </article>
  );
}
