"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { imageUrl } from "@/lib/validation";
import { renderRichText, findImageWithoutAlt } from "@/lib/sanitize";

import { spotlights } from "@/db/collections";
import { assertAdmin, assertCan, AuthorizationError } from "@/lib/session";
import { slugify } from "@/lib/format";
import { MONAT_PATTERN } from "@/lib/spotlight";
import type { EntityFormState } from "@/components/admin/entity-types";

const schema = z.object({
  name: z.string().trim().min(2, "Name ist zu kurz.").max(80),
  slug: z.string().trim().max(80).optional(),
  art: z.enum(["team", "hoerer"], { message: "Bitte wähl aus, wer im Fokus steht." }),
  kurz: z
    .string()
    .trim()
    .min(10, "Der Kurztext ist zu kurz.")
    .max(200, "Der Kurztext darf höchstens 200 Zeichen haben."),
  content: z.string().trim().max(12000).optional(),
  bild: imageUrl.optional(),
  monat: z.string().trim().regex(MONAT_PATTERN, "Den Monat bitte als JJJJ-MM angeben, z. B. 2026-11."),
});

/** Admin-Zugang und die konkrete Faehigkeit — beides auf dem Server. */
async function authorize(action: "update" | "delete"): Promise<EntityFormState | null> {
  try {
    await assertAdmin();
    await assertCan("spotlight", [action]);
    return null;
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    throw error;
  }
}

function revalidateSpotlight(slug?: string) {
  revalidatePath("/admin/spotlight");
  revalidatePath("/spotlight");
  if (slug) revalidatePath(`/spotlight/${slug}`);
}

export async function saveSpotlight(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const denied = await authorize("update");
  if (denied) return denied;

  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    art: formData.get("art"),
    kurz: formData.get("kurz"),
    content: formData.get("content") ?? "",
    bild: formData.get("bild") ?? "",
    monat: formData.get("monat"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Eingaben prüfen." };
  }

  const data = parsed.data;
  const id = String(formData.get("id") ?? "").trim();
  const slug = slugify(data.slug || `${data.name}-${data.monat}`);
  if (!slug) return { status: "error", message: "Aus dem Namen lässt sich kein Slug bilden." };

  const content = data.content ? renderRichText(data.content) : undefined;

  /* Wie bei Artikeln und Events: kein Bild ohne Beschreibung. */
  if (content && findImageWithoutAlt(content)) {
    return {
      status: "error",
      message:
        "Ein Bild hat noch keine Beschreibung. Trag sie in den eckigen Klammern ein: ![Was zu sehen ist](…).",
    };
  }

  const now = new Date();
  const doc = {
    name: data.name,
    slug,
    art: data.art,
    kurz: data.kurz,
    content,
    contentSource: data.content || undefined,
    bild: data.bild || undefined,
    monat: data.monat,
    active: formData.get("active") === "on",
    updatedAt: now,
  };

  let previousSlug: string | undefined;
  try {
    if (id && ObjectId.isValid(id)) {
      const before = await spotlights().findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: doc },
        { returnDocument: "before", projection: { slug: 1 } },
      );
      if (!before) return { status: "error", message: "Unbekannter Eintrag." };
      previousSlug = before.slug;
    } else {
      await spotlights().insertOne({ ...doc, createdAt: now });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("E11000")) {
      return {
        status: "error",
        message: `Der Slug „${slug}“ ist schon vergeben. Wähl einen anderen oder ändere den Namen.`,
      };
    }
    console.error("[admin] saveSpotlight failed", error);
    return { status: "error", message: "Speichern fehlgeschlagen." };
  }

  revalidateSpotlight(slug);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/spotlight/${previousSlug}`);
  return { status: "success", message: `„${data.name}“ gespeichert.` };
}

export async function deleteSpotlight(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const denied = await authorize("delete");
  if (denied) return denied;

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return { status: "error", message: "Unbekannter Eintrag." };

  const removed = await spotlights().findOneAndDelete(
    { _id: new ObjectId(id) },
    { projection: { slug: 1 } },
  );

  revalidateSpotlight(removed?.slug);
  return { status: "success", message: "Porträt gelöscht." };
}
