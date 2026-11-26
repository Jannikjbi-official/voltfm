import "server-only";
import { partners } from "@/db/collections";
import type { Partner } from "@/types/content";
import { serializeAll, serialize, type Plain } from "./serialize";

export type PartnerDTO = Plain<Partner>;

async function safe<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error("[content] partner query failed", error);
    return fallback;
  }
}

/** Fehlende Felder aelterer oder von Hand angelegter Dokumente abfangen. */
function normalizePartner(partner: PartnerDTO): PartnerDTO {
  return { ...partner, links: partner.links ?? [], kurz: partner.kurz ?? "" };
}

const SORT = { order: 1, name: 1 } as const;

/** Oeffentliche Liste: nur aktive Partner, nach Reihenfolge, dann Name. */
export async function listPartners(): Promise<PartnerDTO[]> {
  return safe(
    async () =>
      serializeAll(await partners().find({ active: true }).sort(SORT).toArray()).map(normalizePartner),
    [],
  );
}

/**
 * Detailseite. Ein ausgeblendeter Partner liefert `null` und damit 404 —
 * sonst bliebe die Seite fuer jeden erreichbar, der den Link aufbewahrt hat.
 */
export async function getPartnerBySlug(slug: string): Promise<PartnerDTO | null> {
  return safe(async () => {
    const doc = await partners().findOne({ slug, active: true });
    return doc ? normalizePartner(serialize(doc)) : null;
  }, null);
}

/** Admin-Liste: auch ausgeblendete Partner. */
export async function adminListPartners(): Promise<PartnerDTO[]> {
  return safe(
    async () => serializeAll(await partners().find().sort(SORT).toArray()).map(normalizePartner),
    [],
  );
}
