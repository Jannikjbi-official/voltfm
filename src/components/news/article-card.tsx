import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ArticleDTO } from "@/services/content";
import { formatDate, formatReadingTime } from "@/lib/format";
import { ImagePlaceholder } from "@/components/common/image-placeholder";
import styles from "./article-card.module.css";

/**
 * The article teaser, in three densities.
 *
 * Composed from OlyxUI Badge and Avatar rather than a bespoke card shell. Note
 * that OlyxUI ships no Card component at all, so the surface itself is plain
 * semantic markup styled with the VoltFM tokens — there is nothing to reuse.
 *
 *   default — the grid workhorse, image on top
 *   wide    — a split layout for the lead item of a list
 *   compact — text-only row for sidebars and "read next"
 */
export function ArticleCard({
  article,
  variant = "default",
  priority = false,
}: {
  article: ArticleDTO;
  variant?: "default" | "wide" | "compact";
  priority?: boolean;
}) {
  const published = article.publishedAt ? formatDate(article.publishedAt) : "";

  return (
    <article className={styles.card} data-variant={variant}>
      {variant !== "compact" && (
        <Link href={`/news/${article.slug}`} className={styles.media} tabIndex={-1} aria-hidden="true">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt=""
              fill
              sizes={variant === "wide" ? "(max-width: 900px) 100vw, 50vw" : "(max-width: 900px) 100vw, 33vw"}
              className={styles.image}
              priority={priority}
            />
          ) : (
            // No cover art: a flat branded placeholder keeps the grid rhythm
            // intact instead of leaving a hole.
            <ImagePlaceholder label={article.title} ratio="16 / 10" />
          )}
        </Link>
      )}

      <div className={styles.body}>
        <div className={styles.meta}>
          <Badge mode="lighter" size="sm" render={<Link href={`/news?kategorie=${article.categorySlug}`} />}>
            {article.categorySlug}
          </Badge>
          <time dateTime={article.publishedAt ?? undefined}>{published}</time>
        </div>

        <h3 className={styles.title}>
          {/* The whole card is clickable via ::after, but the link text stays
              the accessible name. */}
          <Link href={`/news/${article.slug}`} className={styles.link}>
            {article.title}
          </Link>
        </h3>

        <p className={styles.excerpt}>{article.excerpt}</p>

        <footer className={styles.footer}>
          <Avatar style={{ width: 22, height: 22 }}>
            <AvatarFallback>{article.authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className={styles.author}>{article.authorName}</span>
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          <span>{formatReadingTime(article.readingTime)}</span>
        </footer>
      </div>
    </article>
  );
}
