import { site } from "@/lib/site";
import type { NowPlaying, StationInfo, TrackHistoryItem } from "./types";

/**
 * laut.fm metadata.
 *
 * Endpoints are the ones the station itself advertises under `api_urls`:
 *   https://api.laut.fm/station/<station>
 *   https://api.laut.fm/station/<station>/current_song
 *   https://api.laut.fm/station/<station>/last_songs
 *   https://api.laut.fm/station/<station>/listeners
 *
 * Every function here resolves to null rather than throwing. Metadata is a
 * nice-to-have: if laut.fm is slow or down the player must still stream.
 */

const API = "https://api.laut.fm/station";

async function fetchJson<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(`${API}/${site.station}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(5000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

interface RawSong {
  id: number;
  title: string;
  album: string | null;
  length: number | null;
  genre: string | null;
  releaseyear: number | null;
  artist: { name: string } | null;
  started_at: string | null;
  ends_at: string | null;
}

/** laut.fm timestamps look like "2026-09-18 13:39:52 +0200". */
function toIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value.replace(" ", "T").replace(" ", ""));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function mapSong(raw: RawSong, coverUrl: string | null = null): NowPlaying {
  return {
    title: raw.title?.trim() || "Unbekannter Titel",
    artist: raw.artist?.name?.trim() || "Unbekannter Interpret",
    album: raw.album?.trim() || null,
    genre: raw.genre?.trim() || null,
    releaseYear: raw.releaseyear ?? null,
    length: raw.length ?? null,
    startedAt: toIso(raw.started_at),
    endsAt: toIso(raw.ends_at),
    coverUrl,
  };
}

export async function getNowPlaying(): Promise<NowPlaying | null> {
  // Songs change every few minutes, so this is the shortest-lived cache here.
  const raw = await fetchJson<RawSong>("/current_song", 20);
  if (!raw) return null;
  const cover = await getCoverArt(raw.artist?.name ?? "", raw.title ?? "");
  return mapSong(raw, cover);
}

/**
 * Die zuletzt gespielten Titel.
 *
 * Mit `withCovers` wird zu jedem Titel das Cover gesucht. Das sind bis zu
 * `limit` Anfragen an iTunes, aber jede liegt einen Tag im fetch-Cache — ein
 * Titel wird also einmal am Tag gesucht, nicht bei jedem Abruf.
 */
export async function getLastSongs(
  limit = 8,
  { withCovers = false }: { withCovers?: boolean } = {},
): Promise<TrackHistoryItem[]> {
  const raw = await fetchJson<RawSong[]>("/last_songs", 30);
  if (!Array.isArray(raw)) return [];
  const songs = raw.slice(0, limit);
  const covers = withCovers
    ? await Promise.all(
        songs.map((song) => getCoverArt(song.artist?.name ?? "", song.title ?? "")),
      )
    : [];
  return songs.map((song, index) => ({
    id: song.id,
    title: song.title?.trim() || "Unbekannter Titel",
    artist: song.artist?.name?.trim() || "Unbekannter Interpret",
    startedAt: toIso(song.started_at),
    coverUrl: covers[index] ?? null,
  }));
}

/**
 * Die letzten Songs mit allen Angaben (Album, Ende), ohne Cover-Suche — fuer
 * die eigene Aufzeichnung in src/services/plays. `null`, wenn laut.fm nicht
 * antwortet; eine leere Liste ist eine echte Antwort.
 */
export async function getPlayedSongs(): Promise<NowPlaying[] | null> {
  const raw = await fetchJson<RawSong[]>("/last_songs", 30);
  if (!Array.isArray(raw)) return null;
  return raw.map((song) => mapSong(song));
}

export async function getListenerCount(): Promise<number | null> {
  try {
    const res = await fetch(`${API}/${site.station}/listeners`, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const value = Number((await res.text()).trim());
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

interface RawStation {
  name: string;
  display_name: string;
  description: string | null;
  format: string | null;
  djs: string | null;
  genres: string[] | null;
  location: string | null;
  page_url: string;
  stream_url: string;
  images: Record<string, string> | null;
}

export async function getStationInfo(): Promise<StationInfo | null> {
  const raw = await fetchJson<RawStation>("", 3600);
  if (!raw) return null;
  return {
    name: raw.name,
    displayName: site.name,
    description: raw.description?.replace(/^„/, "").trim() ?? "",
    format: raw.format?.trim() ?? "",
    djs: (raw.djs ?? "")
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean),
    genres: raw.genres ?? [],
    location: raw.location ?? null,
    pageUrl: raw.page_url,
    streamUrl: raw.stream_url,
    imageUrl: raw.images?.station_640x640 ?? raw.images?.station ?? null,
  };
}

/**
 * laut.fm does not serve cover art, so covers come from the public iTunes
 * Search API. It needs no key and is strictly best-effort: a miss just means
 * the player falls back to the VoltFM monogram.
 */
async function getCoverArt(artist: string, title: string): Promise<string | null> {
  if (!artist || !title) return null;
  try {
    const term = encodeURIComponent(`${artist} ${title}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=1`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: { artworkUrl100?: string }[];
    };
    const art = data.results?.[0]?.artworkUrl100;
    // The 100px thumbnail URL upscales cleanly by string substitution.
    return art ? art.replace("100x100bb", "600x600bb") : null;
  } catch {
    return null;
  }
}
