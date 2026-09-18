/**
 * Formatting helpers. All output is German and pinned to Europe/Berlin so the
 * server and the browser never disagree about what "heute" means.
 */

const TZ = "Europe/Berlin";

export function formatDate(value: string | Date, style: "long" | "short" = "long"): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: TZ,
    day: "2-digit",
    month: style === "long" ? "long" : "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return `${formatDate(date)}, ${formatTime(date)} Uhr`;
}

/** "vor 3 Tagen" / "in 2 Wochen", for article and event metadata. */
export function formatRelative(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = date.getTime() - Date.now();
  const formatter = new Intl.RelativeTimeFormat("de-DE", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000_000],
    ["month", 2_592_000_000],
    ["week", 604_800_000],
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ];

  for (const [unit, ms] of units) {
    if (Math.abs(diffMs) >= ms) return formatter.format(Math.round(diffMs / ms), unit);
  }
  return "gerade eben";
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} Min. Lesezeit`;
}

export function formatListeners(count: number | null | undefined): string {
  if (typeof count !== "number") return "";
  return `${new Intl.NumberFormat("de-DE").format(count)} ${count === 1 ? "Hörer" : "Hörer"}`;
}

/** Turns a title into a URL-safe slug with proper German transliteration. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}
