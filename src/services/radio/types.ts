/** Shapes returned by the VoltFM radio services. Deliberately decoupled from
 *  the raw laut.fm payloads so pages never depend on upstream field names. */

export type PlayerStatus =
  | "idle"
  | "connecting"
  | "playing"
  | "paused"
  | "error"
  | "offline";

export interface NowPlaying {
  title: string;
  artist: string;
  album: string | null;
  genre: string | null;
  releaseYear: number | null;
  /** Track length in seconds, when the station reports it. */
  length: number | null;
  startedAt: string | null;
  endsAt: string | null;
  /** Cover art resolved from the iTunes Search API; null when not found. */
  coverUrl: string | null;
}

export interface StationInfo {
  name: string;
  displayName: string;
  description: string;
  format: string;
  djs: string[];
  genres: string[];
  location: string | null;
  pageUrl: string;
  streamUrl: string;
  imageUrl: string | null;
}

export interface ScheduleSlot {
  id: number;
  name: string;
  description: string | null;
  /** 0 = Sunday … 6 = Saturday, matching Date#getDay. */
  weekday: number;
  startHour: number;
  /** Minuten ab Beginn der Stunde — laut.fm-Slots starten immer zur vollen Stunde. */
  startMinute: number;
  /**
   * Dauer in Minuten. laut.fm liefert entweder `end_time` (Stunde des Endes)
   * oder `length` (Sekunden der Playlist) — hier ist beides schon verrechnet.
   */
  durationMinutes: number;
  color: string | null;
}

export interface CurrentShow {
  name: string;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  color: string | null;
}

export interface TrackHistoryItem {
  id: number;
  title: string;
  artist: string;
  startedAt: string | null;
  /** Cover from the iTunes Search API; null when not found or not requested. */
  coverUrl: string | null;
}

/** Everything the player needs in one request. */
export interface RadioSnapshot {
  nowPlaying: NowPlaying | null;
  listeners: number | null;
  currentShow: CurrentShow | null;
  nextShow: CurrentShow | null;
  /**
   * Die zuletzt gespielten Titel, neueste zuerst. Kommt mit jedem Abruf mit,
   * damit "Was gerade lief" so aktuell ist wie "Läuft gerade" — und nicht so
   * alt wie die zuletzt neu gebaute Seite.
   */
  history: TrackHistoryItem[];
  /** True when metadata could not be reached. The stream still plays. */
  degraded: boolean;
}
