import "server-only";

import { ideaApprovals } from "@/db/collections";
import { site } from "@/lib/site";
import {
  IDEA_FEED_KIND_LIST,
  IDEA_TEXT_MAX,
  type Idea,
  type IdeaKind,
  type SubmittableIdeaKind,
} from "@/lib/ideas";
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
 *
 * Dazu kommt ein dritter Kanal, die Highlights (DISCORD_HIGHLIGHTS_CHANNEL_ID).
 * Er wird nur gelesen, nie beschrieben; freigegebene Einträge stehen auf
 * /highlights. Ohne Kanal-ID (Standard) ist die Funktion aus. Der Bot braucht
 * dort nur „Kanal ansehen“ und „Nachrichtenverlauf lesen“.
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

export type IdeaFeedProblem = "kein-token" | "kein-kanal" | "kein-zugriff" | "fehler";

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

/** Die eingetragene Kanal-ID, so wie sie konfiguriert ist (auch leer). */
export function ideaChannelId(kind: IdeaKind): string {
  if (kind === "highlight") return (process.env.DISCORD_HIGHLIGHTS_CHANNEL_ID ?? "").trim();
  return site.discordIdeaChannels[kind];
}

function channelOf(kind: IdeaKind): string | null {
  const id = ideaChannelId(kind);
  return /^\d{5,25}$/.test(id) ? id : null;
}

/** Ob der Highlights-Kanal eingetragen ist. Ohne ihn gibt es /highlights nur als leere Seite. */
export function highlightsConfigured(): boolean {
  return channelOf("highlight") !== null;
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
  const channel = channelOf(kind);
  // Die Highlights sind ohne Kanal-ID bewusst aus — das ist kein Fehler.
  if (!channel) return { kind, ideas: [], unreadable: 0, problem: kind === "highlight" ? "kein-kanal" : "fehler" };
  const token = botToken();
  if (!token) return { kind, ideas: [], unreadable: 0, problem: "kein-token" };

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

/** Alle drei Kanäle, neueste zuerst — für das Admin. */
export async function getIdeaFeeds({ fresh = false } = {}): Promise<IdeaFeed[]> {
  return Promise.all(IDEA_FEED_KIND_LIST.map((kind) => readFeed(kind, fresh)));
}

/** Nur freigegebene Einträge, je Art höchstens `limit` — für /mitmachen. */
export async function getPublicIdeas(limit = 6): Promise<Record<SubmittableIdeaKind, Idea[]>> {
  const feeds = await Promise.all((["vorschlag", "playlist"] as const).map((kind) => readFeed(kind, false)));
  const result: Record<SubmittableIdeaKind, Idea[]> = { vorschlag: [], playlist: [] };
  for (const feed of feeds) {
    if (feed.kind === "highlight") continue;
    result[feed.kind] = feed.ideas.filter((idea) => idea.approved).slice(0, limit);
  }
  return result;
}

/**
 * Freigegebene Highlights für /highlights, neueste zuerst. `configured` ist
 * false, solange kein Kanal eingetragen ist — die Seite sagt das dann ehrlich.
 */
export async function getPublicHighlights(limit = 30): Promise<{ configured: boolean; highlights: Idea[] }> {
  if (!highlightsConfigured()) return { configured: false, highlights: [] };
  const feed = await readFeed("highlight", false);
  return { configured: true, highlights: feed.ideas.filter((idea) => idea.approved).slice(0, limit) };
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
export async function postIdea(kind: SubmittableIdeaKind, name: string, text: string): Promise<PostIdeaResult> {
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
