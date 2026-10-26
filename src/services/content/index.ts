import "server-only";
import { cache } from "react";
import { ObjectId } from "mongodb";
import { categories, events, hosts, shows, timeline } from "@/db/collections";
import type { Category, Host, Show, TimelineEntry, VoltEvent } from "@/types/content";
import { serialize, serializeAll, type Plain } from "./serialize";
import { resolveHostImage } from "@/services/discord/avatar";
import { normalizeProfileLayout } from "@/lib/profile-layouts";

export * from "./articles";
export * from "./serialize";

export type CategoryDTO = Plain<Category>;
export type HostDTO = Plain<Host>;
export type ShowDTO = Plain<Show>;
export type EventDTO = Plain<VoltEvent>;
export type TimelineDTO = Plain<TimelineEntry>;

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

/**
 * Faengt Datensaetze ab, die aelter sind als ein Feld.
 *
 * `genres` kam spaeter dazu; in bestehenden Dokumenten fehlt es schlicht. Der
 * Typ sagt `string[]`, zur Laufzeit kam `undefined` — und die Seite stuerzte
 * beim ersten `.length` ab. Die Migration fuellt das Feld nach, aber darauf
 * darf sich das Lesen nicht verlassen.
 */
function normalizeHost(host: HostDTO): HostDTO {
  return {
    ...host,
    genres: host.genres ?? [],
    socials: host.socials ?? [],
    showSlugs: host.showSlugs ?? [],
    details: host.details ?? [],
    profileLayout: normalizeProfileLayout(host.profileLayout),
  };
}

export async function listHosts(includeInactive = false): Promise<HostDTO[]> {
  return safe(
    async () =>
      serializeAll(
        await hosts()
          .find(includeInactive ? {} : { active: true })
          .sort({ order: 1 })
          .toArray(),
      ).map(normalizeHost),
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
export interface AuthorProfile {
  slug: string;
  image: string | null;
}

/**
 * Autorenname -> Moderatorenprofil.
 *
 * Beitraege speichern nur den Namen. Slug und Bild liegen beim Profil, das
 * Bild teils als Upload, teils bei Discord. `cache` dedupliziert den Aufbau:
 * eine Liste mit zwanzig Beitragskarten loest das trotzdem nur einmal auf.
 *
 * Bewusst nur aktive Profile: Ein verstecktes Profil liefert oeffentlich 404,
 * ein Verweis darauf ginge also ins Leere.
 */
export const getAuthorProfiles = cache(async (): Promise<Record<string, AuthorProfile>> => {
  const list = await listHosts();
  const entries = await Promise.all(
    list.map(async (host) => [host.name, { slug: host.slug, image: await resolveHostImage(host) }] as const),
  );
  return Object.fromEntries(entries);
});

export async function getHostBySlug(slug: string): Promise<HostDTO | null> {
  return safe(async () => {
    const doc = await hosts().findOne({ slug, active: true });
    return doc ? normalizeHost(serialize(doc)) : null;
  }, null);
}

export async function adminGetHost(id: string): Promise<HostDTO | null> {
  if (!ObjectId.isValid(id)) return null;
  return safe(async () => {
    const doc = await hosts().findOne({ _id: new ObjectId(id) });
    return doc ? normalizeHost(serialize(doc)) : null;
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

/* --- Zeitleiste ---------------------------------------------------------- */

/** Die Stationen der VoltFM-Geschichte, in der Reihenfolge ihres `order`. */
export async function listTimeline(): Promise<TimelineDTO[]> {
  return safe(
    async () => serializeAll(await timeline().find().sort({ order: 1 }).toArray()),
    [],
  );
}

/* --- Events -------------------------------------------------------------- */

/**
 * Der Status, wie ihn die oeffentliche Seite sehen soll.
 *
 * "past" wird hier abgeleitet und nicht beim Speichern festgeschrieben. Beim
 * Schreiben waere es in beide Richtungen falsch: Ein Termin, der beim Anlegen
 * schon vorbei schien (etwa durch eine Zeitzonen-Verschiebung), bliebe fuer
 * immer vergangen — und ein kuenftiger Termin bliebe "geplant", auch Wochen
 * nachdem er stattgefunden hat. Eine Absage bleibt eine Absage.
 */
function withEffectiveStatus(event: EventDTO, now: Date): EventDTO {
  if (event.status === "cancelled") return event;

  const start = new Date(event.startsAt);
  if (Number.isNaN(start.getTime())) return event;

  const end = event.endsAt ? new Date(event.endsAt) : null;
  const over = (end && !Number.isNaN(end.getTime()) ? end : start) < now;
  if (over) return { ...event, status: "past" };

  // Laeuft gerade: begonnen, aber noch nicht zu Ende.
  if (start <= now) return { ...event, status: "live" };

  return { ...event, status: "upcoming" };
}

export async function listEvents(scope: "upcoming" | "past" | "all" = "all"): Promise<EventDTO[]> {
  return safe(async () => {
    const now = new Date();
    /* Massgeblich ist das Ende, nicht der Beginn: Ein Event, das gerade
       laeuft, gehoert noch zu den kommenden — sonst verschwaende RadioAid
       genau in den 24 Stunden, in denen es stattfindet, von der Startseite.
       `endsAt: null` trifft auch Dokumente, denen das Feld ganz fehlt. */
    const notOver = {
      $or: [{ endsAt: { $gte: now } }, { endsAt: null, startsAt: { $gte: now } }],
    };
    const over = {
      $or: [{ endsAt: { $lt: now } }, { endsAt: null, startsAt: { $lt: now } }],
    };
    const filter =
      scope === "upcoming"
        ? { ...notOver, status: { $ne: "cancelled" as const } }
        : scope === "past"
          ? over
          : {};
    const docs = await events()
      .find(filter)
      // Upcoming reads best soonest-first; past reads best newest-first.
      .sort({ startsAt: scope === "upcoming" ? 1 : -1 })
      .toArray();
    return serializeAll(docs).map((event) => withEffectiveStatus(event, now));
  }, []);
}

/** Admin-Liste: liefert den gespeicherten Status, nicht den abgeleiteten —
 *  das Formular soll zeigen, was eingetragen wurde. */
export async function adminListEvents(): Promise<EventDTO[]> {
  return safe(
    async () => serializeAll(await events().find().sort({ startsAt: -1 }).toArray()),
    [],
  );
}

export async function getEventBySlug(slug: string): Promise<EventDTO | null> {
  return safe(async () => {
    const doc = await events().findOne({ slug });
    return doc ? withEffectiveStatus(serialize(doc), new Date()) : null;
  }, null);
}

export async function adminGetEvent(id: string): Promise<EventDTO | null> {
  if (!ObjectId.isValid(id)) return null;
  return safe(async () => {
    const doc = await events().findOne({ _id: new ObjectId(id) });
    return doc ? serialize(doc) : null;
  }, null);
}
