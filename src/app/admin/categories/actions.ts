"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { articles, categories } from "@/db/collections";
import { assertCan, AuthorizationError } from "@/lib/session";
import { slugify } from "@/lib/format";
import type { EntityFormState } from "@/components/admin/entity-types";

/**
 * Category create / update / delete.
 *
 * Like every admin action, this authorises itself: a server action is a POST
 * that can be invoked directly, so the admin layout's check does not cover it.
 */

const schema = z.object({
  name: z.string().trim().min(2, "Name ist zu kurz.").max(60),
  slug: z.string().trim().max(60).optional(),
  description: z.string().trim().max(300).optional(),
  order: z.coerce.number().int().min(0).max(999).optional(),
});

export async function saveCategory(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  try {
    await assertCan("category", ["update"]);
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    throw error;
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    description: formData.get("description") ?? "",
    order: formData.get("order") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Eingaben prüfen." };
  }

  const data = parsed.data;
  const id = String(formData.get("id") ?? "").trim();
  const slug = slugify(data.slug || data.name);
  const now = new Date();

  const doc = {
    name: data.name,
    slug,
    description: data.description || undefined,
    order: data.order ?? 99,
    updatedAt: now,
  };

  try {
    if (id && ObjectId.isValid(id)) {
      await categories().updateOne({ _id: new ObjectId(id) }, { $set: doc });
    } else {
      await categories().insertOne({ ...doc, createdAt: now });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("E11000")) {
      return { status: "error", message: `Der Slug „${slug}" ist schon vergeben.` };
    }
    console.error("[admin] saveCategory failed", error);
    return { status: "error", message: "Speichern fehlgeschlagen." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/news");
  return { status: "success", message: `Kategorie „${data.name}" gespeichert.` };
}

export async function deleteCategory(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  try {
    await assertCan("category", ["delete"]);
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    throw error;
  }

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return { status: "error", message: "Unbekannte Kategorie." };

  const category = await categories().findOne({ _id: new ObjectId(id) });
  if (!category) return { status: "error", message: "Kategorie nicht gefunden." };

  // Deleting a category that articles still point at would leave them orphaned
  // and invisible in the category filter, so refuse and say how many.
  const inUse = await articles().countDocuments({ categorySlug: category.slug });
  if (inUse > 0) {
    return {
      status: "error",
      message: `„${category.name}" wird noch von ${inUse} Artikel${inUse === 1 ? "" : "n"} genutzt. Bitte zuerst umkategorisieren.`,
    };
  }

  await categories().deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/admin/categories");
  revalidatePath("/news");
  return { status: "success", message: `Kategorie „${category.name}" gelöscht.` };
}
