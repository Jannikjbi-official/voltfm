import Link from "next/link";
import { cn } from "@heroui/react";
import type { EventDTO } from "@/services/content";
import { formatTime } from "@/lib/format";
import { Icon, LocationIcon, ClockIcon } from "@/lib/icons";

/**
 * Ein Termin als Zeile: Datum als Kalenderblatt links, Inhalt rechts, eine
 * feine Linie dazwischen. So liest sich eine Terminliste wie ein Kalender und
 * nicht wie ein Stapel Kaesten. Die ganze Zeile ist ueber den Titel klickbar.
 */
export function EventCard({ event }: { event: EventDTO }) {
  const start = new Date(event.startsAt);
  // Aus dem gespeicherten Status statt aus der Uhr: Die Uhrzeit beim Rendern
  // zu lesen waere unrein und machte die Ausgabe vom Zeitpunkt abhaengig.
  const isPast = event.status === "past";

  const day = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
  }).format(start);
  const month = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    month: "short",
  }).format(start);

  return (
    <article
      className={cn(
        "group relative grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-5 border-t-2 border-border py-5 first:border-t-0 first:pt-0 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-6",
        isPast && "opacity-70",
      )}
    >
      <div
        aria-hidden="true"
        className="flex aspect-square flex-col items-center justify-center bg-foreground text-background transition-colors group-hover:bg-volt group-hover:text-ink"
      >
        <span className="font-display text-[2.4rem] leading-none tabular-nums sm:text-5xl">{day}</span>
        <span className="mt-1 font-mono text-xs">{month}</span>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-xs text-muted">
          <span className="border-[1.5px] border-foreground px-1.5 py-0.5 font-semibold text-foreground">
            {event.category}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon icon={ClockIcon} className="text-xs" />
            {formatTime(event.startsAt)} Uhr
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Icon icon={LocationIcon} className="text-xs" />
            <span className="truncate">{event.location}</span>
          </span>
        </div>

        <h3 className="font-display text-[1.9rem] text-balance text-foreground sm:text-4xl">
          <Link
            href={`/events/${event.slug}`}
            className="box-decoration-clone after:absolute after:inset-0"
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
