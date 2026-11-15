import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ButtonLink } from "@/components/common/button-link";
import { Chip, cn } from "@heroui/react";
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
import { features, site } from "@/lib/site";
import { Icon, DiscordIcon, ClockIcon } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Programm",
  description:
    "Der VoltFM Sendeplan: heute, morgen und die ganze Woche — mit Moderatoren und Sendungsbeschreibungen.",
  alternates: { canonical: "/programm" },
};

export const revalidate = 600;

/**
 * Was statt des Sendeplans steht, solange er ruht.
 *
 * Bewusst eine ehrliche Erklaerung und kein "kommt bald": Der Grund ist
 * bekannt, und wer hier landet, soll wissen, woran es haengt.
 */
function SchedulePaused() {
  return (
    <>
      <PageHeader
        title="Der Sendeplan macht gerade Pause"
        description="Wir senden weiter rund um die Uhr — nur eben ohne festen Plan."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/programm", label: "Programm" },
        ]}
        size="large"
      />

      <section className="shell py-14 sm:py-20">
        <div className="flex max-w-3xl flex-col items-start gap-5 rounded-3xl border border-border bg-surface p-6 sm:p-10">
          <span
            className="grid size-12 place-items-center rounded-full bg-surface-secondary text-xl text-foreground"
            aria-hidden="true"
          >
            <Icon icon={ClockIcon} />
          </span>

          <h2 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
            Warum gerade kein Sendeplan?
          </h2>

          <p className="text-lg leading-relaxed text-muted">
            Unser Programm liegt derzeit als eine durchlaufende Playlist bei
            laut.fm. Damit lassen sich feste Sendezeiten nicht verlässlich
            zusagen — und ein Sendeplan, der nicht stimmt, ist schlechter als
            gar keiner.
          </p>

          <p className="text-lg leading-relaxed text-muted">
            Sobald wir einen eigenen Sendeserver haben, kommt er zurück: mit
            festen Sendungen, Moderation zu festen Zeiten und Songwünschen, die
            tatsächlich in der laufenden Sendung landen.
          </p>

          <div className="mt-2 flex flex-wrap gap-3">
            <ButtonLink href="/radio" variant="primary">
              Jetzt live hören
            </ButtonLink>
            <ButtonLink href={site.discordUrl} external variant="outline">
              <Icon icon={DiscordIcon} />
              Im Discord auf dem Laufenden bleiben
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

/** Sunday-first from Date#getDay, but the week should read Monday-first. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default async function ProgrammPage() {
  /* Abgeschaltet, solange das Programm als eine durchlaufende Playlist bei
     laut.fm liegt: Ein Sendeplan waere dann ein Versprechen, das der Sender
     nicht halten kann. Die Seite bleibt erreichbar und erklaert das, statt mit
     404 zu antworten — es gibt Verweise darauf. */
  if (!features.schedule) return <SchedulePaused />;

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
        title="Das Programm"
        description="Der Sendeplan kommt direkt aus unserem Sendesystem und ist damit immer aktuell. Zwischen den Sendungen läuft durchgehend Musik."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/programm", label: "Programm" },
        ]}
        size="large"
        aside={
          <ButtonLink href="/radio" variant="primary">
            Jetzt live hören
          </ButtonLink>
        }
      />

      <section className="shell py-14 sm:py-20">
        {!hasSchedule ? (
          <EmptyState
            title="Der Sendeplan ist gerade nicht abrufbar"
            description="Die Verbindung zu unserem Sendesystem steht kurzzeitig nicht. Der Livestream läuft davon unabhängig weiter."
            action={
              <ButtonLink href="/radio" variant="primary" size="sm">
                Zum Player
              </ButtonLink>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {WEEK_ORDER.map((weekday) => {
              const day = grouped.find((d) => d.weekday === weekday);
              const slots = day?.slots ?? [];
              const isToday = weekday === today;

              return (
                <section
                  key={weekday}
                  aria-labelledby={`day-${weekday}`}
                  className={cn(
                    "grid gap-4 rounded-2xl border bg-surface p-5 sm:p-6 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8",
                    isToday ? "border-accent-text/50" : "border-border",
                  )}
                >
                  <div className="flex items-center gap-3 md:flex-col md:items-start">
                    <h2 id={`day-${weekday}`} className="font-wide text-xl font-bold text-foreground">
                      {WEEKDAY_LABELS[weekday]}
                    </h2>
                    {isToday && (
                      <Chip color="accent" variant="primary" size="sm">
                        Heute
                      </Chip>
                    )}
                  </div>

                  {slots.length === 0 ? (
                    <p className="text-muted">Durchgehend Musik — keine moderierte Sendung.</p>
                  ) : (
                    <ol className="flex flex-col divide-y divide-separator">
                      {slots.map((slot) => {
                        const show = showByName.get(slot.name.toLowerCase());
                        const onAir = isToday && current?.name === slot.name;

                        return (
                          <li
                            key={`${slot.id}-${slot.startHour}`}
                            className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 py-4 first:pt-0 last:pb-0"
                          >
                            <div className="flex flex-col tabular-nums">
                              <span className="font-wide text-lg font-bold text-foreground">
                                {formatSlotStart(slot)}
                              </span>
                              <span className="text-sm text-muted">{formatSlotEnd(slot)}</span>
                            </div>

                            <div className="flex min-w-0 flex-col gap-2">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="font-wide text-lg font-bold text-foreground">
                                  {show?.title ?? slot.name}
                                </h3>
                                {onAir && (
                                  <span className="inline-flex items-center gap-2 rounded-full bg-volt px-2.5 py-0.5 text-xs font-bold text-ink">
                                    <span
                                      aria-hidden="true"
                                      className="size-1.5 rounded-full bg-ink animate-[vfm-pulse_2s_ease-in-out_infinite] motion-reduce:animate-none"
                                    />
                                    Auf Sendung
                                  </span>
                                )}
                              </div>

                              {(show?.description || slot.description) && (
                                <p className="leading-relaxed text-muted">
                                  {show?.description ?? slot.description}
                                </p>
                              )}

                              {show && show.hostSlugs.length > 0 && (
                                <div className="flex flex-wrap gap-2">
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
        <p className="sr-only" role="status">
          Aktuell läuft {current.name} bis {formatTime(current.endsAt)} Uhr.
        </p>
      )}
    </>
  );
}
