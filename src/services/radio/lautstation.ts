import { site } from "@/lib/site";

/**
 * Die Playlist der letzten Tage von lautstation.de.
 *
 * lautstation.de ist ein privates Verzeichnis fuer laut.fm-Stationen und
 * bietet dafuer ein Widget an. Das Widget wird hier bewusst NICHT eingebunden:
 * Es wuerde fremden Code auf voltfm.xyz ausfuehren und den Browser jedes
 * Besuchers mit lautstation.de verbinden — das braeuchte eine Einwilligung
 * (siehe docs/AGENTS-VOLTFM.md, 2.3). Stattdessen fragt unser Server dieselbe
 * Schnittstelle ab, die auch das Widget nutzt, und die Seite rendert das
 * Ergebnis selbst.
 *
 * Wie bei laut.fm gilt: Faellt die Quelle aus, gibt es null statt eines Fehlers.
 */

const ENDPOINT = "https://cdn.lautstation.de/json.php";

export const lautstation = {
  name: "lautstation.de",
  /** Die Seite der Station dort — fuer die Quellenangabe. */
  stationUrl: `https://lautstation.de/?station=${encodeURIComponent(site.station)}`,
} as const;

export interface PlaylistTrack {
  /** "23:58", Senderzeit. */
  time: string;
  /** "Interpret - Titel", so wie lautstation.de es liefert. */
  song: string;
}

export interface PlaylistDay {
  /** "2026-10-24" */
  date: string;
  tracks: PlaylistTrack[];
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

export async function getPlaylistDays(): Promise<PlaylistDay[] | null> {
  try {
    const res = await fetch(`${ENDPOINT}?station=${encodeURIComponent(site.station)}`, {
      /* Fuenf Minuten: oft genug fuer "was lief eben", selten genug, um einem
         privaten Projekt nicht mit jedem Seitenaufruf eine Anfrage zu schicken. */
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;

    const raw: unknown = await res.json();
    const days = (raw as { days?: unknown })?.days;
    if (!Array.isArray(days)) return null;

    /* Fremde Daten: nur uebernehmen, was die erwartete Form hat. */
    return days
      .filter((day): day is { date: string; tracks: unknown } => DATE.test(String(day?.date)))
      .map((day) => ({
        date: day.date,
        tracks: (Array.isArray(day.tracks) ? day.tracks : [])
          .map((track: { time?: unknown; song?: unknown }) => ({
            time: TIME.test(String(track?.time)) ? String(track.time) : "",
            song: typeof track?.song === "string" ? track.song.trim() : "",
          }))
          .filter((track: PlaylistTrack) => track.song),
      }))
      .filter((day) => day.tracks.length > 0)
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return null;
  }
}
