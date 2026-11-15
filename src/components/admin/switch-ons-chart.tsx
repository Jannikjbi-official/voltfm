"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@heroui/react";

export interface ChartDay {
  date: string;
  switchOns: number | null;
  partial: boolean;
}

const HEIGHT = 208;
const PAD = { top: 10, right: 4, bottom: 26, left: 40 };
const MAX_BAR = 24;
const GAP = 2;

const numberFormat = new Intl.NumberFormat("de-DE");

/* Die Tage sind Kalendertage ("2026-11-14"), keine Zeitpunkte — deshalb in
   UTC formatieren, sonst rutscht ein Tag je nach Zeitzone des Browsers. */
const axisFormat = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "numeric", timeZone: "UTC" });
const longFormat = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

function toDate(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Runde Schritte fuer die Hilfslinien: 1, 2, 5, 10, 20, 50 … */
function niceStep(max: number, lines = 4): number {
  const raw = Math.max(max, 1) / lines;
  const power = 10 ** Math.floor(Math.log10(raw));
  const factor = [1, 2, 5, 10].find((f) => f * power >= raw) ?? 10;
  return Math.max(1, factor * power);
}

/** Balken mit runder Oberkante und gerader Grundlinie. */
function barPath(x: number, y: number, width: number, height: number): string {
  const r = Math.min(4, width / 2, height);
  return [
    `M${x},${y + height}`,
    `V${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    `H${x + width - r}`,
    `Q${x + width},${y} ${x + width},${y + r}`,
    `V${y + height}`,
    "Z",
  ].join(" ");
}

/**
 * Einschaltungen pro Tag als schlichtes Saeulendiagramm — eigenes SVG, keine
 * Bibliothek. Eine Reihe, deshalb keine Legende: Der Titel des Panels sagt,
 * was zu sehen ist. Beim Ueberfahren zeigt ein Hinweis Tag und Zahl; fuer
 * Tastatur und Screenreader stehen dieselben Zahlen in der Tabelle darunter.
 *
 * Die Breite kennt erst der Browser. Bis dahin haelt ein leerer Rahmen in
 * voller Hoehe den Platz, damit nichts springt.
 */
export function SwitchOnsChart({ days }: { days: ChartDay[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const known = days.filter((day): day is ChartDay & { switchOns: number } => day.switchOns !== null);
  const complete = known.filter((day) => !day.partial);
  const total = known.reduce((sum, day) => sum + day.switchOns, 0);
  const best = complete.reduce<(typeof complete)[number] | null>(
    (top, day) => (day.switchOns > (top?.switchOns ?? -1) ? day : top),
    null,
  );
  const average = complete.length ? Math.round(complete.reduce((s, d) => s + d.switchOns, 0) / complete.length) : null;

  const max = Math.max(0, ...known.map((day) => day.switchOns));
  const step = niceStep(max);
  const top = Math.max(step, Math.ceil(max / step) * step);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);

  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const band = days.length ? plotW / days.length : 0;
  const barW = Math.max(2, Math.min(MAX_BAR, band - GAP));
  const y = (value: number) => PAD.top + plotH - (value / top) * plotH;
  const x = (index: number) => PAD.left + index * band + (band - barW) / 2;

  const activeDay = active !== null ? days[active] : null;
  const tooltipLeft = active !== null ? Math.min(Math.max(x(active) + barW / 2, 72), width - 72) : 0;
  const tooltipTop = activeDay?.switchOns != null ? y(activeDay.switchOns) : PAD.top + plotH;

  /* Datumsbeschriftung: der juengste Tag und von dort jeder siebte — so
     stehen die Wochentage untereinander und nichts ueberlappt. */
  const labelled = new Set(days.map((_, i) => i).filter((i) => (days.length - 1 - i) % 7 === 0));

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-3 gap-3">
        {[
          { label: "Summe", value: numberFormat.format(total) },
          { label: "Im Schnitt", value: average === null ? "—" : numberFormat.format(average) },
          {
            label: "Bester Tag",
            value: best ? numberFormat.format(best.switchOns) : "—",
            hint: best ? axisFormat.format(toDate(best.date)) : undefined,
          },
        ].map((item) => (
          <div key={item.label} className="min-w-0 rounded-xl bg-surface-secondary px-3 py-2.5">
            <dt className="truncate text-xs text-muted">{item.label}</dt>
            <dd className="mt-0.5 flex items-baseline gap-1.5 text-lg font-bold text-foreground">
              {item.value}
              {item.hint && <span className="font-mono text-xs font-normal text-muted">{item.hint}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <div ref={wrapRef} className="relative" style={{ height: HEIGHT }}>
        {width > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-labelledby={titleId}
            className="block overflow-visible select-none"
            onPointerLeave={() => setActive(null)}
          >
            <title id={titleId}>
              {`Einschaltungen pro Tag, ${days.length} Tage, zusammen ${numberFormat.format(total)}.`}
            </title>

            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={Math.round(y(tick)) + 0.5}
                  y2={Math.round(y(tick)) + 0.5}
                  className={tick === 0 ? "stroke-border" : "stroke-separator"}
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 10}
                  y={y(tick)}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-muted font-mono text-[11px] tabular-nums"
                >
                  {numberFormat.format(tick)}
                </text>
              </g>
            ))}

            {days.map((day, index) => {
              const value = day.switchOns;
              const barH = value ? Math.max(1, (value / top) * plotH) : 0;
              return (
                <g key={day.date}>
                  {value !== null && value > 0 && (
                    <path
                      d={barPath(x(index), PAD.top + plotH - barH, barW, barH)}
                      className={cn(
                        "fill-accent-text transition-opacity duration-150 motion-reduce:transition-none",
                        day.partial && "opacity-45",
                        active !== null && active !== index && "opacity-35",
                      )}
                    />
                  )}
                  {labelled.has(index) && (
                    <text
                      x={x(index) + barW / 2}
                      y={HEIGHT - 6}
                      textAnchor="middle"
                      className="fill-muted font-mono text-[11px] tabular-nums"
                    >
                      {axisFormat.format(toDate(day.date))}
                    </text>
                  )}
                  {/* Trefferflaeche: die ganze Spalte, nicht nur der Balken. */}
                  <rect
                    x={PAD.left + index * band}
                    y={PAD.top}
                    width={band}
                    height={plotH}
                    fill="transparent"
                    onPointerEnter={() => setActive(index)}
                  />
                </g>
              );
            })}
          </svg>
        )}

        {activeDay && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-border bg-overlay px-3 py-2 text-xs whitespace-nowrap text-foreground shadow-overlay"
            style={{ left: tooltipLeft, top: tooltipTop - 8 }}
          >
            <p className="text-muted">
              {longFormat.format(toDate(activeDay.date))}
              {activeDay.partial && ", bisher"}
            </p>
            <p className="mt-0.5 text-sm font-bold">
              {activeDay.switchOns === null
                ? "Keine Daten"
                : `${numberFormat.format(activeDay.switchOns)} Einschaltungen`}
            </p>
          </div>
        )}
      </div>

      <details className="group text-sm">
        <summary className="w-fit cursor-pointer rounded-full text-xs font-medium text-muted transition-colors hover:text-foreground">
          Als Tabelle anzeigen
        </summary>
        <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-separator">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr>
                <th scope="col" className="border-b border-separator px-3 py-2 text-xs font-medium text-muted">
                  Tag
                </th>
                <th scope="col" className="border-b border-separator px-3 py-2 text-right text-xs font-medium text-muted">
                  Einschaltungen
                </th>
              </tr>
            </thead>
            <tbody>
              {[...days].reverse().map((day) => (
                <tr key={day.date} className="[&:last-child>td]:border-b-0">
                  <td className="border-b border-separator px-3 py-1.5">
                    {longFormat.format(toDate(day.date))}
                    {day.partial && <span className="text-muted"> (bisher)</span>}
                  </td>
                  <td className="border-b border-separator px-3 py-1.5 text-right font-mono tabular-nums">
                    {day.switchOns === null ? "—" : numberFormat.format(day.switchOns)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
