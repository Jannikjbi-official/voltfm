"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";

import { events } from "@/db/collections";
import { assertCan, AuthorizationError } from "@/lib/session";
import { slugify, parseStationTime } from "@/lib/format";
import type { EntityFormState } from "@/components/admin/entity-types";

/** Same allow-list idea as the article editor: the render path must be able to
 *  trust what is stored, so sanitising happens on write. */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s", "mark", "blockquote",
    "h2", "h3", "h4",
    "ul", "ol", "li",
    "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td",
    "aside", "div", "hr",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "loading"],
    figure: ["class"],
    aside: ["class"],
    div: ["class"],
    table: ["class"],
    p: ["class"],
  },
  allowedClasses: {
    figure: ["vfm-figure", "vfm-figure--wide", "vfm-figure--left", "vfm-figure--right"],
    aside: ["vfm-callout", "vfm-callout--warning", "vfm-callout--success"],
    div: ["vfm-columns", "vfm-clear"],
    table: ["vfm-table"],
    p: ["vfm-lead"],
  },
  allowedSchemes: ["https", "mailto"],
  allowedSchemesByTag: { img: ["https"] },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        ...(attribs.href?.startsWith("http")
          ? { target: "_blank", rel: "noreferrer noopener" }
          : {}),
      },
    }),
  },
};

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
  image: z.string().trim().url().or(z.literal("")).optional(),
  url: z.string().trim().url().or(z.literal("")).optional(),
});

export async function saveEvent(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  try {
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

  const now = new Date();
  const doc = {
    title: data.title,
    slug,
    description: data.description,
    content: data.content ? sanitizeHtml(data.content, SANITIZE_OPTIONS) : undefined,
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
