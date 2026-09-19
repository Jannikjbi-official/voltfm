"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";

import { articles } from "@/db/collections";
import { assertCan, AuthorizationError } from "@/lib/session";
import { slugify } from "@/lib/format";
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
  coverImage: z.string().trim().url().or(z.literal("")).optional(),
  coverAlt: z.string().trim().max(200).optional(),
  authorName: z.string().trim().min(2).max(80),
  status: z.enum(["draft", "scheduled", "published", "archived"]),
  publishedAt: z.string().trim().optional(),
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(300).optional(),
});

/**
 * What the editor is allowed to store.
 *
 * The article body is rendered with dangerouslySetInnerHTML, so this is the
 * security boundary for stored XSS: sanitising here means the render path can
 * trust what is in the database. Anything not on this list is stripped.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s", "mark", "small", "sup", "sub", "blockquote",
    "h2", "h3", "h4",
    "ul", "ol", "li",
    "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
    "aside", "div",
    "code", "pre", "hr",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    th: ["scope", "colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    // `class` is allowed only on these, and only with the names below.
    figure: ["class"],
    aside: ["class"],
    div: ["class"],
    table: ["class"],
    p: ["class"],
  },
  /**
   * The layout vocabulary the editor toolbar can emit, styled globally in
   * styles/editor-content.css. Restricting it here means an editor cannot
   * smuggle in arbitrary class names and hang unexpected styling off them.
   */
  allowedClasses: {
    figure: ["vfm-figure", "vfm-figure--wide", "vfm-figure--left", "vfm-figure--right"],
    aside: ["vfm-callout", "vfm-callout--warning", "vfm-callout--success"],
    div: ["vfm-columns", "vfm-clear"],
    table: ["vfm-table"],
    p: ["vfm-lead"],
  },
  allowedSchemes: ["https", "mailto"],
  // Images may only come from hosts we actually serve, which keeps the editor
  // from embedding trackers or mixed content.
  allowedSchemesByTag: { img: ["https"] },
  transformTags: {
    // Force external links to be safe regardless of what the editor produced.
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        ...(attribs.href?.startsWith("http")
          ? { target: "_blank", rel: "noreferrer noopener" }
          : {}),
      },
    }),
    img: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, loading: "lazy" },
    }),
  },
};

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
    authorName: formData.get("authorName"),
    status: formData.get("status"),
    publishedAt: formData.get("publishedAt") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
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
  const content = sanitizeHtml(data.content, SANITIZE_OPTIONS);
  const now = new Date();

  const doc = {
    title: data.title,
    slug,
    excerpt: data.excerpt,
    content,
    coverImage: data.coverImage || undefined,
    coverAlt: data.coverAlt || undefined,
    authorId: user.id,
    authorName: data.authorName,
    categorySlug: data.categorySlug,
    tags: (data.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    status: data.status,
    featured: formData.get("featured") === "on",
    publishedAt: resolvePublishedAt(data.status, data.publishedAt),
    readingTime: readingTimeOf(content),
    seoTitle: data.seoTitle || undefined,
    seoDescription: data.seoDescription || undefined,
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
