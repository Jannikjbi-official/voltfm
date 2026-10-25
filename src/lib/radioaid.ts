import { parseStationTime } from "@/lib/format";

/**
 * Eckdaten der naechsten RadioAid-Ausgabe.
 *
 * Steht bewusst im Code und nicht im CMS: Der Termin wird einmal im Jahr
 * bekanntgegeben und aendert sich nicht spontan. Die Angaben stammen von
 * radioaid.de — aendert sich dort etwas, muss es hier nachgezogen werden.
 *
 * Diese Datei ist die einzige Quelle: Die Seite /radioaid, der Countdown und
 * die Navigation lesen alle hier, damit sie nicht auseinanderlaufen koennen.
 */
export const radioaid = {
  /** Sendestart als Senderzeit (Europe/Berlin). */
  startsAt: "2026-11-06T18:00",
  /** Die Show laeuft 24 Stunden am Stueck. */
  durationHours: 24,
  organisation: "Seelenpflaster e. V.",
  website: "https://radioaid.de/",
  /** Der Spendenlink, auf den radioaid.de selbst verweist. */
  donateUrl: "https://spende.radioaid.de",
  /**
   * Wie lange der Eintrag nach dem Sendeende noch in der Navigation bleibt.
   * Null waere hart: Wer am Morgen danach nachschauen will, was lief, stuende
   * vor einem verschwundenen Menuepunkt.
   */
  navGraceHours: 24,
} as const;

export type RadioAidPhase = "upcoming" | "live" | "over";

export interface RadioAidSchedule {
  start: Date;
  end: Date;
  phase: RadioAidPhase;
  /** Solange true, gehoert RadioAid in die Hauptnavigation. */
  showInNav: boolean;
}

/**
 * Wo wir gerade stehen. Erwartet `now` als Parameter, damit der Aufrufer
 * entscheidet, welche Uhr gilt — auf dem Server die des Servers, im Browser
 * die des Besuchers. Ein eingebautes `Date.now()` wuerde in einer
 * Server-Komponente eine Zeit einfrieren, die der Browser spaeter anders sieht.
 */
export function getRadioAidSchedule(now: Date = new Date()): RadioAidSchedule {
  const start = parseStationTime(radioaid.startsAt);
  const end = new Date(start.getTime() + radioaid.durationHours * 3_600_000);
  const navUntil = new Date(end.getTime() + radioaid.navGraceHours * 3_600_000);

  const phase: RadioAidPhase =
    now < start ? "upcoming" : now <= end ? "live" : "over";

  return { start, end, phase, showInNav: now <= navUntil };
}
