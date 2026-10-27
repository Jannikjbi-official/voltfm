import { getImageProps } from "next/image";

/**
 * Wo ein Cover herkommt: immer ueber den Bildoptimierer von Next
 * (`/_next/image`), nie direkt von iTunes.
 *
 * Die Cover liegen bei Apple (`is1-ssl.mzstatic.com`). Wuerde der Browser sie
 * dort abholen, erfuehre Apple bei jedem Songwechsel die IP-Adresse jedes
 * Besuchers. Ueber `/_next/image` holt unser Server das Bild, der Browser
 * spricht nur mit voltfm.xyz — genau wie bei den Discord-Avataren.
 *
 * Es gibt bewusst nur zwei Groessen. Jede Breite eines Covers ist bei Vercel
 * eine eigene Bildumwandlung, und alle drei Minuten kommt ein neues Cover:
 *
 *   "thumb" — 96 px: Leiste, Titelliste, und weichgezeichnet als Hintergrund
 *   "large" — 640 px: das grosse Cover im Hero, auf /radio, Sperrbildschirm
 *
 * `getImageProps` liefert als `src` die 2x-Variante der angegebenen Breite —
 * 48 ergibt die 96er-, 320 die 640er-Datei. Beide Breiten stehen in den
 * Standardlisten (`imageSizes` bzw. `deviceSizes`) aus next.config.
 */
const WIDTH = { thumb: 48, large: 320 } as const;

export type CoverSize = keyof typeof WIDTH;

export function coverSrc(url: string, size: CoverSize): string {
  const width = WIDTH[size];
  return getImageProps({ src: url, alt: "", width, height: width }).props.src;
}

/** Tatsaechliche Kantenlaenge der Datei — fuer die Media Session. */
export const COVER_PIXELS: Record<CoverSize, number> = { thumb: 96, large: 640 };
