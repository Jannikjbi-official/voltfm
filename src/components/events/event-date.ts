/**
 * Tag, Monat und Wochentag eines Termins in Senderzeit — fuer die
 * Kalenderblaetter auf Karten und Event-Seiten. Immer Europe/Berlin, sonst
 * rutscht ein Abendtermin auf Vercel (UTC) in den falschen Tag.
 */
export function eventDateParts(value: string | Date) {
  const date = new Date(value);
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", ...options }).format(date);

  return {
    day: part({ day: "2-digit" }),
    month: part({ month: "short" }),
    monthLong: part({ month: "long" }),
    weekday: part({ weekday: "long" }),
    year: part({ year: "numeric" }),
  };
}
