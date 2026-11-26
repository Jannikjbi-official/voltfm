import type { Metadata } from "next";
import Link from "next/link";
import { after } from "next/server";
import { Button, cn } from "@heroui/react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { SelectField, TextField } from "@/components/common/form-field";
import { formatDate, formatTime } from "@/lib/format";
import { Icon, SearchIcon } from "@/lib/icons";
import {
  firstPlayAt,
  isDayString,
  listPlaysOfDay,
  recordRecentPlaysThrottled,
  searchPlays,
  shiftDay,
  stationToday,
  type PlayItem,
} from "@/services/plays";

export const metadata: Metadata = {
  title: "Gespielt",
  description: "Was lief wann auf VoltFM? Das Archiv aller gespielten Songs, nach Tag und Stunde.",
  alternates: { canonical: "/gespielt" },
};

const PER_PAGE = 50;

const HOURS = [
  { value: "", label: "Ganzer Tag" },
  ...Array.from({ length: 24 }, (_, h) => ({
    value: String(h),
    label: `${String(h).padStart(2, "0")}–${String((h + 1) % 24).padStart(2, "0")} Uhr`,
  })),
];

type Params = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function GespieltPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  after(recordRecentPlaysThrottled);

  const today = stationToday();
  const query = (first(params.q) ?? "").trim().slice(0, 100);
  const requestedDay = first(params.tag);
  // Kein Tag in der Zukunft; ein ungueltiger Wert faellt auf heute zurueck.
  const day = isDayString(requestedDay) && requestedDay <= today ? requestedDay : today;
  const hourValue = Number(first(params.stunde));
  const hour =
    first(params.stunde) !== undefined && first(params.stunde) !== "" && Number.isInteger(hourValue) && hourValue >= 0 && hourValue <= 23
      ? hourValue
      : null;
  const page = Math.max(1, Math.floor(Number(first(params.seite)) || 1));

  const [result, since] = await Promise.all([
    query ? searchPlays(query, { page, perPage: PER_PAGE }) : listPlaysOfDay(day, { hour, page, perPage: PER_PAGE }),
    firstPlayAt(),
  ]);
  const pages = Math.max(1, Math.ceil(result.total / PER_PAGE));

  /** Dieselbe Ansicht, eine Angabe anders. */
  function href(change: Partial<{ tag: string; stunde: number | null; q: string; seite: number }>) {
    const next = new URLSearchParams();
    const q = change.q ?? query;
    if (q) next.set("q", q);
    else {
      const tag = change.tag ?? day;
      if (tag !== today) next.set("tag", tag);
      const stunde = "stunde" in change ? change.stunde : hour;
      if (stunde != null) next.set("stunde", String(stunde));
    }
    const seite = change.seite ?? 1;
    if (seite > 1) next.set("seite", String(seite));
    const s = next.toString();
    return s ? `/gespielt?${s}` : "/gespielt";
  }

  const dayLabel = day === today ? `Heute, ${formatDate(parseDay(day))}` : formatDate(parseDay(day));
  const hourLabel = hour != null ? HOURS[hour + 1].label : null;

  return (
    <>
      <PageHeader
        title="Gespielt"
        size="large"
        description="Was lief wann auf VoltFM? Wähl einen Tag und, wenn du magst, eine Stunde, oder such nach einem Song."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/gespielt", label: "Gespielt" },
        ]}
      />

      <section className="shell pt-2">
        <div className="grid gap-2 lg:grid-cols-2">
          {/* Tag und Stunde: ein schlichtes GET-Formular, teilbare Adresse. */}
          <form action="/gespielt" method="get" className="surface-card flex flex-col gap-3 rounded-[var(--radius)] p-4">
            <h2 className="font-meta text-muted">nach tag</h2>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
              <TextField label="Tag" type="date" name="tag" defaultValue={day} max={today} required />
              <SelectField label="Stunde" name="stunde" defaultValue={hour != null ? String(hour) : ""} options={HOURS} />
              <Button type="submit" variant="primary" className="h-10">
                Anzeigen
              </Button>
            </div>
          </form>

          <form action="/gespielt" method="get" role="search" className="surface-card flex flex-col gap-3 rounded-[var(--radius)] p-4">
            <h2 className="font-meta text-muted">nach song</h2>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <TextField
                label="Titel oder Interpret"
                type="search"
                name="q"
                defaultValue={query}
                placeholder="z. B. Daft Punk"
                maxLength={100}
              />
              <Button type="submit" variant="primary" className="h-10">
                <Icon icon={SearchIcon} />
                Suchen
              </Button>
            </div>
          </form>
        </div>

        {/* Was gerade gezeigt wird, als Display; daneben vor und zurueck. */}
        <div className="surface-card mt-2 flex flex-col gap-2 rounded-[var(--radius)] p-2 sm:flex-row sm:items-stretch">
          <div className="display-panel display-dots flex min-w-0 flex-1 flex-wrap items-baseline gap-x-4 gap-y-1 rounded-[var(--radius)] px-4 py-3">
            <span className="font-dot text-2xl leading-none text-volt">{result.total}</span>
            <span className="min-w-0 font-meta break-words text-display-muted">
              {query ? `treffer für „${query}“ im ganzen archiv` : `titel ${dayLabel}${hourLabel ? `, ${hourLabel}` : ""}`}
            </span>
          </div>
          {query ? (
            <Link href={href({ q: "", tag: today, stunde: null })} className={KEY}>
              Suche beenden
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Link href={href({ tag: shiftDay(day, -1) })} className={KEY}>
                Tag davor
              </Link>
              {day < today ? (
                <Link href={href({ tag: shiftDay(day, 1) })} className={KEY}>
                  Tag danach
                </Link>
              ) : (
                <span aria-disabled="true" className={cn(KEY, "pointer-events-none opacity-50")}>
                  Tag danach
                </span>
              )}
            </div>
          )}
        </div>

        <div className="pt-12 sm:pt-16">
          {result.items.length === 0 ? (
            <EmptyState
              title={query ? `Nichts gefunden für „${query}“` : "Für diese Zeit ist nichts eingetragen"}
              description={
                since
                  ? `VoltFM schreibt seit dem ${formatDate(since)} mit, was läuft. Lücken entstehen, wenn das Mitschreiben einmal ausfällt.`
                  : "VoltFM hat gerade erst angefangen mitzuschreiben, was läuft. Die ersten Songs stehen bald hier."
              }
            />
          ) : (
            <>
              <ol className="grid gap-2">
                {result.items.map((item) => (
                  <PlayRow key={item.id} item={item} withDate={Boolean(query)} />
                ))}
              </ol>

              {pages > 1 && (
                <nav aria-label="Seiten" className="mt-6 flex flex-wrap items-center justify-between gap-2">
                  {page > 1 ? (
                    <Link href={href({ seite: page - 1 })} className={KEY}>
                      Neuere
                    </Link>
                  ) : (
                    <span />
                  )}
                  <span className="display-panel rounded-[3px] px-2.5 py-1 font-dot text-sm text-display-foreground">
                    {page}/{pages}
                  </span>
                  {page < pages ? (
                    <Link href={href({ seite: page + 1 })} className={KEY}>
                      Ältere
                    </Link>
                  ) : (
                    <span />
                  )}
                </nav>
              )}
            </>
          )}

          {since && (
            <p className="mt-6 px-1 text-xs leading-relaxed text-muted">
              Aufgezeichnet seit dem {formatDate(since)}, alle Zeiten in Senderzeit (Berlin). Die
              meistgespielten Songs stehen in den{" "}
              <Link href="/charts" className="font-medium text-foreground underline underline-offset-4">
                Charts
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </>
  );
}

const KEY =
  "key inline-flex items-center justify-center rounded-[var(--radius)] bg-surface px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-volt hover:text-graphite";

/** Mitternacht Senderzeit des Tages — nur fuer die Anzeige des Datums. */
function parseDay(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  // 12 Uhr UTC liegt in Berlin sicher am selben Kalendertag.
  return new Date(Date.UTC(y, m - 1, d, 12));
}

function PlayRow({ item, withDate }: { item: PlayItem; withDate: boolean }) {
  return (
    <li className="surface-card grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-[var(--radius)] p-2">
      <time
        dateTime={item.startedAt}
        className="display-panel flex min-w-16 flex-col items-center rounded-[3px] px-2 py-1.5 text-center"
      >
        <span className="font-dot text-base leading-none text-volt">{formatTime(item.startedAt)}</span>
        {withDate && (
          <span className="mt-1 font-dot text-[0.7rem] leading-none text-display-muted">
            {formatDate(item.startedAt, "short")}
          </span>
        )}
      </time>
      <span className="min-w-0">
        <span className="block truncate font-semibold text-foreground">{item.title}</span>
        <span className="block truncate text-sm text-muted">
          {item.artist}
          {item.album && <span className="hidden sm:inline"> – {item.album}</span>}
        </span>
      </span>
    </li>
  );
}
