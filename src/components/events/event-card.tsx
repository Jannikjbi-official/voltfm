import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { EventDTO } from "@/services/content";
import { formatTime } from "@/lib/format";
import { Icon, LocationIcon, ClockIcon } from "@/lib/icons";
import styles from "./event-card.module.css";

/** Event teaser with a calendar-style date block. */
export function EventCard({ event }: { event: EventDTO }) {
  const start = new Date(event.startsAt);
  // Derived from the stored status rather than comparing against the clock:
  // reading the current time during render is impure and makes the output
  // depend on when React happens to re-render.
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
    <article className={styles.card} data-past={isPast}>
      <div className={styles.date} aria-hidden="true">
        <span className={styles.day}>{day}</span>
        <span className={styles.month}>{month}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          <Badge mode="lighter" size="sm">
            {event.category}
          </Badge>
          <span className={styles.metaItem}>
            <Icon icon={ClockIcon} />
            {formatTime(event.startsAt)} Uhr
          </span>
          <span className={styles.metaItem}>
            <Icon icon={LocationIcon} />
            {event.location}
          </span>
        </div>

        <h3 className={styles.title}>
          <Link href={`/events/${event.slug}`} className={styles.link}>
            {event.title}
          </Link>
        </h3>

        <p className={styles.description}>{event.description}</p>
      </div>
    </article>
  );
}
