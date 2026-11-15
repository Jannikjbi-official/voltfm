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
import { Icon, DiscordIcon, ClockIcon, BoltIcon } from "@/lib/icons";

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

      <section className="shell">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-12">
          <div
            data-theme="dark"
            className="dark flex flex-col items-start gap-5 rounded-[2rem] border border-border bg-surface p-7 text-foreground shadow-[var(--lift-shadow)] sm:p-12 lg:col-span-7"
          >
            <span
              className="grid size-12 place-items-center rounded-2xl bg-volt text-xl text-ink"
              aria-hidden="true"
            >
              <Icon icon={ClockIcon} />
            </span>

            <h2 className="font-display text-[2.1rem] text-balance text-foreground sm:text-5xl">
              Warum gerade kein Sendeplan?
            </h2>

            <p className="text-lg leading-relaxed text-muted">
              Unser Programm liegt derzeit als eine durchlaufende Playlist bei
              laut.fm. Damit lassen sich feste Sendezeiten nicht verlässlich
              zusagen — und ein Sendeplan, der nicht stimmt, ist schlechter als
              gar keiner.
            </p>
          </div>

          <div className="surface-card flex flex-col items-start gap-5 rounded-[2rem] p-7 sm:p-10 lg:col-span-5">
            <span
              className="grid size-12 place-items-center rounded-2xl bg-default text-xl text-foreground"
              aria-hidden="true"
            >
              <Icon icon={BoltIcon} />
            </span>

            <p className="text-lg leading-relaxed text-foreground">
              Sobald wir einen eigenen Sendeserver haben, kommt er zurück: mit
              festen Sendungen, Moderation zu festen Zeiten und Songwünschen, die
              tatsächlich in der laufenden Sendung landen.
            </p>

            <div className="mt-auto flex flex-wrap gap-3 pt-2">
              <ButtonLink href="/radio" variant="primary">
                Jetzt live hören
              </ButtonLink>
              {/* Langer Text: am Handy darf der Knopf umbrechen statt die Seite zu verbreitern. */}
              <ButtonLink
                href={site.discordUrl}
                external
                variant="tertiary"
                className="h-auto min-h-10 max-w-full py-2 whitespace-normal"
              >
                <Icon icon={DiscordIcon} />
                Im Discord auf dem Laufenden bleiben
              </ButtonLink>
            </div>
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

      <section className="shell">
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
          <div className="flex flex-col gap-3">
            {WEEK_ORDER.map((weekday) => {
              const day = grouped.find((d) => d.weekday === weekday);
              const slots = day?.slots ?? [];
              const isToday = weekday === today;

              return (
                <section
                  key={weekday}
                  aria-labelledby={`day-${weekday}`}
                  className={cn(
                    "surface-card grid gap-4 rounded-3xl p-5 sm:p-7 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8",
                    isToday && "ring-2 ring-volt",
                  )}
                >
                  <div className="flex items-center gap-3 md:flex-col md:items-start">
                    <h2 id={`day-${weekday}`} className="text-xl font-bold tracking-tight text-foreground">
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
                              <span className="font-mono text-base font-semibold text-foreground">
                                {formatSlotStart(slot)}
                              </span>
                              <span className="font-mono text-xs text-muted">{formatSlotEnd(slot)}</span>
                            </div>

                            <div className="flex min-w-0 flex-col gap-2">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-lg font-bold tracking-tight text-foreground">
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
