import type { Metadata } from "next";
import Link from "next/link";
import { after } from "next/server";
import { cn } from "@heroui/react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ButtonLink } from "@/components/common/button-link";
import { formatDate, formatDayMonth } from "@/lib/format";
import {
  firstPlayAt,
  getCharts,
  rangeStart,
  recordRecentPlaysThrottled,
  type ChartRange,
} from "@/services/plays";

export const metadata: Metadata = {
  title: "Charts",
  description: "Die meistgespielten Songs und Interpreten auf VoltFM: diese Woche, diesen Monat und insgesamt.",
  alternates: { canonical: "/charts" },
};

const RANGES: { value: ChartRange; label: string }[] = [
  { value: "woche", label: "Diese Woche" },
  { value: "monat", label: "Dieser Monat" },
  { value: "gesamt", label: "Gesamt" },
];

function parseRange(value: string | string[] | undefined): ChartRange {
  const v = Array.isArray(value) ? value[0] : value;
  return RANGES.some((r) => r.value === v) ? (v as ChartRange) : "woche";
}

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const range = parseRange((await searchParams).zeitraum);
  after(recordRecentPlaysThrottled);

  const [charts, since] = await Promise.all([getCharts(range), firstPlayAt()]);
  const from = rangeStart(range);
  const rangeText =
    range === "woche" && from
      ? `seit Montag, ${formatDayMonth(from)}`
      : range === "monat" && from
        ? `seit dem ${formatDayMonth(from)}`
        : since
          ? `seit dem ${formatDate(since)}`
          : "";

  return (
    <>
      <PageHeader
        title="Charts"
        size="large"
        description="Was auf VoltFM am häufigsten lief. Gezählt wird jede Ausstrahlung, nicht wie oft jemand zugehört hat."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/charts", label: "Charts" },
        ]}
      />

      <section className="shell pt-2">
        {/* Bedienfeld: Zeitraum-Tasten in einer Mulde, daneben das Display. */}
        <div className="surface-card grid gap-2 rounded-[var(--radius)] p-2 md:grid-cols-[minmax(0,1fr)_auto]">
          <nav aria-label="Zeitraum" className="well flex flex-wrap items-center gap-1 rounded-[var(--radius)] p-1">
            {RANGES.map((r) => {
              const active = r.value === range;
              return (
                <Link
                  key={r.value}
                  href={r.value === "woche" ? "/charts" : `/charts?zeitraum=${r.value}`}
                  aria-current={active ? "page" : undefined}
                  scroll={false}
                  className={cn(
                    "rounded-[calc(var(--radius)-2px)] px-3 py-2 font-wide text-[0.92rem] font-semibold transition-colors",
                    active ? "key bg-volt text-graphite" : "text-muted hover:bg-surface hover:text-foreground",
                  )}
                >
                  {r.label}
                </Link>
              );
            })}
          </nav>
          <div className="display-panel display-dots flex flex-wrap items-center gap-x-6 gap-y-1 rounded-[var(--radius)] px-4 py-3">
            <p className="flex items-baseline gap-2">
              <span className="font-dot text-2xl leading-none text-volt">{charts.total}</span>
              <span className="font-meta text-display-muted">titel gespielt {rangeText}</span>
            </p>
          </div>
        </div>

        <div className="pt-12 sm:pt-16">
          {charts.total === 0 ? (
            <EmptyState
              title={since ? "In diesem Zeitraum ist noch nichts gezählt" : "Noch keine Charts"}
              description={
                since
                  ? `VoltFM zählt seit dem ${formatDate(since)} mit. Schau etwas später wieder rein oder wähle einen längeren Zeitraum.`
                  : "VoltFM hat gerade erst angefangen mitzuschreiben, was läuft. Sobald die ersten Songs gezählt sind, stehen sie hier."
              }
              action={
                <ButtonLink href="/radio" variant="secondary" size="sm">
                  Zum Radio
                </ButtonLink>
              }
            />
          ) : (
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-2">
              <ChartList
                id="charts-songs"
                title="Top-Songs"
                rows={charts.songs.map((song) => ({
                  key: `${song.artist}\u0000${song.title}`,
                  primary: song.title,
                  secondary: song.artist,
                  count: song.count,
                }))}
              />
              <ChartList
                id="charts-artists"
                title="Top-Interpreten"
                rows={charts.artists.map((artist) => ({
                  key: artist.artist,
                  primary: artist.artist,
                  secondary: artist.songs === 1 ? "1 Song" : `${artist.songs} verschiedene Songs`,
                  count: artist.count,
                }))}
              />
            </div>
          )}

          {since && (
            <p className="mt-6 px-1 text-xs leading-relaxed text-muted">
              Gezählt seit dem {formatDate(since)}. laut.fm gibt nur die letzten zehn Songs heraus,
              deshalb schreibt VoltFM selbst mit, was läuft. Fällt das Mitschreiben einmal aus, fehlen
              die Songs aus dieser Zeit. Was wann lief, steht im{" "}
              <Link href="/gespielt" className="font-medium text-foreground underline underline-offset-4">
                Archiv
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </>
  );
}

function ChartList({
  id,
  title,
  rows,
}: {
  id: string;
  title: string;
  rows: { key: string; primary: string; secondary: string; count: number }[];
}) {
  return (
    <section aria-labelledby={id} className="min-w-0 lg:px-1">
      <h2
        id={id}
        className="mb-6 border-b border-border pb-5 font-display text-[2.1rem] text-foreground sm:text-5xl"
      >
        {title}
      </h2>
      <ol className="grid gap-2">
        {rows.map((row, index) => (
          <li
            key={row.key}
            className="surface-card grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-4 rounded-[var(--radius)] p-2"
          >
            <span
              className={cn(
                "display-panel grid size-12 place-items-center rounded-[3px] font-dot text-xl",
                index < 3 ? "text-volt" : "text-display-foreground",
              )}
            >
              <span className="sr-only">Platz </span>
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold text-foreground">{row.primary}</span>
              <span className="block truncate text-sm text-muted">{row.secondary}</span>
            </span>
            <span className="display-panel flex items-baseline gap-1 rounded-[3px] px-2 py-1">
              <span className="font-dot text-sm text-display-foreground">{row.count}</span>
              <span className="font-meta text-[0.65rem] text-display-muted">× gespielt</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
