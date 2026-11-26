"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { imageUrl } from "@/lib/validation";
import { renderRichText, findImageWithoutAlt } from "@/lib/sanitize";

import { partners } from "@/db/collections";
import { assertAdmin, assertCan, AuthorizationError } from "@/lib/session";
import { slugify } from "@/lib/format";
import type { EntityFormState } from "@/components/admin/entity-types";

const schema = z.object({
  name: z.string().trim().min(2, "Name ist zu kurz.").max(80),
  slug: z.string().trim().max(80).optional(),
  kurz: z
    .string()
    .trim()
    .min(10, "Der Kurztext ist zu kurz.")
    .max(160, "Der Kurztext darf höchstens 160 Zeichen haben."),
  content: z.string().trim().max(8000).optional(),
  logo: imageUrl.optional(),
  banner: imageUrl.optional(),
  links: z.string().trim().max(1200).optional(),
  order: z.coerce.number().int().min(0).max(999).optional(),
});

/** "Twitch|https://…" je Zeile — das Format des Social-Links-Felds. */
function parseLinks(raw: string | undefined): { label: string; url: string }[] {
  return (raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("|");
      return { label: (label ?? "").trim(), url: rest.join("|").trim() };
    })
    .filter((entry) => entry.label && /^https?:\/\//.test(entry.url));
}

/** Admin-Zugang und die konkrete Faehigkeit — beides auf dem Server. */
async function authorize(action: "update" | "delete"): Promise<EntityFormState | null> {
  try {
    await assertAdmin();
    await assertCan("partner", [action]);
    return null;
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    throw error;
  }
}

function revalidatePartner(slug?: string) {
  revalidatePath("/admin/partner");
  revalidatePath("/partner");
  if (slug) revalidatePath(`/partner/${slug}`);
}

export async function savePartner(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const denied = await authorize("update");
  if (denied) return denied;

  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    kurz: formData.get("kurz"),
    content: formData.get("content") ?? "",
    logo: formData.get("logo") ?? "",
    banner: formData.get("banner") ?? "",
    links: formData.get("links") ?? "",
    order: formData.get("order") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Eingaben prüfen." };
  }

  const data = parsed.data;
  const id = String(formData.get("id") ?? "").trim();
  const slug = slugify(data.slug || data.name);
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
    kurz: data.kurz,
    content,
    contentSource: data.content || undefined,
    logo: data.logo || undefined,
    banner: data.banner || undefined,
    links: parseLinks(data.links),
    order: data.order ?? 99,
    active: formData.get("active") === "on",
    updatedAt: now,
  };

  let previousSlug: string | undefined;
  try {
    if (id && ObjectId.isValid(id)) {
      const before = await partners().findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: doc },
        { returnDocument: "before", projection: { slug: 1 } },
      );
      if (!before) return { status: "error", message: "Unbekannter Eintrag." };
      previousSlug = before.slug;
    } else {
      await partners().insertOne({ ...doc, createdAt: now });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("E11000")) {
      return {
        status: "error",
        message: `Der Slug „${slug}“ ist schon vergeben. Wähl einen anderen oder ändere den Namen.`,
      };
    }
    console.error("[admin] savePartner failed", error);
    return { status: "error", message: "Speichern fehlgeschlagen." };
  }

  revalidatePartner(slug);
  // Hat sich der Slug geaendert, soll die alte Adresse nicht weiter die alte Seite zeigen.
  if (previousSlug && previousSlug !== slug) revalidatePath(`/partner/${previousSlug}`);
  return { status: "success", message: `„${data.name}“ gespeichert.` };
}

export async function deletePartner(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const denied = await authorize("delete");
  if (denied) return denied;

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return { status: "error", message: "Unbekannter Eintrag." };

  const removed = await partners().findOneAndDelete(
    { _id: new ObjectId(id) },
    { projection: { slug: 1 } },
  );

  revalidatePartner(removed?.slug);
  return { status: "success", message: "Partner gelöscht." };
}
