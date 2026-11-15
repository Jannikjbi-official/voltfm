"use client";

import { cn } from "@heroui/react";
import type { NowPlaying, TrackHistoryItem } from "@/services/radio/types";
import { formatTime } from "@/lib/format";
import { useRadioPlayer } from "./player-provider";
import { CoverArt } from "./cover-art";

/**
 * "Was gerade lief": kleines Cover, Uhrzeit, Titel, Interpret.
 *
 * Die Liste kommt mit jedem Metadaten-Abruf (alle 20 Sekunden) und ist damit so
 * aktuell wie "Läuft gerade" darueber. Frueher wurde sie beim Seitenbau
 * gerendert — auf der Startseite also bis zu einer Stunde alt, und dann stand
 * der laufende Song mit drin.
 */
export function RecentTracks({
  limit,
  emptyText,
  columns = false,
}: {
  limit: number;
  emptyText?: string;
  /** Am Desktop zweispaltig, wie ein Fahrplan. */
  columns?: boolean;
}) {
  const { snapshot } = useRadioPlayer();
  const tracks = withoutCurrent(snapshot?.history ?? [], snapshot?.nowPlaying ?? null).slice(0, limit);

  if (tracks.length === 0) {
    return emptyText ? <p className="text-sm text-muted">{emptyText}</p> : null;
  }

  return (
    <ol className={cn("grid gap-2", columns && "md:grid-cols-2 md:gap-x-4")}>
      {tracks.map((track) => (
        <li
          key={`${track.id}-${track.startedAt}`}
          className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-surface"
        >
          <CoverArt src={track.coverUrl} alt="" className="size-12 rounded-xl" />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-foreground">{track.title}</span>
            <span className="block truncate text-sm text-muted">{track.artist}</span>
          </span>
          <time className="font-mono text-xs tabular-nums text-muted" dateTime={track.startedAt ?? undefined}>
            {track.startedAt ? formatTime(track.startedAt) : "–"}
          </time>
        </li>
      ))}
    </ol>
  );
}

/**
 * Der laufende Song steht schon gross in der Buehne. laut.fm fuehrt ihn in
 * `last_songs` meist nicht mit, aber die beiden Abfragen sind unterschiedlich
 * lange gecacht — fuer ein paar Sekunden kann er doch drinstehen. Alles, was
 * nicht vor dem laufenden Titel begonnen hat, fliegt deshalb raus.
 */
function withoutCurrent(history: TrackHistoryItem[], current: NowPlaying | null): TrackHistoryItem[] {
  if (!current) return history;
  const currentStart = current.startedAt ? Date.parse(current.startedAt) : null;
  return history.filter((track) => {
    if (currentStart !== null && track.startedAt) return Date.parse(track.startedAt) < currentStart;
    return !(track.title === current.title && track.artist === current.artist);
  });
}
