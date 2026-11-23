/**
 * Vorschläge und Playlist-Ideen aus dem Discord.
 *
 * Gelesen und geschrieben wird in zwei Kanälen (`site.discordIdeaChannels`).
 * Öffentlich auf voltfm.xyz steht ein Eintrag erst, wenn ihn jemand im Admin
 * freigegeben hat — so landet kein Spam und nichts Persönliches ungeprüft auf
 * der Seite. Wird die Nachricht im Discord gelöscht, verschwindet sie auch
 * hier, denn die Texte werden nicht gespeichert, sondern jedes Mal gelesen.
 *
 * Diese Datei ist für Browser und Server: nur Typen und Konstanten.
 */

export type IdeaKind = "vorschlag" | "playlist";

export const IDEA_KINDS: Record<IdeaKind, { label: string; plural: string }> = {
  vorschlag: { label: "Vorschlag", plural: "Vorschläge" },
  playlist: { label: "Playlist-Idee", plural: "Playlist-Ideen" },
};

export const IDEA_KIND_LIST: IdeaKind[] = ["vorschlag", "playlist"];

export function isIdeaKind(value: unknown): value is IdeaKind {
  return value === "vorschlag" || value === "playlist";
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
