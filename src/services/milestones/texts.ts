import { formatDate, formatTime } from "@/lib/format";

/**
 * Die Texte der automatischen Beitraege — vom Betreiber am 14.11.2026
 * freigegeben (jeweils Variante A; beim Monat ergaenzt um "seit die Seite
 * mitzaehlt", wie beim Rekord). Nur die Zahlen und Namen in den
 * Platzhaltern kommen aus den Daten; daran nichts dazuerfinden.
 */

export interface MilestoneText {
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown, wie im Editor. */
  source: string;
  /** Die grosse Zeile auf dem erzeugten Titelbild. */
  coverLabel: string;
}

const number = new Intl.NumberFormat("de-DE");
const monthName = new Intl.DateTimeFormat("de-DE", { month: "long", timeZone: "UTC" });

/** "November 2026" fuer einen Monat im Format yyyy-mm. */
function monthLabel(month: string): { name: string; year: string } {
  const [year, m] = month.split("-").map(Number);
  return { name: monthName.format(new Date(Date.UTC(year, m - 1, 1))), year: String(year) };
}

export function monthlySwitchOnsText(input: {
  month: string;
  threshold: number;
  switchOns: number;
  listeningHours: number;
}): MilestoneText {
  const { name, year } = monthLabel(input.month);
  const marke = number.format(input.threshold);
  const zahl = number.format(input.switchOns);
  const stunden = number.format(input.listeningHours);
  return {
    slug: `ueber-${input.threshold}-einschaltungen-${input.month}`,
    title: `Über ${marke} Einschaltungen im ${name}`,
    excerpt: `Im ${name} ${year} wurde VoltFM ${zahl}-mal eingeschaltet, zum ersten Mal über ${marke}, seit die Seite mitzählt.`,
    source: `Im ${name} ${year} wurde VoltFM ${zahl}-mal eingeschaltet, zum ersten Mal über ${marke}, seit die Seite mitzählt. Zusammen waren das ${stunden} Stunden Radio. Die Zahlen kommen direkt von laut.fm.

Danke an alle, die eingeschaltet haben, und an alle, die VoltFM weitererzählen.`,
    coverLabel: marke,
  };
}

export function simultaneousRecordText(input: {
  threshold: number;
  listeners: number;
  at: Date | null;
  date: string;
  title: string;
  artist: string;
}): MilestoneText {
  const zahl = number.format(input.listeners);
  // Ohne Uhrzeit von laut.fm bleibt es beim Tag — erfunden wird keine.
  const when = input.at
    ? `Am ${formatDate(input.at)} um ${formatTime(input.at)} Uhr`
    : `Am ${formatDate(`${input.date}T12:00:00Z`)}`;
  const song = input.title && input.artist ? ` Gerade lief „${input.title}“ von ${input.artist}.` : "";
  const lead = `${when} haben ${zahl} Leute gleichzeitig VoltFM gehört, so viele wie noch nie, seit die Seite mitzählt.`;
  return {
    slug: `${input.listeners}-leute-gleichzeitig-${input.date}`,
    title: `${zahl} Leute gleichzeitig`,
    excerpt: lead,
    source: `${lead}${song}`,
    coverLabel: zahl,
  };
}

export function anniversaryText(input: { years: number }): MilestoneText {
  return {
    slug: `${input.years}-jahre-voltfm`,
    title: `${input.years} Jahre VoltFM`,
    excerpt: `Im Januar 2021 hat alles mit einer laut.fm-Station namens jannikjbi angefangen. Heute ist das ${input.years} Jahre her.`,
    source: `Im Januar 2021 hat alles mit einer laut.fm-Station namens jannikjbi angefangen. Daraus wurde jannikjbiFM und irgendwann VoltFM. Heute ist das ${input.years} Jahre her.

Danke an alle, die zuhören, mitreden und mitmachen. Die ganze Geschichte steht auf [Über uns](/ueber-uns).`,
    coverLabel: `${input.years} Jahre`,
  };
}
