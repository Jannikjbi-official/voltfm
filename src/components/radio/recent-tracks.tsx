"use client";

import type { NowPlaying, TrackHistoryItem } from "@/services/radio/types";
import { formatTime } from "@/lib/format";
import { useRadioPlayer } from "./player-provider";
import { CoverArt } from "./cover-art";
import styles from "./recent-tracks.module.css";

/**
 * "Was gerade lief": kleines Cover, Uhrzeit, Titel, Interpret.
 *
 * Die Liste kommt mit jedem Metadaten-Abruf (alle 20 Sekunden) und ist damit so
 * aktuell wie "Läuft gerade" darueber. Frueher wurde sie beim Seitenbau
 * gerendert — auf der Startseite also bis zu einer Stunde alt, und dann stand
 * der laufende Song mit drin.
 */
export function RecentTracks({ limit, emptyText }: { limit: number; emptyText?: string }) {
  const { snapshot } = useRadioPlayer();
  const tracks = withoutCurrent(snapshot?.history ?? [], snapshot?.nowPlaying ?? null).slice(0, limit);

  if (tracks.length === 0) {
    return emptyText ? <p className={styles.empty}>{emptyText}</p> : null;
  }

  return (
    <ol className={styles.list} role="list">
      {tracks.map((track) => (
        <li key={`${track.id}-${track.startedAt}`} className={styles.item}>
          <CoverArt src={track.coverUrl} alt="" className={styles.cover} />
          <time className={styles.time} dateTime={track.startedAt ?? undefined}>
            {track.startedAt ? formatTime(track.startedAt) : "–"}
          </time>
          <span className={styles.text}>
            <span className={styles.title}>{track.title}</span>
            <span className={styles.artist}>{track.artist}</span>
          </span>
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
