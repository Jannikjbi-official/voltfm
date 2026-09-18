"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { UTApi } from "uploadthing/server";

import { articles, events, hosts, media, shows } from "@/db/collections";
import { assertAdmin, AuthorizationError } from "@/lib/session";
import type { EntityFormState } from "@/components/admin/entity-types";

/**
 * UploadThing addresses files by key, which is the last path segment of the
 * URL it handed back on upload.
 */
function fileKey(url: string): string | null {
  const key = url.split("/").filter(Boolean).pop();
  return key && key.length > 4 ? key : null;
}

/** Where an asset is still referenced, so deleting cannot silently break a page. */
async function findUsage(url: string): Promise<string[]> {
  const [articleUse, hostUse, showUse, eventUse] = await Promise.all([
    articles().find({ $or: [{ coverImage: url }, { ogImage: url }] }, { projection: { title: 1 } }).toArray(),
    hosts().find({ image: url }, { projection: { name: 1 } }).toArray(),
    shows().find({ image: url }, { projection: { title: 1 } }).toArray(),
    events().find({ image: url }, { projection: { title: 1 } }).toArray(),
  ]);

  return [
    ...articleUse.map((doc) => `Artikel „${doc.title}"`),
    ...hostUse.map((doc) => `Moderator „${doc.name}"`),
    ...showUse.map((doc) => `Sendung „${doc.title}"`),
    ...eventUse.map((doc) => `Event „${doc.title}"`),
  ];
}

export async function deleteMedia(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  try {
    await assertAdmin();
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    throw error;
  }

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return { status: "error", message: "Unbekannte Datei." };

  const asset = await media().findOne({ _id: new ObjectId(id) });
  if (!asset) return { status: "error", message: "Datei nicht gefunden." };

  /* An image still shown somewhere would turn into a broken box on the public
     site, so it takes a second, explicit confirmation. */
  const usage = await findUsage(asset.url);
  if (usage.length > 0 && formData.get("force") !== "1") {
    return {
      status: "error",
      message: `Wird noch verwendet: ${usage.slice(0, 3).join(", ")}${usage.length > 3 ? ` und ${usage.length - 3} weitere` : ""}. Zum Löschen „Trotzdem löschen" wählen.`,
    };
  }

  // Remove the record first: a stale DB row pointing at a deleted file is the
  // worse failure, and UploadThing may legitimately 404 for an already-gone key.
  await media().deleteOne({ _id: new ObjectId(id) });

  const key = fileKey(asset.url);
  if (key && process.env.UPLOADTHING_TOKEN) {
    try {
      await new UTApi().deleteFiles([key]);
    } catch (error) {
      console.error("[admin] UploadThing delete failed", error);
      revalidatePath("/admin/media");
      return {
        status: "success",
        message: "Aus der Mediathek entfernt, bei UploadThing konnte die Datei nicht gelöscht werden.",
      };
    }
  }

  revalidatePath("/admin/media");
  return { status: "success", message: "Datei gelöscht." };
}

/** Editing the alt text here keeps it consistent everywhere the image is used. */
export async function updateMediaAlt(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  try {
    await assertAdmin();
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    throw error;
  }

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return { status: "error", message: "Unbekannte Datei." };

  const alt = String(formData.get("alt") ?? "").trim().slice(0, 200);
  await media().updateOne({ _id: new ObjectId(id) }, { $set: { alt } });

  revalidatePath("/admin/media");
  return { status: "success", message: "Bildbeschreibung gespeichert." };
}
