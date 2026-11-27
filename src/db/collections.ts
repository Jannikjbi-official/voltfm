import type { Collection } from "mongodb";
import { getDb } from "./client";
import type {
  Article,
  Category,
  ContactMessage,
  Host,
  IdeaApproval,
  MediaAsset,
  Milestone,
  Partner,
  Play,
  SettingsDoc,
  Show,
  Spotlight,
  StationDay,
  TimelineEntry,
  VoltEvent,
} from "@/types/content";

/**
 * Typed accessors. Every query in the app goes through one of these so the
 * collection names live in exactly one place.
 */

export const articles = (): Collection<Article> => getDb().collection<Article>("articles");
export const categories = (): Collection<Category> => getDb().collection<Category>("categories");
export const hosts = (): Collection<Host> => getDb().collection<Host>("hosts");
export const shows = (): Collection<Show> => getDb().collection<Show>("shows");
export const events = (): Collection<VoltEvent> => getDb().collection<VoltEvent>("events");
export const media = (): Collection<MediaAsset> => getDb().collection<MediaAsset>("media");
export const timeline = (): Collection<TimelineEntry> =>
  getDb().collection<TimelineEntry>("timeline");
export const contactMessages = (): Collection<ContactMessage> =>
  getDb().collection<ContactMessage>("contactMessages");
export const settings = (): Collection<SettingsDoc> => getDb().collection<SettingsDoc>("settings");
export const stationDays = (): Collection<StationDay> => getDb().collection<StationDay>("stationDays");
export const milestones = (): Collection<Milestone> => getDb().collection<Milestone>("milestones");
export const partners = (): Collection<Partner> => getDb().collection<Partner>("partners");
export const ideaApprovals = (): Collection<IdeaApproval> =>
  getDb().collection<IdeaApproval>("ideaApprovals");
export const spotlights = (): Collection<Spotlight> => getDb().collection<Spotlight>("spotlights");
/** Was gelaufen ist — fuer Charts und Archiv (src/services/plays). */
export const plays = (): Collection<Play> => getDb().collection<Play>("plays");

/**
 * Index creation is idempotent, so this is safe to run from the seed script or
 * a deploy hook. It is deliberately NOT called on every request.
 */
export async function ensureIndexes(): Promise<void> {
  await Promise.all([
    articles().createIndex({ slug: 1 }, { unique: true }),
    // Drives the public article list: published, newest first.
    articles().createIndex({ status: 1, publishedAt: -1 }),
    articles().createIndex({ categorySlug: 1, status: 1, publishedAt: -1 }),
    articles().createIndex({ tags: 1 }),
    articles().createIndex(
      { title: "text", excerpt: "text", tags: "text" },
      { name: "article_search", weights: { title: 10, excerpt: 4, tags: 2 } },
    ),
    categories().createIndex({ slug: 1 }, { unique: true }),
    categories().createIndex({ order: 1 }),
    hosts().createIndex({ slug: 1 }, { unique: true }),
    hosts().createIndex({ active: 1, order: 1 }),
    shows().createIndex({ slug: 1 }, { unique: true }),
    shows().createIndex({ weekday: 1, startTime: 1 }),
    events().createIndex({ slug: 1 }, { unique: true }),
    events().createIndex({ startsAt: -1 }),
    media().createIndex({ createdAt: -1 }),
    timeline().createIndex({ key: 1 }, { unique: true }),
    timeline().createIndex({ order: 1 }),
    stationDays().createIndex({ date: 1 }, { unique: true }),
    milestones().createIndex({ key: 1 }, { unique: true }),
    ideaApprovals().createIndex({ messageId: 1 }, { unique: true }),
    partners().createIndex({ slug: 1 }, { unique: true }),
    partners().createIndex({ active: 1, order: 1, name: 1 }),
    spotlights().createIndex({ slug: 1 }, { unique: true }),
    spotlights().createIndex({ active: 1, monat: -1, createdAt: -1 }),
    plays().createIndex({ startedAt: 1, title: 1, artist: 1 }, { unique: true }),
    plays().createIndex({ startedAt: -1 }),
  ]);
}
