import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { PageHeader } from "@/components/common/page-header";
import { ArticleCard } from "@/components/news/article-card";
import { ArticleCover } from "@/components/news/article-cover";
import { ShareButtons } from "@/components/news/share-buttons";
import { AuthorAvatar } from "@/components/news/author-avatar";
import {
  getArticleBySlug,
  getCategoryNames,
  getRelatedArticles,
  getAuthorProfiles,
} from "@/services/content";
import { formatDate, formatReadingTime } from "@/lib/format";
import { site } from "@/lib/site";
import { SectionHeader } from "@/components/common/section-header";
import { chipVariants } from "@heroui/react";

type Params = { slug: string };

/* Kein generateStaticParams — aus demselben Grund wie bei /events/[slug]:
   Ein Beitrag, der nach dem Deploy im Admin entsteht, waere sonst auf Vercel
   eine statische Seite, die an cookies() im Root-Layout scheitert (500). */

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artikel nicht gefunden" };

  const image = article.ogImage ?? article.coverImage;

  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.seoTitle ?? article.title,
      description: article.seoDescription ?? article.excerpt,
      url: `${site.url}/news/${article.slug}`,
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      authors: [article.authorName],
      tags: article.tags,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle ?? article.title,
      description: article.seoDescription ?? article.excerpt,
      images: image ? [image] : undefined,
    },
  };
}

export const revalidate = 300;

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const author = (await getAuthorProfiles())[article.authorName];
  const categoryName = (await getCategoryNames())[article.categorySlug] ?? article.categorySlug;

  const related = await getRelatedArticles(article);
  const url = `${site.url}/news/${article.slug}`;

  /* Article structured data, so search engines can render it as news. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Person", name: article.authorName },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      sameAs: [site.instagramUrl],
    },
    mainEntityOfPage: url,
    ...(article.coverImage ? { image: [article.coverImage] } : {}),
    keywords: article.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        title={article.title}
        description={article.excerpt}
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/news", label: "News" },
          { href: `/news/${article.slug}`, label: article.title },
        ]}
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="flex items-center gap-3">
            <AuthorAvatar name={article.authorName} image={author?.image} size="md" />
            <div className="flex flex-col">
              {/* Nur verlinken, wenn es das Profil oeffentlich gibt — sonst
                  fuehrt der Verweis auf eine 404-Seite. */}
              {author ? (
                <Link
                  href={`/moderatoren/${author.slug}`}
                  className="rounded-sm font-semibold text-foreground hover:underline"
                >
                  {article.authorName}
                </Link>
              ) : (
                <span className="font-semibold text-foreground">{article.authorName}</span>
              )}
              <span className="flex flex-wrap gap-x-3 text-sm text-muted">
                {article.publishedAt && (
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                )}
                <span>{formatReadingTime(article.readingTime)}</span>
              </span>
            </div>
          </div>
          <Link
            href={`/news?kategorie=${article.categorySlug}`}
            className={`${chipVariants({ color: "accent", variant: "soft", size: "md" }).base()} font-semibold hover:underline`}
          >
            {categoryName}
          </Link>
        </div>
      </PageHeader>

      <article className="shell pt-10 pb-4 sm:pt-14">
        {article.coverImage ? (
          <figure className="mx-auto max-w-4xl">
            <Image
              src={article.coverImage}
              alt={article.coverAlt ?? ""}
              width={1200}
              height={675}
              priority
              className="h-auto w-full rounded-2xl"
            />
          </figure>
        ) : (
          // Meilensteine haben kein Foto, aber eine Zahl — die steht gross
          // auf dem erzeugten Titelbild. Dasselbe Format wie ein Foto
          // (1200 × 675), damit der Text nicht springt.
          article.coverLabel && (
            <div className="relative mx-auto aspect-video max-w-4xl overflow-hidden rounded-2xl">
              <ArticleCover
                categorySlug={article.categorySlug}
                categoryName={categoryName}
                label={article.coverLabel}
              />
            </div>
          )
        )}

        <div className="mx-auto mt-10 max-w-[68ch] sm:mt-14">
          {/* Ausgabe des Editors. Bereinigt beim Speichern in der
              Admin-Action, nie hier. */}
          <div className="vfm-prose" dangerouslySetInnerHTML={{ __html: article.content }} />

          {article.tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Schlagwörter">
              {article.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/suche?q=${encodeURIComponent(tag)}`}
                    className={`${chipVariants({ variant: "soft", size: "md" }).base()} hover:underline`}
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <ShareButtons url={url} title={article.title} />
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="shell mt-16 border-t border-separator pt-14 sm:mt-20">
          <SectionHeader id="related-title" title="Weiterlesen" />
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
