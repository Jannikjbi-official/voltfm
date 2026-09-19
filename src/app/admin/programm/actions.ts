"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { shows } from "@/db/collections";
import { assertCan, AuthorizationError } from "@/lib/session";
import { slugify } from "@/lib/format";
import { features } from "@/lib/site";
import type { EntityFormState } from "@/components/admin/entity-types";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const schema = z.object({
  title: z.string().trim().min(2, "Titel ist zu kurz.").max(100),
  slug: z.string().trim().max(100).optional(),
  description: z.string().trim().min(10, "Beschreibung ist zu kurz.").max(1000),
  image: z.string().trim().url().or(z.literal("")).optional(),
  hostSlugs: z.string().trim().max(300).optional(),
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z.string().trim().regex(TIME, "Startzeit im Format HH:MM."),
  endTime: z.string().trim().regex(TIME, "Endzeit im Format HH:MM."),
});

export async function saveShow(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  try {
    await assertCan("show", ["update"]);
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    throw error;
  }

  /* Neue Sendungen erst wieder, wenn der Sendeplan laeuft: Sonst sammeln sich
     Sendeplaetze an, die niemand sieht und die beim Wiedereinschalten nicht
     mehr stimmen. Bestehende bleiben bearbeitbar — die Pruefung steht hier und
     nicht nur in der Oberflaeche, weil eine Server Action ein POST ist. */
  const isNew = !String(formData.get("id") ?? "").trim();
  if (isNew && !features.schedule) {
    return {
      status: "error",
      message:
        "Solange der Sendeplan abgeschaltet ist, lassen sich keine neuen Sendungen anlegen.",
    };
  }

  const parsed = schema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    description: formData.get("description"),
    image: formData.get("image") ?? "",
    hostSlugs: formData.get("hostSlugs") ?? "",
    weekday: formData.get("weekday") ?? 1,
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Eingaben prüfen." };
  }

  const data = parsed.data;
  const id = String(formData.get("id") ?? "").trim();
  const slug = slugify(data.slug || data.title);
  const now = new Date();

  const doc = {
    title: data.title,
    slug,
    description: data.description,
    image: data.image || undefined,
    hostSlugs: (data.hostSlugs ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    weekday: data.weekday,
    startTime: data.startTime,
    endTime: data.endTime,
    active: formData.get("active") === "on",
    updatedAt: now,
  };

  try {
    if (id && ObjectId.isValid(id)) {
      await shows().updateOne({ _id: new ObjectId(id) }, { $set: doc });
    } else {
      await shows().insertOne({ ...doc, createdAt: now });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("E11000")) {
      return { status: "error", message: `Der Slug „${slug}" ist schon vergeben.` };
    }
    console.error("[admin] saveShow failed", error);
    return { status: "error", message: "Speichern fehlgeschlagen." };
  }

  revalidatePath("/admin/programm");
  revalidatePath("/programm");
  revalidatePath("/moderatoren");
  return { status: "success", message: `„${data.title}" gespeichert.` };
}

export async function deleteShow(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  try {
    await assertCan("show", ["delete"]);
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    throw error;
  }

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return { status: "error", message: "Unbekannter Eintrag." };

  await shows().deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/admin/programm");
  revalidatePath("/programm");
  return { status: "success", message: "Sendung gelöscht." };
}
