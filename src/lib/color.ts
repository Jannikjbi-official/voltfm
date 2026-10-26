/**
 * Farbrechnung ohne Abhaengigkeiten — fuer die Profilfarbe aus dem
 * Profilbild (src/services/images/hue.ts).
 */

/** sRGB (0–255) nach OKLab, nach Björn Ottosson. */
export function srgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const linear = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lr = linear(r);
  const lg = linear(g);
  const lb = linear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const BINS = 36;
/** Unterhalb davon ist ein Pixel grau genug, um nicht mitzuzaehlen. */
const MIN_CHROMA = 0.03;

/**
 * Der Farbton, der ein Bild praegt, als OKLCH-Hue (0–360).
 *
 * Gezaehlt wird in einem Histogramm ueber den Farbkreis, gewichtet nach
 * Buntheit: Schwarz, Weiss und Grau zaehlen nicht, kraeftige Farben mehr als
 * blasse. Ein Mittelwert ueber alle Pixel waere falsch — Lila und Gold heben
 * sich darin zu einem schlammigen Nichts auf. Liefert null, wenn das Bild
 * praktisch farblos ist.
 *
 * `pixels` sind rohe RGB-Werte, `channels` Byte pro Pixel (3 oder 4).
 */
export function dominantHue(pixels: Uint8Array, channels: number): number | null {
  const weight = new Float64Array(BINS);
  const sumA = new Float64Array(BINS);
  const sumB = new Float64Array(BINS);
  let colourful = 0;
  const count = Math.floor(pixels.length / channels);

  for (let i = 0; i < pixels.length; i += channels) {
    const [, a, b] = srgbToOklab(pixels[i], pixels[i + 1], pixels[i + 2]);
    const chroma = Math.hypot(a, b);
    if (chroma < MIN_CHROMA) continue;

    const hue = (Math.atan2(b, a) * 180) / Math.PI;
    const bin = Math.floor(((hue + 360) % 360) / (360 / BINS)) % BINS;
    const w = chroma * chroma;
    weight[bin] += w;
    sumA[bin] += a * w;
    sumB[bin] += b * w;
    colourful++;
  }

  // Weniger als ein Zehntel bunte Pixel: kein Farbton, der das Bild traegt.
  if (count === 0 || colourful < count * 0.1) return null;

  let best = 0;
  for (let bin = 1; bin < BINS; bin++) if (weight[bin] > weight[best]) best = bin;

  // Der staerkste Bereich samt Nachbarn, damit ein Farbton auf einer
  // Bin-Grenze nicht zerfaellt.
  let a = 0;
  let b = 0;
  for (const offset of [-1, 0, 1]) {
    const bin = (best + offset + BINS) % BINS;
    a += sumA[bin];
    b += sumB[bin];
  }

  return Math.round(((Math.atan2(b, a) * 180) / Math.PI + 360) % 360);
}
