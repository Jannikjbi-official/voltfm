import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ButtonLink } from "@/components/common/button-link";
import { Badge } from "@/components/ui/badge";
import { HostChip } from "@/components/common/host-card";
import {
  getSchedule,
  formatSlotStart,
  formatSlotEnd,
  groupByWeekday,
  resolveCurrentAndNext,
  WEEKDAY_LABELS,
} from "@/services/radio/schedule";
import { listHosts, listShows } from "@/services/content";
import { formatTime } from "@/lib/format";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Programm",
  description:
    "Der VoltFM Sendeplan: heute, morgen und die ganze Woche — mit Moderatoren und Sendungsbeschreibungen.",
  alternates: { canonical: "/programm" },
};

export const revalidate = 600;

/** Sunday-first from Date#getDay, but the week should read Monday-first. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default async function ProgrammPage() {
  const [schedule, shows, hosts] = await Promise.all([getSchedule(), listShows(), listHosts()]);
  const { current } = resolveCurrentAndNext(schedule);

  const grouped = groupByWeekday(schedule);
  const today = new Date().getDay();

  /** laut.fm only knows the playlist name; the CMS holds the editorial detail. */
  const showByName = new Map(shows.map((show) => [show.title.toLowerCase(), show]));
  const hostBySlug = new Map(hosts.map((host) => [host.slug, host]));

  const hasSchedule = schedule.length > 0;

  return (
    <>
      <PageHeader
        eyebrow="Sendeplan"
        title="Das Programm"
        description="Der Sendeplan kommt direkt aus unserem Sendesystem und ist damit immer aktuell. Zwischen den Sendungen läuft durchgehend Musik."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/programm", label: "Programm" },
        ]}
        size="large"
        aside={
          <ButtonLink href="/radio" variant="primary" mode="filled" size="md">
            Jetzt live hören
          </ButtonLink>
        }
      />

      <section className="section shell">
        {!hasSchedule ? (
          <EmptyState
            title="Der Sendeplan ist gerade nicht abrufbar"
            description="Die Verbindung zu unserem Sendesystem steht kurzzeitig nicht. Der Livestream läuft davon unabhängig weiter."
            action={
              <ButtonLink href="/radio" variant="primary" mode="filled" size="sm">
                Zum Player
              </ButtonLink>
            }
          />
        ) : (
          <div className={styles.week}>
            {WEEK_ORDER.map((weekday) => {
              const day = grouped.find((d) => d.weekday === weekday);
              const slots = day?.slots ?? [];
              const isToday = weekday === today;

              return (
                <section
                  key={weekday}
                  className={styles.day}
                  data-today={isToday}
                  aria-labelledby={`day-${weekday}`}
                >
                  <div className={styles.dayHead}>
                    <h2 id={`day-${weekday}`} className={styles.dayTitle}>
                      {WEEKDAY_LABELS[weekday]}
                    </h2>
                    {isToday && (
                      <Badge mode="filled" size="sm">
                        Heute
                      </Badge>
                    )}
                  </div>

                  {slots.length === 0 ? (
                    <p className={styles.dayEmpty}>
                      Durchgehend Musik — keine moderierte Sendung.
                    </p>
                  ) : (
                    <ol className={styles.slots} role="list">
                      {slots.map((slot) => {
                        const show = showByName.get(slot.name.toLowerCase());
                        const onAir = isToday && current?.name === slot.name;

                        return (
                          <li
                            key={`${slot.id}-${slot.startHour}`}
                            className={styles.slot}
                            data-onair={onAir}
                          >
                            <div className={styles.slotTime}>
                              <span className={styles.slotStart}>
                                {formatSlotStart(slot)}
                              </span>
                              <span className={styles.slotEnd}>{formatSlotEnd(slot)}</span>
                            </div>

                            <div className={styles.slotBody}>
                              <div className={styles.slotTitleRow}>
                                <h3 className={styles.slotTitle}>
                                  {show?.title ?? slot.name}
                                </h3>
                                {onAir && (
                                  <span className={styles.onAir}>
                                    <span className={styles.onAirDot} aria-hidden="true" />
                                    Auf Sendung
                                  </span>
                                )}
                              </div>

                              {(show?.description || slot.description) && (
                                <p className={styles.slotDescription}>
                                  {show?.description ?? slot.description}
                                </p>
                              )}

                              {show && show.hostSlugs.length > 0 && (
                                <div className={styles.slotHosts}>
                                  {show.hostSlugs
                                    .map((hostSlug) => hostBySlug.get(hostSlug))
                                    .filter((host) => host !== undefined)
                                    .map((host) => (
                                      <HostChip key={host.id} host={host} />
                                    ))}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </section>

      {current?.endsAt && (
        <p className="visually-hidden" role="status">
          Aktuell läuft {current.name} bis {formatTime(current.endsAt)} Uhr.
        </p>
      )}
    </>
  );
}
