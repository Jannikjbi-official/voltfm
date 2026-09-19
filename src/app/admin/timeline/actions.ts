"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { timeline } from "@/db/collections";
import { assertAdmin, AuthorizationError } from "@/lib/session";
import { slugify } from "@/lib/format";
import type { EntityFormState } from "@/components/admin/entity-types";

/**
 * Die Zeitleiste auf /ueber-uns.
 *
 * Wie jede Admin-Action autorisiert sie sich selbst: Eine Server Action ist ein
 * POST, den man auch ohne unser Formular abschicken kann.
 */

const schema = z.object({
  year: z.string().trim().min(1, "Bitte eine Jahresangabe eintragen.").max(40),
  kicker: z.string().trim().min(2, "Die Zeile über der Überschrift fehlt.").max(60),
  title: z.string().trim().min(3, "Überschrift ist zu kurz.").max(120),
  text: z.string().trim().min(10, "Der Text ist zu kurz.").max(1200),
  href: z.string().trim().max(200).optional(),
  linkLabel: z.string().trim().max(60).optional(),
  order: z.coerce.number().int().min(0).max(999).optional(),
});

export async function saveTimelineEntry(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  try {
    await assertAdmin();
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    throw error;
  }

  const parsed = schema.safeParse({
    year: formData.get("year"),
    kicker: formData.get("kicker"),
    title: formData.get("title"),
    text: formData.get("text"),
    href: formData.get("href") ?? "",
    linkLabel: formData.get("linkLabel") ?? "",
    order: formData.get("order") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Eingaben prüfen." };
  }

  const data = parsed.data;

  /* Nur eigene Seiten verlinken. Ein externer Link gehoert in den Text, wo er
     als solcher erkennbar ist und die passenden rel-Attribute bekommt. */
  if (data.href && !data.href.startsWith("/")) {
    return { status: "error", message: "Der Link muss mit „/“ beginnen (nur interne Seiten)." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const now = new Date();

  const doc = {
    year: data.year,
    kicker: data.kicker,
    title: data.title,
    text: data.text,
    href: data.href || undefined,
    linkLabel: data.href ? data.linkLabel || "Mehr erfahren" : undefined,
    current: formData.get("current") === "on",
    order: data.order ?? 99,
    updatedAt: now,
  };

  try {
    if (id && ObjectId.isValid(id)) {
      await timeline().updateOne({ _id: new ObjectId(id) }, { $set: doc });
    } else {
      // Der Schluessel dient der Migration zum Wiedererkennen, nicht dem Routing.
      const key = `${slugify(data.year)}-${slugify(data.title)}`.slice(0, 80);
      await timeline().insertOne({ ...doc, key, createdAt: now });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("E11000")) {
      return { status: "error", message: "Ein Eintrag mit dieser Kombination existiert bereits." };
    }
    console.error("[admin] saveTimelineEntry failed", error);
    return { status: "error", message: "Speichern fehlgeschlagen." };
  }

  revalidatePath("/admin/timeline");
  revalidatePath("/ueber-uns");
  return { status: "success", message: `„${data.title}" gespeichert.` };
}

export async function deleteTimelineEntry(
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
  if (!ObjectId.isValid(id)) return { status: "error", message: "Unbekannter Eintrag." };

  await timeline().deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/admin/timeline");
  revalidatePath("/ueber-uns");
  return { status: "success", message: "Eintrag gelöscht." };
}
