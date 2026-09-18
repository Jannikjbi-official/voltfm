"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { hosts } from "@/db/collections";
import { assertAdmin, AuthorizationError } from "@/lib/session";
import { slugify } from "@/lib/format";
import type { EntityFormState } from "@/components/admin/entity-types";

const schema = z.object({
  name: z.string().trim().min(2, "Name ist zu kurz.").max(80),
  slug: z.string().trim().max(80).optional(),
  role: z.string().trim().min(2, "Bitte eine Rolle angeben.").max(80),
  bio: z.string().trim().min(20, "Die Beschreibung ist zu kurz.").max(4000),
  image: z.string().trim().url().or(z.literal("")).optional(),
  discordUserId: z
    .string()
    .trim()
    .regex(/^\d{5,25}$/, "Discord-ID besteht nur aus Ziffern.")
    .or(z.literal(""))
    .optional(),
  profileLayout: z.enum(["spotlight", "editorial", "stage", "zine"]),
  accentHue: z.coerce.number().int().min(0).max(360).optional(),
  showSlugs: z.string().trim().max(300).optional(),
  socials: z.string().trim().max(600).optional(),
  order: z.coerce.number().int().min(0).max(999).optional(),
});

/** "Discord|https://…" per line — simple enough to edit by hand. */
function parseSocials(raw: string | undefined): { label: string; url: string }[] {
  return (raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.split("|").map((part) => part.trim());
      return { label: label ?? "", url: url ?? "" };
    })
    .filter((entry) => entry.label && /^https?:\/\//.test(entry.url));
}

export async function saveHost(
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
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    role: formData.get("role"),
    bio: formData.get("bio"),
    image: formData.get("image") ?? "",
    discordUserId: formData.get("discordUserId") ?? "",
    profileLayout: formData.get("profileLayout") ?? "spotlight",
    accentHue: formData.get("accentHue") || undefined,
    showSlugs: formData.get("showSlugs") ?? "",
    socials: formData.get("socials") ?? "",
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
    role: data.role,
    bio: data.bio,
    image: data.image || undefined,
    discordUserId: data.discordUserId || null,
    profileLayout: data.profileLayout,
    accentHue: data.accentHue ?? null,
    showSlugs: (data.showSlugs ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    socials: parseSocials(data.socials),
    order: data.order ?? 99,
    active: formData.get("active") === "on",
    updatedAt: now,
  };

  try {
    if (id && ObjectId.isValid(id)) {
      await hosts().updateOne({ _id: new ObjectId(id) }, { $set: doc });
    } else {
      await hosts().insertOne({ ...doc, createdAt: now });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("E11000")) {
      return { status: "error", message: `Der Slug „${slug}" ist schon vergeben.` };
    }
    console.error("[admin] saveHost failed", error);
    return { status: "error", message: "Speichern fehlgeschlagen." };
  }

  revalidatePath("/admin/moderatoren");
  revalidatePath("/moderatoren");
  revalidatePath(`/moderatoren/${slug}`);
  revalidatePath("/");
  return { status: "success", message: `„${data.name}" gespeichert.` };
}

export async function deleteHost(
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

  await hosts().deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/admin/moderatoren");
  revalidatePath("/moderatoren");
  revalidatePath("/");
  return { status: "success", message: "Moderator gelöscht." };
}
