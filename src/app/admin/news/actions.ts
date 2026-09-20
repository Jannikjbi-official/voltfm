"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { imageUrl } from "@/lib/validation";

import { articles } from "@/db/collections";
import { assertCan, AuthorizationError } from "@/lib/session";
import { slugify } from "@/lib/format";
import { renderRichText, findImageWithoutAlt } from "@/lib/sanitize";
import type { ArticleStatus } from "@/types/content";

/**
 * Article create / update / delete.
 *
 * Every action re-checks admin rights on the server. The admin layout's own
 * check does not cover these: a server action is a POST that can be invoked
 * directly, so it must authorise itself.
 */

const schema = z.object({
  title: z.string().trim().min(4, "Titel ist zu kurz.").max(160),
  slug: z.string().trim().max(120).optional(),
  excerpt: z.string().trim().min(20, "Teaser ist zu kurz.").max(400),
  content: z.string().trim().min(1, "Der Artikel hat keinen Inhalt."),
  categorySlug: z.string().trim().min(1, "Bitte eine Kategorie wählen."),
  tags: z.string().trim().max(300).optional(),
  coverImage: imageUrl.optional(),
  coverAlt: z.string().trim().max(200).optional(),
  status: z.enum(["draft", "scheduled", "published", "archived"]),
  publishedAt: z.string().trim().optional(),
});

export type ArticleFormState = {
  status: "idle" | "error";
  message?: string;
};

function readingTimeOf(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function parse(formData: FormData) {
  return schema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    categorySlug: formData.get("categorySlug"),
    tags: formData.get("tags") ?? "",
    coverImage: formData.get("coverImage") ?? "",
    coverAlt: formData.get("coverAlt") ?? "",
    status: formData.get("status"),
    publishedAt: formData.get("publishedAt") ?? "",
  });
}

/** Resolves the publish date from the chosen status. */
function resolvePublishedAt(status: ArticleStatus, raw: string | undefined): Date | null {
  if (status === "draft" || status === "archived") return raw ? new Date(raw) : null;
  if (status === "scheduled") return raw ? new Date(raw) : new Date();
  // published: now, unless an explicit date was given (back-dating an import).
  return raw ? new Date(raw) : new Date();
}

export async function saveArticle(
  _prev: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  let user;
  try {
    user = await assertCan("article", ["update"]);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }

  const parsed = parse(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Eingaben prüfen." };
  }

  const data = parsed.data;
  const id = String(formData.get("id") ?? "").trim();
  const slug = slugify(data.slug || data.title);
  const content = renderRichText(data.content);

  /* Ein Bild ohne Beschreibung ist fuer alle unbrauchbar, die es nicht sehen
     koennen — und faellt sonst niemandem auf. Deshalb hier, nicht nur im
     Editor. */
  if (findImageWithoutAlt(content)) {
    return {
      status: "error",
      message:
        "Ein Bild hat noch keine Beschreibung. Trag sie in den eckigen Klammern ein: ![Was zu sehen ist](…).",
    };
  }
  const now = new Date();

  /*
   * Der Autor kommt aus der Anmeldung, nicht aus einem Textfeld — sonst kann
   * jede Person jeden Namen daruntersetzen. Beim Bearbeiten bleibt der
   * urspruengliche Autor stehen: Wer einen Tippfehler korrigiert, hat den
   * Beitrag nicht geschrieben.
   */
  const existing =
    id && ObjectId.isValid(id) ? await articles().findOne({ _id: new ObjectId(id) }) : null;

  const authorName =
    existing?.authorName ?? (user.name || (user as { username?: string }).username || "VoltFM");
  const authorId = existing?.authorId ?? user.id;

  const doc = {
    title: data.title,
    slug,
    excerpt: data.excerpt,
    content,
    contentSource: data.content,
    coverImage: data.coverImage || undefined,
    coverAlt: data.coverAlt || undefined,
    authorId,
    authorName,
    categorySlug: data.categorySlug,
    tags: (data.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    status: data.status,
    featured: formData.get("featured") === "on",
    publishedAt: resolvePublishedAt(data.status, data.publishedAt),
    readingTime: readingTimeOf(content),
    updatedAt: now,
  };

  try {
    if (id && ObjectId.isValid(id)) {
      await articles().updateOne({ _id: new ObjectId(id) }, { $set: doc });
    } else {
      await articles().insertOne({ ...doc, createdAt: now });
    }
  } catch (error) {
    // A duplicate slug is the realistic failure here, and it has a clear fix.
    if (error instanceof Error && error.message.includes("E11000")) {
      return {
        status: "error",
        message: `Der Slug „${slug}" ist schon vergeben. Bitte einen anderen wählen.`,
      };
    }
    console.error("[admin] saveArticle failed", error);
    return { status: "error", message: "Speichern fehlgeschlagen." };
  }

  // Refresh every surface this article can appear on.
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);
  revalidatePath("/");

  redirect("/admin/news");
}

export async function deleteArticle(formData: FormData): Promise<void> {
  await assertCan("article", ["update"]);

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return;

  await articles().deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/");
  redirect("/admin/news");
}
