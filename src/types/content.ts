import type { ObjectId } from "mongodb";

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
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
}

export interface Host {
  _id?: ObjectId;
  name: string;
  slug: string;
  role: string;
  bio: string;
  image?: string;
  /** Discord snowflake, used to pull the avatar from Discord as a fallback. */
  discordUserId?: string | null;
  /**
   * Which profile composition to render. Each host gets a visually distinct
   * page so the roster does not read as one template repeated four times.
   */
  profileLayout?: "spotlight" | "editorial" | "stage" | "zine";
  /** Optional brand accent for this host, as an OKLCH hue (0-360). */
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
