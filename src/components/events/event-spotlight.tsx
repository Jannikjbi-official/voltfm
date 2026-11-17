import Link from "next/link";
import Image from "next/image";
import type { EventDTO } from "@/services/content";
import { formatTime } from "@/lib/format";
import { Icon, LocationIcon } from "@/lib/icons";
import { eventDateParts } from "./event-date";

/**
 * Der naechste Termin als grosse Karte: links ein gelbes Kalenderblatt (oder
 * das Bild des Events), rechts Titel und Beschreibung. Die ganze Karte ist
 * ueber den Titel klickbar.
 */
export function EventSpotlight({ event }: { event: EventDTO }) {
  const { day, monthLong, weekday } = eventDateParts(event.startsAt);

  return (
    <article className="group surface-card hover-lift relative grid overflow-hidden rounded-[2rem] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="relative flex min-h-56 flex-col justify-between gap-8 overflow-hidden bg-volt p-6 text-ink sm:p-8 md:min-h-[22rem]">
        {event.image && (
          <Image
            src={event.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
        {/* Mit Bild sitzt das Datum als gelbe Marke auf dem Foto. */}
        <div
          aria-hidden="true"
          className={
            event.image
              ? "relative w-fit rounded-2xl bg-volt px-4 py-3 text-ink"
              : "relative"
          }
        >
          <span className="block font-display text-[4.5rem] leading-none tabular-nums sm:text-8xl">{day}</span>
          <span className="mt-1 block text-lg font-bold">{monthLong}</span>
        </div>
        <p className={event.image ? "relative w-fit rounded-full bg-ink px-3 py-1 font-mono text-xs text-paper" : "relative font-mono text-sm"}>
          {weekday}, {formatTime(event.startsAt)} Uhr
        </p>
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-5 p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-soft-foreground">
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
