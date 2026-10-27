import { getNowPlaying, getListenerCount, getLastSongs } from "./metadata";
import { getCurrentAndNextShow } from "./schedule";
import type { RadioSnapshot } from "./types";

export * from "./types";
export * from "./metadata";
export * from "./schedule";
export * from "./stream";

/** So viele Titel zeigt /radio unter "Was gerade lief"; die Startseite weniger. */
const HISTORY_LENGTH = 10;

/**
 * One call for everything the player shows. Each source degrades on its own, so
 * a laut.fm outage costs metadata but never the stream.
 */
export async function getRadioSnapshot(): Promise<RadioSnapshot> {
  const [nowPlaying, listeners, showsResult, history] = await Promise.all([
    getNowPlaying(),
    getListenerCount(),
    getCurrentAndNextShow(),
    getLastSongs(HISTORY_LENGTH, { withCovers: true }),
  ]);

  return {
    nowPlaying,
    listeners,
    currentShow: showsResult.current,
    nextShow: showsResult.next,
    history,
    degraded: nowPlaying === null,
  };
}
