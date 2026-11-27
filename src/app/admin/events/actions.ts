"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { imageUrl } from "@/lib/validation";
import { renderRichText, findImageWithoutAlt } from "@/lib/sanitize";

import { events } from "@/db/collections";
import { assertAdmin, assertCan, AuthorizationError } from "@/lib/session";
import { slugify, parseStationTime } from "@/lib/format";
import type { EntityFormState } from "@/components/admin/entity-types";

const schema = z.object({
  title: z.string().trim().min(3, "Titel ist zu kurz.").max(140),
  slug: z.string().trim().max(140).optional(),
  description: z.string().trim().min(10, "Beschreibung ist zu kurz.").max(600),
  content: z.string().trim().max(8000).optional(),
  startsAt: z.string().trim().min(1, "Bitte ein Startdatum angeben."),
  endsAt: z.string().trim().optional(),
  location: z.string().trim().min(2, "Bitte einen Ort angeben.").max(120),
  category: z.string().trim().min(2, "Bitte eine Kategorie angeben.").max(60),
  status: z.enum(["upcoming", "live", "past", "cancelled"]),
  image: imageUrl.optional(),
  url: z.string().trim().url().or(z.literal("")).optional(),
  rueckblick: z.string().trim().max(12000).optional(),
});

/** Höchstens so viele Bilder im Rückblick. */
const RECAP_IMAGES_MAX = 6;

/**
 * Die Bilder zum Rückblick aus dem FormData: `rueckblickBilderUrl` und
 * `rueckblickBilderAlt` kommen paarweise in derselben Reihenfolge. Leere
 * Zeilen fallen weg; ein Bild ohne Beschreibung wird zurückgewiesen.
 */
function parseRecapImages(formData: FormData): { url: string; alt: string }[] | string {
  const urls = formData.getAll("rueckblickBilderUrl").map((value) => String(value).trim());
  const alts = formData.getAll("rueckblickBilderAlt").map((value) => String(value).trim());
  const images: { url: string; alt: string }[] = [];
  for (const [index, url] of urls.entries()) {
    if (!url) continue;
    if (!imageUrl.safeParse(url).success) return "Ein Bild im Rückblick hat keine gültige Adresse.";
    const alt = (alts[index] ?? "").slice(0, 200);
    if (!alt) return `Bild ${images.length + 1} im Rückblick hat noch keine Beschreibung.`;
    images.push({ url, alt });
  }
  if (images.length > RECAP_IMAGES_MAX) return `Höchstens ${RECAP_IMAGES_MAX} Bilder im Rückblick.`;
  return images;
}

export async function saveEvent(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  try {
    await assertAdmin();
    await assertCan("event", ["update"]);
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    throw error;
  }

  const parsed = schema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    description: formData.get("description"),
    content: formData.get("content") ?? "",
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") ?? "",
    location: formData.get("location"),
    category: formData.get("category"),
    status: formData.get("status") ?? "upcoming",
    image: formData.get("image") ?? "",
    url: formData.get("url") ?? "",
    rueckblick: formData.get("rueckblick") ?? "",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Eingaben prüfen." };
  }

  const data = parsed.data;
  const id = String(formData.get("id") ?? "").trim();
  const slug = slugify(data.slug || data.title);

  const startsAt = parseStationTime(data.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return { status: "error", message: "Das Startdatum ist ungültig." };
  }

  const endsAt = data.endsAt ? parseStationTime(data.endsAt) : null;
  if (endsAt && Number.isNaN(endsAt.getTime())) {
    return { status: "error", message: "Das Enddatum ist ungültig." };
  }
  if (endsAt && endsAt < startsAt) {
    return { status: "error", message: "Das Enddatum liegt vor dem Start." };
  }

  const content = data.content ? renderRichText(data.content) : undefined;

  /* Wie bei den Artikeln: kein Bild ohne Beschreibung. */
  if (content && findImageWithoutAlt(content)) {
    return {
      status: "error",
      message:
        "Ein Bild hat noch keine Beschreibung. Trag sie in den eckigen Klammern ein: ![Was zu sehen ist](…).",
    };
  }

  const rueckblick = data.rueckblick ? renderRichText(data.rueckblick) : undefined;
  if (rueckblick && findImageWithoutAlt(rueckblick)) {
    return {
      status: "error",
      message:
        "Ein Bild im Rückblick hat noch keine Beschreibung. Trag sie in den eckigen Klammern ein: ![Was zu sehen ist](…).",
    };
  }

  const rueckblickBilder = parseRecapImages(formData);
  if (typeof rueckblickBilder === "string") return { status: "error", message: rueckblickBilder };

  const now = new Date();
  const doc = {
    title: data.title,
    slug,
    description: data.description,
    content,
    contentSource: data.content || undefined,
    startsAt,
    endsAt,
    location: data.location,
    category: data.category,
    /* Gespeichert wird nur die Absicht der Redaktion. Ob ein Termin vorbei
       ist, entscheidet beim Lesen das Datum (siehe withEffectiveStatus) —
       sonst waere ein eben angelegter Termin fuer immer "vergangen", nur weil
       er beim Speichern einmal so aussah. */
    status: data.status,
    image: data.image || undefined,
    url: data.url || undefined,
    rueckblick,
    rueckblickSource: data.rueckblick || undefined,
    rueckblickBilder,
    updatedAt: now,
  };

  try {
    if (id && ObjectId.isValid(id)) {
      await events().updateOne({ _id: new ObjectId(id) }, { $set: doc });
    } else {
      await events().insertOne({ ...doc, createdAt: now });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("E11000")) {
      return { status: "error", message: `Der Slug „${slug}" ist schon vergeben.` };
    }
    console.error("[admin] saveEvent failed", error);
    return { status: "error", message: "Speichern fehlgeschlagen." };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath(`/events/${slug}`);
  revalidatePath("/community");
  revalidatePath("/");
  return { status: "success", message: `„${data.title}" gespeichert.` };
}

export async function deleteEvent(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  try {
    await assertAdmin();
    await assertCan("event", ["delete"]);
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    throw error;
  }

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return { status: "error", message: "Unbekannter Eintrag." };

  await events().deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
  return { status: "success", message: "Event gelöscht." };
}
