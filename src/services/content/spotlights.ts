import "server-only";
import { spotlights } from "@/db/collections";
import type { Spotlight } from "@/types/content";
import { serializeAll, serialize, type Plain } from "./serialize";

export type SpotlightDTO = Plain<Spotlight>;

async function safe<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error("[content] spotlight query failed", error);
    return fallback;
  }
}

/** Neuester Monat zuerst; innerhalb eines Monats das zuletzt angelegte. */
const SORT = { monat: -1, createdAt: -1 } as const;

/** Oeffentliche Liste: nur aktive Portraets, das aktuelle zuerst. */
export async function listSpotlights(): Promise<SpotlightDTO[]> {
  return safe(async () => serializeAll(await spotlights().find({ active: true }).sort(SORT).toArray()), []);
}

/** Detailseite. Ein ausgeblendetes Portraet liefert `null` und damit 404. */
export async function getSpotlightBySlug(slug: string): Promise<SpotlightDTO | null> {
  return safe(async () => {
    const doc = await spotlights().findOne({ slug, active: true });
    return doc ? serialize(doc) : null;
  }, null);
}

/** Admin-Liste: auch ausgeblendete Portraets. */
export async function adminListSpotlights(): Promise<SpotlightDTO[]> {
  return safe(async () => serializeAll(await spotlights().find().sort(SORT).toArray()), []);
}
