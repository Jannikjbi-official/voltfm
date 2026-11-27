import "server-only";

import { MongoBulkWriteError, type AnyBulkWriteOperation } from "mongodb";

import { plays } from "@/db/collections";
import { isPreviewDeploy } from "@/lib/deploy";
import { parseStationTime } from "@/lib/format";
import { getPlayedSongs } from "@/services/radio/metadata";
import type { Play } from "@/types/content";

/**
 * Was auf VoltFM gelaufen ist.
 *
 * laut.fm gibt nur die letzten zehn Songs heraus. Damit Charts und Archiv
 * mehr zeigen koennen, schreibt VoltFM selbst mit: Jeder Abruf von
 * `last_songs` wird eingetragen, ein Titel pro Startzeit. Weil der Schluessel
 * (startedAt + title + artist) eindeutig ist, schadet doppeltes Eintragen
 * nicht — es bleibt beim ersten Eintrag.
 *
 * Angestossen wird das vom Cron-Aufruf /api/cron/gespielt (alle 15 Minuten,
 * deckt bei rund drei Minuten pro Song zehn Titel gut ab) und nebenbei von
 * den Seiten /radio, /charts und /gespielt, hoechstens alle fuenf Minuten.
 * Lauecken gibt es trotzdem, wenn laenger niemand aufruft und der Cron fehlt —
 * deshalb sagen die Seiten, seit wann gezaehlt wird.
 */

export interface RecordResult {
  ok: boolean;
  /** Songs in der Antwort von laut.fm. */
  fetched: number;
  /** Davon neu eingetragen. */
  inserted: number;
  error?: string;
}

export async function recordRecentPlays(): Promise<RecordResult> {
  const songs = await getPlayedSongs();
  if (!songs) return { ok: false, fetched: 0, inserted: 0, error: "laut.fm nicht erreichbar" };

  const now = new Date();
  const operations: AnyBulkWriteOperation<Play>[] = [];
  for (const song of songs) {
    // Ohne Startzeit laesst sich ein Titel nicht einordnen und nicht entdoppeln.
    if (!song.startedAt) continue;
    const startedAt = new Date(song.startedAt);
    const doc: Omit<Play, "_id"> = {
      title: song.title,
      artist: song.artist,
      album: song.album,
      startedAt,
      endsAt: song.endsAt ? new Date(song.endsAt) : null,
      recordedAt: now,
    };
    if (song.coverUrl) doc.coverUrl = song.coverUrl;
    operations.push({
      updateOne: {
        filter: { startedAt, title: song.title, artist: song.artist },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    });
  }
  if (operations.length === 0) return { ok: true, fetched: songs.length, inserted: 0 };

  try {
    const result = await plays().bulkWrite(operations, { ordered: false });
    return { ok: true, fetched: songs.length, inserted: result.upsertedCount };
  } catch (error) {
    // Zwei Laeufe gleichzeitig: Der zweite stoesst auf den eindeutigen Index.
    // Das ist kein Fehler, der Titel steht ja schon drin.
    if (error instanceof MongoBulkWriteError) {
      const errors = Array.isArray(error.writeErrors) ? error.writeErrors : [error.writeErrors];
      if (errors.every((e) => e.code === 11000)) {
        return { ok: true, fetched: songs.length, inserted: error.result.upsertedCount };
      }
    }
    console.error("[plays] Eintragen fehlgeschlagen", error);
    return { ok: false, fetched: songs.length, inserted: 0, error: "Datenbank nicht erreichbar" };
  }
}

/* --- Nebenbei mitschreiben ------------------------------------------------ */

const THROTTLE_MS = 5 * 60 * 1000;
let lastAttempt = 0;

/**
 * Fuer Seiten, die ohnehin gerendert werden: traegt hoechstens alle fuenf
 * Minuten pro Server-Prozess ein. Wirft nie. Gedacht fuer `after()`.
 */
export async function recordRecentPlaysThrottled(): Promise<void> {
  // Beim Bauen nicht: Da gibt es oft keine Datenbank, und es eilt nicht.
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  // Testseiten teilen sich die Datenbank mit voltfm.xyz; eingetragen wird dort.
  if (isPreviewDeploy()) return;
  const now = Date.now();
  if (now - lastAttempt < THROTTLE_MS) return;
  lastAttempt = now;
  try {
    await recordRecentPlays();
  } catch (error) {
    console.error("[plays] Mitschreiben fehlgeschlagen", error);
  }
}

/* --- Senderzeit ----------------------------------------------------------- */

/** Heute in Senderzeit als yyyy-mm-dd. */
export function stationToday(now = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Ein Kalendertag weiter oder zurueck, als yyyy-mm-dd. */
export function shiftDay(day: string, by: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + by)).toISOString().slice(0, 10);
}

export function isDayString(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(parseStationTime(`${value}T00:00`).getTime());
}

/* --- Lesen ---------------------------------------------------------------- */

export interface PlayItem {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  startedAt: string;
}

function toItem(doc: Play & { _id?: unknown }): PlayItem {
  return {
    id: String(doc._id ?? ""),
    title: doc.title,
    artist: doc.artist,
    album: doc.album ?? null,
    startedAt: doc.startedAt.toISOString(),
  };
}

async function safe<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error("[plays] Abfrage fehlgeschlagen", error);
    return fallback;
  }
}

/** Der aelteste Eintrag — seit dann wird gezaehlt. */
export async function firstPlayAt(): Promise<string | null> {
  return safe(async () => {
    const doc = await plays().find({}, { projection: { startedAt: 1 } }).sort({ startedAt: 1 }).limit(1).next();
    return doc ? doc.startedAt.toISOString() : null;
  }, null);
}

export type ChartRange = "woche" | "monat" | "gesamt";

/** Beginn des Zeitraums in Senderzeit: Montag 0 Uhr bzw. der Erste des Monats. */
export function rangeStart(range: ChartRange, now = new Date()): Date | null {
  if (range === "gesamt") return null;
  const today = stationToday(now);
  if (range === "monat") return parseStationTime(`${today.slice(0, 8)}01T00:00`);
  const [y, m, d] = today.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sonntag
  const monday = shiftDay(today, -((weekday + 6) % 7));
  return parseStationTime(`${monday}T00:00`);
}

export interface ChartSong {
  title: string;
  artist: string;
  count: number;
}

export interface ChartArtist {
  artist: string;
  count: number;
  /** Verschiedene Titel des Interpreten im Zeitraum. */
  songs: number;
}

export interface Charts {
  total: number;
  songs: ChartSong[];
  artists: ChartArtist[];
}

export async function getCharts(range: ChartRange, limit = 20): Promise<Charts> {
  const from = rangeStart(range);
  const match = from ? { startedAt: { $gte: from } } : {};
  return safe(
    async () => {
      const [total, songs, artists] = await Promise.all([
        plays().countDocuments(match),
        plays()
          .aggregate<ChartSong>([
            { $match: match },
            {
              $group: {
                _id: { title: "$title", artist: "$artist" },
                count: { $sum: 1 },
                last: { $max: "$startedAt" },
              },
            },
            // Bei Gleichstand gewinnt, was zuletzt lief.
            { $sort: { count: -1, last: -1 } },
            { $limit: limit },
            { $project: { _id: 0, title: "$_id.title", artist: "$_id.artist", count: 1 } },
          ])
          .toArray(),
        plays()
          .aggregate<ChartArtist>([
            { $match: match },
            {
              $group: {
                _id: "$artist",
                count: { $sum: 1 },
                titles: { $addToSet: "$title" },
                last: { $max: "$startedAt" },
              },
            },
            { $sort: { count: -1, last: -1 } },
            { $limit: limit },
            { $project: { _id: 0, artist: "$_id", count: 1, songs: { $size: "$titles" } } },
          ])
          .toArray(),
      ]);
      return { total, songs, artists };
    },
    { total: 0, songs: [], artists: [] },
  );
}

export interface PlayPage {
  items: PlayItem[];
  total: number;
}

/**
 * Ein Tag (oder eine Stunde davon) im Archiv, neueste zuerst. `hour` ist die
 * Stunde in Senderzeit, 0–23.
 */
export async function listPlaysOfDay(
  day: string,
  { hour, page = 1, perPage = 50 }: { hour?: number | null; page?: number; perPage?: number } = {},
): Promise<PlayPage> {
  const hh = (value: number) => String(value).padStart(2, "0");
  const from = parseStationTime(`${day}T${hour == null ? "00" : hh(hour)}:00`);
  const to =
    hour == null || hour === 23
      ? parseStationTime(`${shiftDay(day, 1)}T00:00`)
      : parseStationTime(`${day}T${hh(hour + 1)}:00`);
  return pageOf({ startedAt: { $gte: from, $lt: to } }, page, perPage);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Suche nach Titel oder Interpret im ganzen Archiv, neueste zuerst. */
export async function searchPlays(
  query: string,
  { page = 1, perPage = 50 }: { page?: number; perPage?: number } = {},
): Promise<PlayPage> {
  const pattern = new RegExp(escapeRegex(query.trim().slice(0, 100)), "i");
  return pageOf({ $or: [{ title: pattern }, { artist: pattern }] }, page, perPage);
}

async function pageOf(
  filter: Parameters<ReturnType<typeof plays>["find"]>[0],
  page: number,
  perPage: number,
): Promise<PlayPage> {
  return safe(
    async () => {
      const [docs, total] = await Promise.all([
        plays()
          .find(filter ?? {})
          .sort({ startedAt: -1 })
          .skip((Math.max(1, page) - 1) * perPage)
          .limit(perPage)
          .toArray(),
        plays().countDocuments(filter ?? {}),
      ]);
      return { items: docs.map(toItem), total };
    },
    { items: [], total: 0 },
  );
}
