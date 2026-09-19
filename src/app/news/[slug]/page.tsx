import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { PageHeader } from "@/components/common/page-header";
import { ArticleCard } from "@/components/news/article-card";
import { ShareButtons } from "@/components/news/share-buttons";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getAllPublishedSlugs,
  getArticleBySlug,
  getRelatedArticles,
  getAuthorProfiles,
} from "@/services/content";
import { formatDate, formatReadingTime } from "@/lib/format";
import { site } from "@/lib/site";
import styles from "./page.module.css";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getAllPublishedSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

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
        eyebrow={article.categorySlug}
        title={article.title}
        description={article.excerpt}
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/news", label: "News" },
          { href: `/news/${article.slug}`, label: article.title },
        ]}
      />

      <article className="section shell">
        <div className={styles.layout}>
          <div className={styles.main}>
            <div className={styles.byline}>
              <Avatar style={{ width: 40, height: 40 }}>
                {author?.image && <AvatarImage src={author.image} alt="" />}
                <AvatarFallback>
                  {article.authorName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={styles.bylineText}>
                {/* Nur verlinken, wenn es das Profil oeffentlich gibt — sonst
                    fuehrt der Verweis auf eine 404-Seite. */}
                {author ? (
                  <Link href={`/moderatoren/${author.slug}`} className={styles.authorLink}>
                    {article.authorName}
                  </Link>
                ) : (
                  <span className={styles.author}>{article.authorName}</span>
                )}
                <span className={styles.meta}>
                  {article.publishedAt && (
                    <time dateTime={article.publishedAt}>
                      {formatDate(article.publishedAt)}
                    </time>
                  )}
                  {" · "}
                  {formatReadingTime(article.readingTime)}
                </span>
              </div>
            </div>

            {article.coverImage && (
              <figure className={styles.cover}>
                <Image
                  src={article.coverImage}
                  alt={article.coverAlt ?? ""}
                  width={1200}
                  height={675}
                  priority
                  className={styles.coverImage}
                />
              </figure>
            )}

            {/* Editor output. Sanitised on write in the admin action, never here. */}
            <div
              className={styles.prose}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {article.tags.length > 0 && (
              <div className={styles.tags}>
                {article.tags.map((tag) => (
                  <Link key={tag} href={`/suche?q=${encodeURIComponent(tag)}`}>
                    <Badge mode="lighter" size="sm">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            <ShareButtons url={url} title={article.title} />
          </div>
        </div>

        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="related-title">
            <h2 id="related-title" className={styles.relatedTitle}>
              Weiterlesen
            </h2>
            <div className={styles.relatedGrid}>
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
