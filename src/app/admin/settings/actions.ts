"use server";

import { revalidatePath } from "next/cache";

import { settings } from "@/db/collections";
import { assertAdmin, assertCan, AuthorizationError } from "@/lib/session";
import { directories, parseDirectoryUrl, type DirectoryId } from "@/lib/listings";
import type { EntityFormState } from "@/components/admin/entity-types";

/**
 * Speichert die Links zu VoltFM in den Radio-Verzeichnissen. Ein leeres Feld
 * heisst: kein Link auf der Seite.
 */
export async function saveDirectoryLinks(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  try {
    await assertAdmin();
    await assertCan("settings", ["update"]);
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    throw error;
  }

  const listings: Partial<Record<DirectoryId, string>> = {};
  for (const directory of directories) {
    const raw = String(formData.get(`listing-${directory.id}`) ?? "").trim();
    if (!raw) {
      listings[directory.id] = "";
      continue;
    }
    const url = parseDirectoryUrl(directory, raw);
    if (!url) {
      return {
        status: "error",
        message: `Der Link bei ${directory.name} passt nicht. Kopier ihn am besten direkt aus dem Browser (mit https://).`,
      };
    }
    listings[directory.id] = url;
  }

  try {
    await settings().updateOne(
      { key: "site" },
      { $set: { listings, updatedAt: new Date() } },
      { upsert: true },
    );
  } catch (error) {
    console.error("[admin] Verzeichnis-Links speichern fehlgeschlagen", error);
    return { status: "error", message: "Speichern hat nicht geklappt. Versuch es gleich noch einmal." };
  }

  revalidatePath("/radio");
  revalidatePath("/admin/settings");
  return { status: "success", message: "Gespeichert. Die Radio-Seite zeigt jetzt diese Links." };
}
