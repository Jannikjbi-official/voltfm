/**
 * Vorschläge, Playlist-Ideen und Highlights aus dem Discord.
 *
 * Gelesen und geschrieben wird in zwei Kanälen (`site.discordIdeaChannels`).
 * Ein dritter Kanal, die Highlights (DISCORD_HIGHLIGHTS_CHANNEL_ID), wird nur
 * gelesen: Dafür gibt es kein Formular, und ohne Kanal-ID ist er aus.
 * Öffentlich auf voltfm.xyz steht ein Eintrag erst, wenn ihn jemand im Admin
 * freigegeben hat — so landet kein Spam und nichts Persönliches ungeprüft auf
 * der Seite. Wird die Nachricht im Discord gelöscht, verschwindet sie auch
 * hier, denn die Texte werden nicht gespeichert, sondern jedes Mal gelesen.
 *
 * Diese Datei ist für Browser und Server: nur Typen und Konstanten.
 */

export type IdeaKind = "vorschlag" | "playlist" | "highlight";

/** Die Arten, die man über das Formular auf /mitmachen einreichen kann. */
export type SubmittableIdeaKind = Exclude<IdeaKind, "highlight">;

export const IDEA_KINDS: Record<IdeaKind, { label: string; plural: string }> = {
  vorschlag: { label: "Vorschlag", plural: "Vorschläge" },
  playlist: { label: "Playlist-Idee", plural: "Playlist-Ideen" },
  highlight: { label: "Highlight", plural: "Highlights" },
};

/** Arten mit Formular (und Liste auf /mitmachen). */
export const IDEA_KIND_LIST: SubmittableIdeaKind[] = ["vorschlag", "playlist"];

/** Alle Kanäle, die das Admin liest — die Highlights nur lesend. */
export const IDEA_FEED_KIND_LIST: IdeaKind[] = ["vorschlag", "playlist", "highlight"];

export function isIdeaKind(value: unknown): value is IdeaKind {
  return value === "vorschlag" || value === "playlist" || value === "highlight";
}

export const IDEA_NAME_MAX = 60;
export const IDEA_TEXT_MIN = 5;
export const IDEA_TEXT_MAX = 1000;

/** Ein Eintrag, so wie Seite und Admin ihn zeigen. Keine Discord-IDs von Personen. */
export interface Idea {
  /** ID der Discord-Nachricht. */
  id: string;
  kind: IdeaKind;
  author: string;
  text: string;
  /** ISO-Zeitpunkt. */
  createdAt: string;
  /** Über das Formular auf voltfm.xyz eingereicht. */
  viaWebsite: boolean;
  approved: boolean;
}
