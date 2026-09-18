import "server-only";
import { ObjectId, type Filter } from "mongodb";
import { articles } from "@/db/collections";
import type { Article, ArticleStatus } from "@/types/content";
import { serialize, serializeAll, type Plain } from "./serialize";

export type ArticleDTO = Plain<Article>;

/**
 * Public reads only ever see published articles whose publish date has passed.
 * Scheduled posts therefore go live on their own without a cron job.
 */
function publishedFilter(): Filter<Article> {
  return { status: "published", publishedAt: { $lte: new Date() } };
}

/**
 * Every content read is wrapped: a Mongo outage should degrade a section to an
 * empty state, not take down the whole page.
 */
async function safe<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error("[content] query failed", error);
    return fallback;
  }
}

export async function listArticles({
  page = 1,
  perPage = 9,
  category,
  tag,
}: {
  page?: number;
  perPage?: number;
  category?: string;
  tag?: string;
} = {}): Promise<{ items: ArticleDTO[]; total: number; pages: number }> {
  return safe(
    async () => {
      const filter: Filter<Article> = { ...publishedFilter() };
      if (category) filter.categorySlug = category;
      if (tag) filter.tags = tag;

      const collection = articles();
      const [items, total] = await Promise.all([
        collection
          .find(filter)
          .sort({ publishedAt: -1 })
          .skip((page - 1) * perPage)
          .limit(perPage)
          .toArray(),
        collection.countDocuments(filter),
      ]);

      return {
        items: serializeAll(items),
        total,
        pages: Math.max(1, Math.ceil(total / perPage)),
      };
    },
    { items: [], total: 0, pages: 1 },
  );
}

export async function getFeaturedArticle(): Promise<ArticleDTO | null> {
  return safe(async () => {
    const collection = articles();
    // Prefer an explicitly featured post; fall back to the newest one.
    const featured =
      (await collection.findOne({ ...publishedFilter(), featured: true }, { sort: { publishedAt: -1 } })) ??
      (await collection.findOne(publishedFilter(), { sort: { publishedAt: -1 } }));
    return featured ? serialize(featured) : null;
  }, null);
}

export async function getArticleBySlug(slug: string): Promise<ArticleDTO | null> {
  return safe(async () => {
    const doc = await articles().findOne({ slug, ...publishedFilter() });
    return doc ? serialize(doc) : null;
  }, null);
}

/** Same category first, newest first, excluding the article being read. */
export async function getRelatedArticles(article: ArticleDTO, limit = 3): Promise<ArticleDTO[]> {
  return safe(async () => {
    const docs = await articles()
      .find({
        ...publishedFilter(),
        slug: { $ne: article.slug },
        $or: [{ categorySlug: article.categorySlug }, { tags: { $in: article.tags } }],
      })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray();
    return serializeAll(docs);
  }, []);
}

export async function getLatestArticles(limit = 4): Promise<ArticleDTO[]> {
  return safe(async () => {
    const docs = await articles()
      .find(publishedFilter())
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray();
    return serializeAll(docs);
  }, []);
}

/** Slugs for generateStaticParams / the sitemap. */
export async function getAllPublishedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return safe(async () => {
    const docs = await articles()
      .find(publishedFilter(), { projection: { slug: 1, updatedAt: 1 } })
      .toArray();
    return docs.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt }));
  }, []);
}

export async function searchArticles(query: string, limit = 10): Promise<ArticleDTO[]> {
  if (!query.trim()) return [];
  return safe(async () => {
    const docs = await articles()
      .find({ ...publishedFilter(), $text: { $search: query } })
      .project<Article>({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .toArray();
    return serializeAll(docs);
  }, []);
}

/* --- Admin reads: status-aware, never exposed to public routes ----------- */

export async function adminListArticles(status?: ArticleStatus): Promise<ArticleDTO[]> {
  return safe(async () => {
    const filter: Filter<Article> = status ? { status } : {};
    const docs = await articles().find(filter).sort({ updatedAt: -1 }).limit(200).toArray();
    return serializeAll(docs);
  }, []);
}

export async function adminGetArticle(id: string): Promise<ArticleDTO | null> {
  if (!ObjectId.isValid(id)) return null;
  return safe(async () => {
    const doc = await articles().findOne({ _id: new ObjectId(id) });
    return doc ? serialize(doc) : null;
  }, null);
}

export async function countArticlesByStatus(): Promise<Record<ArticleStatus, number>> {
  return safe(
    async () => {
      const rows = await articles()
        .aggregate<{ _id: ArticleStatus; count: number }>([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ])
        .toArray();
      const base: Record<ArticleStatus, number> = {
        draft: 0,
        scheduled: 0,
        published: 0,
        archived: 0,
      };
      for (const row of rows) if (row._id in base) base[row._id] = row.count;
      return base;
    },
    { draft: 0, scheduled: 0, published: 0, archived: 0 },
  );
}
