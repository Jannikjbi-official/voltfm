import type { ObjectId } from "mongodb";

import type { ProfileLayout } from "@/lib/profile-layouts";

export type ArticleStatus = "draft" | "scheduled" | "published" | "archived";
export type EventStatus = "upcoming" | "live" | "past" | "cancelled";

/** Stored shape (Mongo, with ObjectId) vs. serialised shape (sent to the client). */
export type WithId<T> = T & { _id: ObjectId };
export type Serialized<T> = Omit<T, "_id"> & { id: string };

export interface Category {
  _id?: ObjectId;
  name: string;
  slug: string;
  description?: string;
  /** Hue offset from the VoltFM primary, so category colours stay on-brand. */
  hue?: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Article {
  _id?: ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  /** Rich text stored as HTML produced by the admin editor. Sanitised on write. */
  content: string;
  /**
   * Was im Editor stand, bevor daraus HTML wurde.
   *
   * Gerendert wird immer `content`; dieses Feld existiert nur, damit beim
   * Bearbeiten wieder der getippte Markdown-Text erscheint und nicht das
   * erzeugte HTML. Bei Beitraegen aus der HTML-Zeit fehlt es — dann wird
   * `content` gezeigt, und der Konverter reicht HTML unveraendert durch.
   */
  contentSource?: string;
  coverImage?: string;
  coverAlt?: string;
  authorId?: string;
  authorName: string;
  categorySlug: string;
  tags: string[];
  status: ArticleStatus;
  featured: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  readingTime: number;
  /**
   * Im Discord ankuendigen, sobald der Beitrag live ist. Fehlt = ja. Was vor
   * November 2026 schon online war, steht auf false (Migration 021), damit es
   * nicht nachtraeglich gepostet wird. Siehe src/services/discord/news.ts.
   */
  announceOnDiscord?: boolean;
  /** Wann der Bot den Beitrag im Discord angekuendigt hat. */
  discordAnnouncedAt?: Date | null;
  discordMessageId?: string;
  discordAnnounceAttempts?: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
}

export interface Host {
  _id?: ObjectId;
  name: string;
  slug: string;
  role: string;
  /** Ein Satz unter dem Namen — kuerzer als die Rolle, persoenlicher. */
  tagline?: string;
  bio: string;
  /** Motto oder Lieblingssatz, auf der Profilseite hervorgehoben. */
  quote?: string;
  /** Musikrichtungen, fuer die diese Person steht. */
  genres: string[];
  /** Seit wann bei VoltFM. */
  joinedAt?: Date | null;
  /** Wo diese Person sitzt — der Sender ist verteilt. */
  location?: string;
  /**
   * Freie Zusatzangaben fuer die Faktenleiste, als Paare aus Bezeichnung und
   * Wert. Damit laesst sich alles nachtragen, wofuer es kein eigenes Feld gibt
   * — Lieblingsalbum, Equipment, Sendungsjubilaeum.
   */
  details: { label: string; value: string }[];
  image?: string;
  /** Discord snowflake, used to pull the avatar from Discord as a fallback. */
  discordUserId?: string | null;
  /**
   * Welcher Aufbau die Profilseite bekommt, damit nicht jedes Profil dieselbe
   * Vorlage ist. Aeltere Datensaetze tragen noch die Werte von vor Oktober
   * 2026; `normalizeHost` stellt sie beim Lesen um.
   */
  profileLayout?: ProfileLayout;
  /**
   * Eigene Farbe der Person, als OKLCH-Hue (0-360). Leer heisst: Die Seite
   * nimmt den Farbton des Profilbilds.
   */
  accentHue?: number | null;
  socials: { label: string; url: string }[];
  /** Slugs of shows this host presents. */
  showSlugs: string[];
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Show {
  _id?: ObjectId;
  title: string;
  slug: string;
  description: string;
  image?: string;
  hostSlugs: string[];
  /** 0 = Sunday … 6 = Saturday, matching Date#getDay. */
  weekday: number;
  /** Local station time, "HH:MM". */
  startTime: string;
  endTime: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoltEvent {
  _id?: ObjectId;
  title: string;
  slug: string;
  description: string;
  content?: string;
  /** Siehe `Article.contentSource`. */
  contentSource?: string;
  startsAt: Date;
  endsAt: Date | null;
  location: string;
  image?: string;
  category: string;
  status: EventStatus;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ein Eintrag der Zeitleiste auf /ueber-uns.
 *
 * `year` ist bewusst ein freier Text und keine Zahl: nicht jeder Schritt laesst
 * sich auf ein Jahr festnageln ("danach", "2023-2025").
 */
export interface TimelineEntry {
  _id?: ObjectId;
  /** Eindeutig, damit die Migration Eintraege wiedererkennt. */
  key: string;
  year: string;
  kicker: string;
  title: string;
  text: string;
  /** Optionaler Verweis, z. B. auf /radioaid. */
  href?: string;
  linkLabel?: string;
  /** Hebt den Eintrag als aktuellen Stand hervor. */
  current: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaAsset {
  _id?: ObjectId;
  /**
   * Die Kennung, unter der das Bild ausgeliefert wird (`/api/bilder/<id>`).
   *
   * Fehlt bei Bildern, die noch vor dem eigenen Bild-Endpunkt hochgeladen
   * wurden — deren `url` zeigt direkt auf den Anbieter.
   */
  publicId?: string;
  /** Der Schlüssel beim Speicheranbieter. Verlässt den Server nicht. */
  storageKey?: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  mimeType: string;
  uploadedBy?: string;
  createdAt: Date;
}

export interface ContactMessage {
  _id?: ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  handled: boolean;
  createdAt: Date;
}

export interface SettingsDoc {
  _id?: ObjectId;
  key: "site";
  streamUrl: string;
  discordUrl: string;
  announcement?: { active: boolean; text: string; href?: string };
  updatedAt: Date;
}
