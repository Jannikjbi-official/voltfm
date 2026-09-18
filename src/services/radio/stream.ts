import { site } from "@/lib/site";

/**
 * Stream access only — no metadata concerns here.
 *
 * The browser connects directly to laut.fm via a native <audio> element; VoltFM
 * never restreams server-side. This module just resolves the URL.
 */

export function getStreamUrl(): string {
  return site.streamUrl;
}

/**
 * Icecast rejects a second connection from the same client on some setups when
 * an old one lingers, and browsers aggressively cache the stream response.
 * A cache-busting param on (re)connect avoids both.
 */
export function getStreamUrlWithCacheBust(): string {
  const url = new URL(getStreamUrl());
  url.searchParams.set("_", Date.now().toString(36));
  return url.toString();
}
