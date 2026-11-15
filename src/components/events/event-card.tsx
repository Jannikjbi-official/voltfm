import Link from "next/link";
import { cn } from "@heroui/react";
import type { EventDTO } from "@/services/content";
import { formatTime } from "@/lib/format";
import { Icon, LocationIcon, ClockIcon } from "@/lib/icons";
import { eventDateParts } from "./event-date";

/**
 * Ein Termin als Zeile: Datum als Kalenderblatt links, Inhalt rechts, eine
 * feine Linie dazwischen. So liest sich eine Terminliste wie ein Kalender und
 * nicht wie ein Stapel Kaesten. Die ganze Zeile ist ueber den Titel klickbar.
 */
export function EventCard({ event }: { event: EventDTO }) {
  // Aus dem gespeicherten Status statt aus der Uhr: Die Uhrzeit beim Rendern
  // zu lesen waere unrein und machte die Ausgabe vom Zeitpunkt abhaengig.
  const isPast = event.status === "past";
  const { day, month } = eventDateParts(event.startsAt);

  return (
    <article
      className={cn(
        "group relative grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-5 rounded-3xl p-3 transition-colors hover:bg-surface sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-6",
        isPast && "opacity-70",
      )}
    >
      <div
        aria-hidden="true"
        className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-surface-secondary text-foreground transition-colors group-hover:bg-volt group-hover:text-ink"
      >
        <span className="font-display text-[2rem] leading-none tabular-nums sm:text-4xl">{day}</span>
        <span className="mt-1 text-xs font-semibold">{month}</span>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
          <span className="rounded-full bg-default px-2.5 py-0.5 text-xs font-semibold text-foreground">
            {event.category}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs">
            <Icon icon={ClockIcon} />
            {formatTime(event.startsAt)} Uhr
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Icon icon={LocationIcon} className="text-xs" />
            <span className="truncate">{event.location}</span>
          </span>
        </div>

        <h3 className="text-xl leading-tight font-bold tracking-tight text-balance text-foreground sm:text-2xl">
          <Link
            href={`/events/${event.slug}`}
            className="transition-colors after:absolute after:inset-0 group-hover:text-accent-text"
          >
            {event.title}
          </Link>
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-pretty text-muted">
          {event.description}
        </p>
      </div>
    </article>
  );
}
