import { getNowPlaying, getListenerCount } from "./metadata";
import { getCurrentAndNextShow } from "./schedule";
import type { RadioSnapshot } from "./types";

export * from "./types";
export * from "./metadata";
export * from "./schedule";
export * from "./stream";

/**
 * One call for everything the player shows. Each source degrades on its own, so
 * a laut.fm outage costs metadata but never the stream.
 */
export async function getRadioSnapshot(): Promise<RadioSnapshot> {
  const [nowPlaying, listeners, showsResult] = await Promise.all([
    getNowPlaying(),
    getListenerCount(),
    getCurrentAndNextShow(),
  ]);

  return {
    nowPlaying,
    listeners,
    currentShow: showsResult.current,
    nextShow: showsResult.next,
    degraded: nowPlaying === null,
  };
}
