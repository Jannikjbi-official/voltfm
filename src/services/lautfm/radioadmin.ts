import "server-only";

import { site } from "@/lib/site";

/**
 * Die laut.fm-Radioadmin-API — dieselbe, mit der die Stationsverwaltung
 * arbeitet. Hier nur lesend: Tageszahlen und die Songliste eines Tages.
 *
 * Doku: eine Community-Spezifikation (radioadmin-api-spec.yaml, 1.0.1), keine
 * offizielle von laut.fm. Anmeldung mit Token und Origin:
 *
 *   LAUTFM_RADIOADMIN_TOKEN   das Token aus dem Radioadmin-Login
 *   LAUTFM_RADIOADMIN_ORIGIN  die Adresse, mit der es geholt wurde
 *                             (Standard: https://www.voltfm.xyz)
 *
 * Achtung: Das Token ist ein Admin-Schluessel. Damit liessen sich auch
 * Playlists aendern oder das Live-Passwort zuruecksetzen — deshalb nur als
 * geheime Variable in Vercel, und hier ausschliesslich GET.
 */

const API = "https://api.radioadmin.laut.fm";

export class RadioadminError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function radioadminConfigured(): boolean {
  return Boolean(process.env.LAUTFM_RADIOADMIN_TOKEN);
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.LAUTFM_RADIOADMIN_TOKEN}`,
      Origin: process.env.LAUTFM_RADIOADMIN_ORIGIN ?? "https://www.voltfm.xyz",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new RadioadminError(res.status, `laut.fm antwortet ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

let stationId: number | null = null;

/** Die Radioadmin-ID der Station (nicht der Name — die API will die Zahl). */
async function getStationId(): Promise<number> {
  if (stationId !== null) return stationId;
  const data = await get<{ id: number; name: string }[] | { stations: { id: number; name: string }[] }>(
    "/stations",
  );
  const list = Array.isArray(data) ? data : data.stations;
  const station = list.find((s) => s.name === site.station);
  if (!station) throw new RadioadminError(404, `Station ${site.station} gehoert nicht zu diesem Token.`);
  stationId = station.id;
  return station.id;
}

export interface StationStats {
  listenersNow: number | null;
  positionNow: number | null;
  /** yyyy-mm-dd -> Einschaltungen, hoechstens 15 Tage. */
  switchOns: Record<string, number>;
  /** yyyy-mm-dd -> Hoerstunden, hoechstens 15 Tage. */
  listeningHours: Record<string, number>;
}

export async function getStationStats(): Promise<StationStats> {
  const id = await getStationId();
  const data = await get<{
    listeners_now?: number;
    position_now?: number;
    switchons_log?: Record<string, number>;
    tlh_log?: Record<string, number>;
  }>(`/stations/${id}/stats`);
  return {
    listenersNow: data.listeners_now ?? null,
    positionNow: data.position_now ?? null,
    switchOns: data.switchons_log ?? {},
    listeningHours: data.tlh_log ?? {},
  };
}

export interface TrackStat {
  title: string;
  artist: string;
  startedAt: Date | null;
  listeners: number;
}

/** Jeder Song eines Tages mit der Hoererzahl bei seinem Start. */
export async function getTrackStats(date: string): Promise<TrackStat[]> {
  const id = await getStationId();
  const data = await get<
    { title?: string; artist?: { name?: string } | string; started_at?: string; listeners?: number }[]
  >(`/stations/${id}/tracks/stats/${date}`);

  return (Array.isArray(data) ? data : []).map((row) => ({
    title: row.title ?? "",
    artist: typeof row.artist === "string" ? row.artist : (row.artist?.name ?? ""),
    startedAt: parseDate(row.started_at),
    listeners: typeof row.listeners === "number" ? row.listeners : 0,
  }));
}

/**
 * laut.fm schreibt Zeiten mal als ISO, mal als "2026-11-13 20:15:00 +0100".
 * Beides wird zu einem Date; was sich nicht lesen laesst, zu null.
 */
function parseDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  for (const candidate of [raw, raw.replace(" ", "T").replace(/ ([+-]\d{2}):?(\d{2})$/, "$1:$2")]) {
    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}
