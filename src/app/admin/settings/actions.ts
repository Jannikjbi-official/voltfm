"use server";

import { revalidatePath } from "next/cache";

import { settings } from "@/db/collections";
import { assertAdmin, assertCan, AuthorizationError } from "@/lib/session";
import { parseListenOnlineRadioUrl } from "@/lib/listings";
import type { EntityFormState } from "@/components/admin/entity-types";

/**
 * Speichert den Link zu VoltFM bei ListenOnlineRadio. Leer heisst: kein Link
 * auf der Seite.
 */
export async function saveListenOnlineRadioUrl(
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

  const raw = String(formData.get("listenOnlineRadioUrl") ?? "").trim();
  const url = raw ? parseListenOnlineRadioUrl(raw) : null;
  if (raw && !url) {
    return {
      status: "error",
      message: "Das ist keine Adresse bei listenonlineradio.com. Kopier sie am besten direkt aus dem Browser.",
    };
  }

  try {
    await settings().updateOne(
      { key: "site" },
      url
        ? { $set: { listenOnlineRadioUrl: url, updatedAt: new Date() } }
        : { $unset: { listenOnlineRadioUrl: "" }, $set: { updatedAt: new Date() } },
      { upsert: true },
    );
  } catch (error) {
    console.error("[admin] ListenOnlineRadio-Link speichern fehlgeschlagen", error);
    return { status: "error", message: "Speichern hat nicht geklappt. Versuch es gleich noch einmal." };
  }

  revalidatePath("/radio");
  revalidatePath("/admin/settings");
  return url
    ? { status: "success", message: "Gespeichert. Der Link steht jetzt auf der Radio-Seite." }
    : { status: "success", message: "Link entfernt." };
}
