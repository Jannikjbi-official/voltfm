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

/* --- `datetime-local` <-> stored UTC ------------------------------------- */

/**
 * How far Berlin's clock runs ahead of UTC at a given instant, in ms.
 * Read from Intl rather than hard-coded, so summer time is handled.
 */
function berlinOffsetMs(date: Date): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - date.getTime();
}

/**
 * Reads a `<input type="datetime-local">` value as Berlin station time.
 *
 * `new Date("2025-06-01T20:00")` would use the *server's* timezone, and on
 * Vercel that is UTC — an event entered for 20:00 would be stored as 22:00
 * Berlin. Editors type station time, so that is what we parse.
 */
export function parseStationTime(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value.trim());
  if (!match) return new Date(Number.NaN);

  const naive = Date.UTC(+match[1], +match[2] - 1, +match[3], +match[4], +match[5]);
  // Two passes: the first offset is looked up at the wrong instant when the
  // date sits right at a DST switch, the second lands on the correct side.
  const first = naive - berlinOffsetMs(new Date(naive));
  return new Date(naive - berlinOffsetMs(new Date(first)));
}

/** The inverse: a stored date as a `datetime-local` value in station time. */
export function toStationTimeInput(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  const shifted = new Date(date.getTime() + berlinOffsetMs(date));
  return shifted.toISOString().slice(0, 16);
}

/**
 * Liest ein Datum aus einem Eingabefeld — als Senderzeit, Mitternacht.
 *
 * Akzeptiert `JJJJ-MM-TT` (was `<input type="date">` liefert) und die deutsche
 * Schreibweise `TT.MM.JJJJ`, weil die beim Tippen naheliegt. Alles andere
 * ergibt `null` statt eines ungueltigen Datums: Ein `Invalid Date` in der
 * Datenbank faellt erst viel spaeter auf, und dann als unerklaerliche Anzeige.
 */
export function parseDateInput(value: string): Date | null {
  const input = value.trim();
  if (!input) return null;

  const german = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(input);
  const iso = german
    ? `${german[3]}-${german[2].padStart(2, "0")}-${german[1].padStart(2, "0")}`
    : input;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;

  const date = parseStationTime(`${iso}T00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
