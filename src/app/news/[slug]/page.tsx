import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
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

      {/* --- Kopf ------------------------------------------------------------
          Eigener Aufbau statt PageHeader: Kategorie und Zeit stehen ueber dem
          Titel, die Autorin oder der Autor als Modul darunter. */}
      <header className="shell pt-2">
        <div className="surface-card rounded-[var(--radius)] px-5 pt-5 pb-7 sm:px-8 sm:pt-6 sm:pb-10">
          <Breadcrumbs
            items={[
              { href: "/", label: "Start" },
              { href: "/news", label: "News" },
              { href: `/news/${article.slug}`, label: article.title },
            ]}
          />

          <div className="mt-8 max-w-5xl sm:mt-12">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href={`/news?kategorie=${article.categorySlug}`}
                className="rounded-[3px] bg-volt px-2 py-0.5 font-mono text-[0.7rem] font-semibold lowercase text-graphite transition-colors hover:bg-graphite hover:text-volt"
              >
                {categoryName}
              </Link>
              {article.publishedAt && (
                <time className="font-mono text-xs text-muted" dateTime={article.publishedAt}>
                  {formatDate(article.publishedAt)}
                </time>
              )}
              <span className="font-mono text-xs text-muted">{formatReadingTime(article.readingTime)}</span>
            </div>

            <h1 className="mt-6 font-display text-[2.4rem] text-balance break-words hyphens-auto text-foreground sm:text-6xl lg:text-7xl">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted sm:text-xl">
                {article.excerpt}
              </p>
            )}
          </div>

          <div className="well mt-8 inline-flex max-w-full items-center gap-3 rounded-[var(--radius)] py-2 pr-5 pl-2">
            <AuthorAvatar name={article.authorName} image={author?.image} size="md" />
            <div className="min-w-0">
              <p className="font-meta text-muted">Geschrieben von</p>
              {/* Nur verlinken, wenn es das Profil oeffentlich gibt — sonst
                  fuehrt der Verweis auf eine 404-Seite. */}
              {author ? (
                <Link
                  href={`/moderatoren/${author.slug}`}
                  className="block truncate font-semibold text-foreground transition-colors hover:text-accent-text"
                >
                  {article.authorName}
                </Link>
              ) : (
                <span className="block truncate font-semibold text-foreground">{article.authorName}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <article className="shell pt-2">
        {article.coverImage ? (
          <figure className="surface-card rounded-[var(--radius)] p-2">
            <div className="well overflow-hidden rounded-[3px]">
              <Image
                src={article.coverImage}
                alt={article.coverAlt ?? ""}
                width={1200}
                height={675}
                sizes="(max-width: 1400px) 100vw, 1330px"
                priority
                className="h-auto w-full"
              />
            </div>
          </figure>
        ) : (
          // Meilensteine haben kein Foto, aber eine Zahl — die steht gross
          // auf dem erzeugten Titelbild. Dasselbe Format wie ein Foto
          // (1200 × 675), damit der Text nicht springt.
          article.coverLabel && (
            <div className="surface-card rounded-[var(--radius)] p-2">
              <div className="relative aspect-video overflow-hidden rounded-[3px]">
                <ArticleCover
                  categorySlug={article.categorySlug}
                  categoryName={categoryName}
                  label={article.coverLabel}
                />
              </div>
            </div>
          )
        )}

        <div className="mt-2 grid gap-2 lg:grid-cols-[minmax(0,1fr)_19rem]">
          {/* Ausgabe des Editors. Bereinigt beim Speichern in der
              Admin-Action, nie hier. */}
          <div className="surface-card min-w-0 rounded-[var(--radius)] px-5 py-8 sm:px-10 sm:py-12 lg:px-16">
            <div className="vfm-prose mx-auto max-w-[68ch]" dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          <aside aria-label="Zum Artikel" className="flex flex-col gap-2 lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">
            <ShareButtons url={url} title={article.title} />

            {article.tags.length > 0 && (
              <div className="surface-card rounded-[var(--radius)] p-4">
                <h2 className="font-meta text-muted">Schlagwörter</h2>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {article.tags.map((tag) => (
                    <li key={tag}>
                      <Link
                        href={`/suche?q=${encodeURIComponent(tag)}`}
                        className="inline-flex rounded-[3px] bg-default px-2 py-0.5 font-mono text-[0.75rem] lowercase text-foreground transition-colors hover:bg-volt hover:text-graphite"
                      >
                        {tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="shell pt-12 sm:pt-16">
          <SectionHeader id="related-title" title="Weiterlesen" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
