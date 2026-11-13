import "server-only";

import { articles, categories } from "@/db/collections";
import { site } from "@/lib/site";
import type { Article } from "@/types/content";

/**
 * Neue Beitraege im Discord ankuendigen.
 *
 * Der Bot (DISCORD_BOT_TOKEN, derselbe wie fuer die Profilbilder) schickt
 * eine Nachricht mit Titel, Teaser, Autor und Titelbild in den News-Kanal.
 *
 * Gepostet wird nur von der Production-Seite: Vorschau und dev.voltfm.xyz
 * teilen sich die Datenbank und den Token, und eine Vorschau soll nicht in den
 * echten Kanal schreiben. Ein Beitrag, der auf dev veroeffentlicht wird, wird
 * deshalb angekuendigt, sobald die Production-Seite das naechste Mal laeuft.
 *
 * Jeder Beitrag geht genau einmal raus: Wer ihn ankuendigt, setzt vorher
 * `discordAnnouncedAt` — und nur, wenn das Feld noch leer war. Zwei Anfragen
 * gleichzeitig koennen sich so nicht doppelt melden. Schlaegt das Senden fehl,
 * wird das Feld wieder geleert und es spaeter erneut versucht, hoechstens
 * dreimal.
 */

const DISCORD_API = "https://discord.com/api/v10";
/** Logo-Gelb (#FFD60A) als Seitenstreifen der Karte. */
const EMBED_COLOR = 0xffd60a;
const MAX_ATTEMPTS = 3;
/** Nicht bei jedem Seitenaufruf in die Datenbank schauen. */
const SWEEP_INTERVAL_MS = 60_000;
/** Pro Durchlauf hoechstens so viele — falls sich doch einmal etwas staut. */
const BATCH = 3;

let lastSweep = 0;

export function discordNewsEnabled(): boolean {
  return (
    process.env.VERCEL_ENV === "production" &&
    Boolean(process.env.DISCORD_BOT_TOKEN) &&
    /^\d{5,25}$/.test(site.discordNewsChannelId)
  );
}

/**
 * Kuendigt an, was live ist und noch nicht angekuendigt wurde.
 *
 * Laeuft nach der Antwort (`after()` im Root-Layout und nach dem Speichern im
 * Admin), haelt also keine Seite auf. Fehler landen im Log, nie beim Besucher.
 */
export async function announceDueArticles({ force = false } = {}): Promise<void> {
  if (!discordNewsEnabled()) return;
  const now = Date.now();
  if (!force && now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;

  try {
    const due = await articles()
      .find({
        status: "published",
        publishedAt: { $lte: new Date() },
        discordAnnouncedAt: null,
        announceOnDiscord: { $ne: false },
        discordAnnounceAttempts: { $not: { $gte: MAX_ATTEMPTS } },
      })
      .sort({ publishedAt: 1 })
      .limit(BATCH)
      .toArray();

    for (const article of due) await announce(article);
  } catch (error) {
    console.error("[discord-news] Durchlauf fehlgeschlagen", error);
  }
}

async function announce(article: Article): Promise<void> {
  // Erst den Beitrag fuer sich beanspruchen, dann senden.
  const claim = await articles().updateOne(
    { _id: article._id, discordAnnouncedAt: null },
    { $set: { discordAnnouncedAt: new Date() } },
  );
  if (claim.modifiedCount === 0) return;

  try {
    const category = await categories().findOne({ slug: article.categorySlug });
    const res = await fetch(`${DISCORD_API}/channels/${site.discordNewsChannelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildMessage(article, category?.name)),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Discord antwortet ${res.status}: ${await res.text()}`);

    const message = (await res.json()) as { id: string };
    await articles().updateOne({ _id: article._id }, { $set: { discordMessageId: message.id } });
  } catch (error) {
    console.error(`[discord-news] /news/${article.slug} nicht angekuendigt`, error);
    await articles().updateOne(
      { _id: article._id },
      { $unset: { discordAnnouncedAt: "" }, $inc: { discordAnnounceAttempts: 1 } },
    );
  }
}

/** Absolute Adresse: Discord holt Link und Bild selbst ab. */
function absolute(path: string): string {
  return new URL(path, site.canonicalUrl).toString();
}

/**
 * Die Nachricht. Kein eigener Text, nur was im Beitrag steht — Titel, Teaser,
 * Autor, Kategorie, Titelbild. Niemand wird erwaehnt oder angepingt.
 */
export function buildMessage(
  article: Pick<
    Article,
    "title" | "slug" | "excerpt" | "authorName" | "coverImage" | "publishedAt"
  >,
  categoryName?: string,
) {
  return {
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: article.title.slice(0, 256),
        url: absolute(`/news/${article.slug}`),
        description: article.excerpt.slice(0, 1000),
        color: EMBED_COLOR,
        author: { name: article.authorName.slice(0, 256) },
        ...(article.coverImage ? { image: { url: absolute(article.coverImage) } } : {}),
        footer: { text: categoryName ? `${categoryName} · voltfm.xyz` : "voltfm.xyz" },
        ...(article.publishedAt ? { timestamp: new Date(article.publishedAt).toISOString() } : {}),
      },
    ],
  };
}
