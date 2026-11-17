import "server-only";

import { stationDays } from "@/db/collections";

/** Ein Tag fuer das Diagramm in der Admin-Uebersicht. */
export interface SwitchOnDay {
  /** yyyy-mm-dd in Senderzeit, wie laut.fm ihn fuehrt. */
  date: string;
  /** null: Fuer diesen Tag liegt nichts vor. */
  switchOns: number | null;
  /** Heute: Der Tag laeuft noch, die Zahl ist ein Zwischenstand. */
  partial: boolean;
}

function berlinDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Kalendertag um `offset` Tage verschieben — rechnet in UTC, ohne Sommerzeit-Falle. */
function shiftDate(date: string, offset: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + offset)).toISOString().slice(0, 10);
}

/**
 * Einschaltungen pro Tag fuer die letzten `count` Tage, nur lesend.
 *
 * Die Zahlen sammelt der taegliche Meilenstein-Lauf aus der
 * Radioadmin-API (Sammlung `stationDays`). Die Reihe endet am juengsten Tag,
 * der dort steht, und ist lueckenlos: Fehlt ein Tag, steht er mit `null` drin,
 * damit die Zeitachse nicht springt. Ohne Daten: leere Liste.
 */
export async function listSwitchOnDays(count = 30, now = new Date()): Promise<SwitchOnDay[]> {
  const docs = await stationDays()
    .find({ switchOns: { $exists: true } }, { projection: { date: 1, switchOns: 1 } })
    .sort({ date: -1 })
    .limit(count)
    .toArray();
  if (docs.length === 0) return [];

  const byDate = new Map(docs.map((doc) => [doc.date, doc.switchOns ?? null]));
  const last = docs[0].date;
  const today = berlinDate(now);

  return Array.from({ length: count }, (_, index) => {
    const date = shiftDate(last, index - count + 1);
    return { date, switchOns: byDate.get(date) ?? null, partial: date === today };
  });
}
