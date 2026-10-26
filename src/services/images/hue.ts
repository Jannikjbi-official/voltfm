import "server-only";

import sharp from "sharp";

import { dominantHue } from "@/lib/color";
import { site } from "@/lib/site";

/**
 * Der Farbton eines Profilbilds, als OKLCH-Hue — oder null.
 *
 * Laeuft auf dem Server; der Browser des Besuchers laedt dafuer nichts. Das
 * Bild wird einen Tag lang im fetch-Cache gehalten, gerechnet wird auf 48 × 48
 * Pixeln. Jeder Fehler (kein Bild, Zeitueberschreitung, unbekanntes Format)
 * endet in null, und die Seite nimmt die Senderfarbe.
 */
export async function imageHue(src: string | null | undefined): Promise<number | null> {
  if (!src) return null;

  try {
    const url = new URL(src, site.url);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    // Discord liefert jede Groesse; fuer einen Farbton reicht die kleinste.
    if (url.hostname === "cdn.discordapp.com") url.searchParams.set("size", "64");

    const res = await fetch(url, {
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;

    const { data, info } = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(48, 48, { fit: "cover" })
      // Transparente Stellen werden grau und zaehlen damit nicht mit.
      .flatten({ background: "#808080" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    return dominantHue(data, info.channels);
  } catch {
    return null;
  }
}
