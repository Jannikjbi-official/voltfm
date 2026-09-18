import "server-only";
import { cache } from "react";
import { ObjectId } from "mongodb";
import { categories, events, hosts, shows } from "@/db/collections";
import type { Category, Host, Show, VoltEvent } from "@/types/content";
import { serialize, serializeAll, type Plain } from "./serialize";

export * from "./articles";
export * from "./serialize";

export type CategoryDTO = Plain<Category>;
export type HostDTO = Plain<Host>;
export type ShowDTO = Plain<Show>;
export type EventDTO = Plain<VoltEvent>;

async function safe<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error("[content] query failed", error);
    return fallback;
  }
}

/* --- Categories ---------------------------------------------------------- */

export async function listCategories(): Promise<CategoryDTO[]> {
  return safe(async () => serializeAll(await categories().find().sort({ order: 1 }).toArray()), []);
}

/**
 * Slug -> Anzeigename, fuer alles, was nur den Slug eines Artikels kennt.
 *
 * `cache` dedupliziert den Aufruf innerhalb eines Renderdurchlaufs: eine Liste
 * mit zwanzig Artikelkarten stellt trotzdem genau eine Abfrage.
 */
export const getCategoryNames = cache(async (): Promise<Record<string, string>> => {
  const list = await listCategories();
  return Object.fromEntries(list.map((category) => [category.slug, category.name]));
});

export async function getCategoryBySlug(slug: string): Promise<CategoryDTO | null> {
  return safe(async () => {
    const doc = await categories().findOne({ slug });
    return doc ? serialize(doc) : null;
  }, null);
}

/* --- Hosts --------------------------------------------------------------- */

export async function listHosts(includeInactive = false): Promise<HostDTO[]> {
  return safe(
    async () =>
      serializeAll(
        await hosts()
          .find(includeInactive ? {} : { active: true })
          .sort({ order: 1 })
          .toArray(),
      ),
    [],
  );
}

/**
 * Public profile lookup.
 *
 * Only active hosts resolve: a profile that has been switched off in the admin
 * disappears from the roster, so its URL has to 404 as well — otherwise the
 * page stays reachable for anyone who kept the link. The admin reads through
 * `adminGetHost` instead, which ignores the flag.
 */
export async function getHostBySlug(slug: string): Promise<HostDTO | null> {
  return safe(async () => {
    const doc = await hosts().findOne({ slug, active: true });
    return doc ? serialize(doc) : null;
  }, null);
}

export async function adminGetHost(id: string): Promise<HostDTO | null> {
  if (!ObjectId.isValid(id)) return null;
  return safe(async () => {
    const doc = await hosts().findOne({ _id: new ObjectId(id) });
    return doc ? serialize(doc) : null;
  }, null);
}

/* --- Shows --------------------------------------------------------------- */

export async function listShows(): Promise<ShowDTO[]> {
  return safe(
    async () =>
      serializeAll(await shows().find({ active: true }).sort({ weekday: 1, startTime: 1 }).toArray()),
    [],
  );
}

/** Admin listing: includes shows that are hidden from the public schedule. */
export async function adminListShows(): Promise<ShowDTO[]> {
  return safe(
    async () => serializeAll(await shows().find().sort({ weekday: 1, startTime: 1 }).toArray()),
    [],
  );
}

export async function getShowsBySlugs(slugs: string[]): Promise<ShowDTO[]> {
  if (slugs.length === 0) return [];
  return safe(
    async () => serializeAll(await shows().find({ slug: { $in: slugs } }).toArray()),
    [],
  );
}

/* --- Events -------------------------------------------------------------- */

export async function listEvents(scope: "upcoming" | "past" | "all" = "all"): Promise<EventDTO[]> {
  return safe(async () => {
    const now = new Date();
    const filter =
      scope === "upcoming"
        ? { startsAt: { $gte: now }, status: { $ne: "cancelled" as const } }
        : scope === "past"
          ? { startsAt: { $lt: now } }
          : {};
    const docs = await events()
      .find(filter)
      // Upcoming reads best soonest-first; past reads best newest-first.
      .sort({ startsAt: scope === "upcoming" ? 1 : -1 })
      .toArray();
    return serializeAll(docs);
  }, []);
}

export async function getEventBySlug(slug: string): Promise<EventDTO | null> {
  return safe(async () => {
    const doc = await events().findOne({ slug });
    return doc ? serialize(doc) : null;
  }, null);
}

export async function adminGetEvent(id: string): Promise<EventDTO | null> {
  if (!ObjectId.isValid(id)) return null;
  return safe(async () => {
    const doc = await events().findOne({ _id: new ObjectId(id) });
    return doc ? serialize(doc) : null;
  }, null);
}
