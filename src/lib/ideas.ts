/**
 * Highlights aus dem Discord (DISCORD_HIGHLIGHTS_CHANNEL_ID), nur gelesen.
 *
 * Ideen, Feedback und Vorschläge sammelt seit November 2026 das VoltFM-Portal
 * (portal.voltfm.xyz/ideen), nicht mehr diese Seite. Die Arten "vorschlag" und
 * "playlist" bleiben nur als Typ, damit alte Freigaben lesbar bleiben.
 *
 * Öffentlich auf voltfm.xyz steht ein Eintrag erst, wenn ihn jemand im Admin
 * freigegeben hat — so landet kein Spam und nichts Persönliches ungeprüft auf
 * der Seite. Wird die Nachricht im Discord gelöscht, verschwindet sie auch
 * hier, denn die Texte werden nicht gespeichert, sondern jedes Mal gelesen.
 *
 * Diese Datei ist für Browser und Server: nur Typen und Konstanten.
 */

export type IdeaKind = "vorschlag" | "playlist" | "highlight";

export const IDEA_KINDS: Record<IdeaKind, { label: string; plural: string }> = {
  vorschlag: { label: "Vorschlag", plural: "Vorschläge" },
  playlist: { label: "Playlist-Idee", plural: "Playlist-Ideen" },
  highlight: { label: "Highlight", plural: "Highlights" },
};

/** Die Kanäle, die das Admin liest: nur noch die Highlights. */
export const IDEA_FEED_KIND_LIST: IdeaKind[] = ["highlight"];

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
  approved: boolean;
}
