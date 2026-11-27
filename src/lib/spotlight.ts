import { formatMonthYear } from "./format";

/**
 * „Im Fokus“: Konstanten für Admin und Seite. Für Browser und Server.
 */

export type SpotlightArt = "team" | "hoerer";

export const SPOTLIGHT_ARTEN: Record<SpotlightArt, string> = {
  team: "Aus dem Team",
  hoerer: "Aus der Hörerschaft",
};

export function isSpotlightArt(value: unknown): value is SpotlightArt {
  return value === "team" || value === "hoerer";
}

/** "JJJJ-MM", Monat 01 bis 12. */
export const MONAT_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/** "2026-11" → "November 2026". Mitte des Monats, damit keine Zeitzone ihn verschiebt. */
export function formatMonat(monat: string): string {
  if (!MONAT_PATTERN.test(monat)) return monat;
  return formatMonthYear(new Date(`${monat}-15T12:00:00Z`));
}

/** Der laufende Monat in Senderzeit als "JJJJ-MM". */
export function currentMonat(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value ?? String(now.getUTCFullYear());
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  return `${year}-${month}`;
}
