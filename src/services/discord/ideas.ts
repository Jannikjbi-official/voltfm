import "server-only";

import { ideaApprovals } from "@/db/collections";
import { site } from "@/lib/site";
import { IDEA_KIND_LIST, IDEA_TEXT_MAX, type Idea, type IdeaKind } from "@/lib/ideas";
import { deployEnv, isProductionDeploy } from "@/lib/deploy";

/**
 * Vorschläge und Playlist-Ideen: lesen aus und schreiben in zwei
 * Discord-Kanäle (`site.discordIdeaChannels`), über den Bot
 * (DISCORD_BOT_TOKEN).
 *
 * Was der Bot dafür im Discord braucht:
 *   - in beiden Kanälen: Kanal ansehen, Nachrichtenverlauf lesen,
 *     Nachrichten senden, Links einbetten
 *   - im Developer Portal den "Message Content Intent" — ohne ihn liefert
 *     Discord den Text fremder Nachrichten leer aus.
 *
 * Die Texte werden nicht gespeichert, sondern bei Bedarf gelesen (öffentlich
 * höchstens alle 60 Sekunden). Gespeichert wird nur die Freigabe
 * (Collection `ideaApprovals`). Gelöscht im Discord heißt damit auch: weg von
 * der Seite.
 */

/* Nur lokal (nie auf dem Server) darf ein Test-Server statt Discord antworten. */
const API =
  deployEnv() === "local" && process.env.DISCORD_API_BASE
    ? process.env.DISCORD_API_BASE.replace(/\/$/, "")
    : "https://discord.com/api/v10";

const FETCH_LIMIT = 50;
/** Fußzeile der Karten, die das Formular auf voltfm.xyz in den Kanal schreibt. */
const WEBSITE_MARKER = "Eingereicht über voltfm.xyz";
/** Logo-Gelb (#FFD60A) als Seitenstreifen der Karte. */
const EMBED_COLOR = 0xffd60a;

interface DiscordMessage {
  id: string;
  type: number;
  content: string;
  timestamp: string;
  author: { id: string; username: string; global_name?: string | null; bot?: boolean };
  attachments?: unknown[];
  embeds?: { description?: string; author?: { name?: string }; footer?: { text?: string } }[];
  sticker_items?: unknown[];
}

export type IdeaFeedProblem = "kein-token" | "kein-zugriff" | "fehler";

export interface IdeaFeed {
  kind: IdeaKind;
  ideas: Idea[];
  /** Nachrichten ohne lesbaren Text — meist fehlt der Message Content Intent. */
  unreadable: number;
  problem?: IdeaFeedProblem;
}

function botToken(): string | null {
  return process.env.DISCORD_BOT_TOKEN || null;
}

function channelOf(kind: IdeaKind): string | null {
  const id = site.discordIdeaChannels[kind];
  return /^\d{5,25}$/.test(id) ? id : null;
}

/**
 * Discord-Markup als lesbarer Text. Erwähnungen verlieren ihre IDs — auf der
 * Seite soll niemand auftauchen, der nur erwähnt wurde.
 */
export function cleanDiscordText(raw: string): string {
  return raw
    .replace(/<@!?\d+>/g, "@jemand")
    .replace(/<@&\d+>/g, "@Rolle")
    .replace(/<#\d+>/g, "#Kanal")
    .replace(/<a?:(\w+):\d+>/g, ":$1:")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, IDEA_TEXT_MAX);
}

/** Eine Nachricht als Eintrag — oder "unlesbar" bzw. null, wenn sie keiner ist. */
function toIdea(kind: IdeaKind, message: DiscordMessage): Omit<Idea, "approved"> | "unlesbar" | null {
  // 0 = normale Nachricht, 19 = Antwort. Beitritte, Pins usw. sind keine Ideen.
  if (message.type !== 0 && message.type !== 19) return null;
  const base = { id: message.id, kind, createdAt: new Date(message.timestamp).toISOString() };

  if (message.author.bot) {
    // Nur die Karten aus unserem eigenen Formular, keine anderen Bots.
    const embed = message.embeds?.[0];
    if (embed?.footer?.text !== WEBSITE_MARKER || !embed.description) return null;
    const text = cleanDiscordText(embed.description);
    return text ? { ...base, author: embed.author?.name?.trim() || "Ohne Namen", text, viaWebsite: true } : null;
  }

  const text = cleanDiscordText(message.content ?? "");
  if (!text) {
    // Nur ein Bild oder Sticker: kein Text, aber auch kein Fehler.
    if (message.attachments?.length || message.sticker_items?.length || message.embeds?.length) return null;
    return "unlesbar";
  }
  return {
    ...base,
    author: (message.author.global_name || message.author.username).slice(0, 80),
    text,
    viaWebsite: false,
  };
}

async function approvedIds(ids: string[]): Promise<Set<string>> {
  if (!ids.length) return new Set();
  try {
    const rows = await ideaApprovals()
      .find({ messageId: { $in: ids } }, { projection: { messageId: 1 } })
      .toArray();
    return new Set(rows.map((row) => row.messageId));
  } catch (error) {
    console.error("[ideen] Freigaben nicht lesbar", error);
    return new Set();
  }
}

async function readFeed(kind: IdeaKind, fresh: boolean): Promise<IdeaFeed> {
  const token = botToken();
  if (!token) return { kind, ideas: [], unreadable: 0, problem: "kein-token" };
  const channel = channelOf(kind);
  if (!channel) return { kind, ideas: [], unreadable: 0, problem: "fehler" };

  let messages: DiscordMessage[];
  try {
    const res = await fetch(`${API}/channels/${channel}/messages?limit=${FETCH_LIMIT}`, {
      headers: { Authorization: `Bot ${token}` },
      // Admin: immer frisch. Öffentlich: höchstens einmal pro Minute fragen.
      ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: 60 } }),
      signal: AbortSignal.timeout(6000),
    });
    if ([401, 403, 404].includes(res.status)) return { kind, ideas: [], unreadable: 0, problem: "kein-zugriff" };
    if (!res.ok) throw new Error(`Discord antwortet ${res.status}`);
    messages = (await res.json()) as DiscordMessage[];
  } catch (error) {
    console.error(`[ideen] ${kind} nicht lesbar`, error);
    return { kind, ideas: [], unreadable: 0, problem: "fehler" };
  }

  let unreadable = 0;
  const parsed: Omit<Idea, "approved">[] = [];
  for (const message of messages) {
    const idea = toIdea(kind, message);
    if (idea === "unlesbar") unreadable += 1;
    else if (idea) parsed.push(idea);
  }

  const approved = await approvedIds(parsed.map((idea) => idea.id));
  return {
    kind,
    unreadable,
    ideas: parsed.map((idea) => ({ ...idea, approved: approved.has(idea.id) })),
  };
}

/** Beide Kanäle, neueste zuerst — für das Admin. */
export async function getIdeaFeeds({ fresh = false } = {}): Promise<IdeaFeed[]> {
  return Promise.all(IDEA_KIND_LIST.map((kind) => readFeed(kind, fresh)));
}

/** Nur freigegebene Einträge, je Art höchstens `limit` — für die Seite. */
export async function getPublicIdeas(limit = 6): Promise<Record<IdeaKind, Idea[]>> {
  const feeds = await getIdeaFeeds();
  const result = { vorschlag: [], playlist: [] } as Record<IdeaKind, Idea[]>;
  for (const feed of feeds) result[feed.kind] = feed.ideas.filter((idea) => idea.approved).slice(0, limit);
  return result;
}

/** Ob das Formular wirklich nach Discord schreibt: nur auf voltfm.xyz (und lokal gegen einen Test-Server). */
export function ideaPostingEnabled(): boolean {
  return isProductionDeploy() || (deployEnv() === "local" && Boolean(process.env.DISCORD_API_BASE));
}

export type PostIdeaResult = "ok" | "testseite" | "nicht-eingerichtet" | "fehler";

/**
 * Schreibt einen Eintrag aus dem Formular als Karte in den Kanal. Niemand wird
 * erwähnt oder angepingt; der Text steht in der Karte, nicht als Nachricht.
 */
export async function postIdea(kind: IdeaKind, name: string, text: string): Promise<PostIdeaResult> {
  if (!ideaPostingEnabled()) return "testseite";
  const token = botToken();
  const channel = channelOf(kind);
  if (!token || !channel) return "nicht-eingerichtet";

  try {
    const res = await fetch(`${API}/channels/${channel}/messages`, {
      method: "POST",
      headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        allowed_mentions: { parse: [] },
        embeds: [
          {
            author: { name: name.slice(0, 256) },
            description: text.slice(0, IDEA_TEXT_MAX),
            color: EMBED_COLOR,
            footer: { text: WEBSITE_MARKER },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Discord antwortet ${res.status}: ${await res.text()}`);
    return "ok";
  } catch (error) {
    console.error(`[ideen] ${kind} nicht gesendet`, error);
    return "fehler";
  }
}
