import { site } from "@/lib/site";

/**
 * lautstation.de — ein privates Verzeichnis fuer laut.fm-Stationen, das die
 * Playlist der letzten Tage archiviert und dafuer ein Widget anbietet.
 *
 * Die Daten serverseitig abzuholen klappt nicht: lautstation.de beantwortet
 * Anfragen von Vercels Servern mit 403. Bleibt das Widget, und das verbindet
 * den Browser des Besuchers mit einem Dritten. Deshalb laedt es erst nach
 * einem Klick (docs/AGENTS-VOLTFM.md, 2.3) — siehe LautstationPlaylist.
 */
export const lautstation = {
  name: "lautstation.de",
  scriptUrl: "https://cdn.lautstation.de/widget.js",
  stationUrl: `https://lautstation.de/?station=${encodeURIComponent(site.station)}`,
  privacyUrl: "https://lautstation.de/?mode=datenschutz",
  /** localStorage-Schluessel fuer "nicht jedes Mal fragen". */
  consentKey: "voltfm-lautstation-consent",
} as const;
