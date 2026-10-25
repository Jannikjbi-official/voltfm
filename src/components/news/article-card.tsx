import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { AuthorAvatar } from "@/components/news/author-avatar";
import { getCategoryNames, getAuthorProfiles, type ArticleDTO } from "@/services/content";
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
export async function ArticleCard({
  article,
  variant = "default",
  priority = false,
}: {
  article: ArticleDTO;
  variant?: "default" | "wide" | "compact";
  priority?: boolean;
}) {
  const published = article.publishedAt ? formatDate(article.publishedAt) : "";
  /* Der Artikel speichert nur den Slug. Fuer das Badge braucht es den Namen —
     "in-eigener-sache" ist keine Beschriftung. Faellt eine Kategorie weg,
     bleibt der Slug als ehrlicher Rest stehen. */
  const categoryName = (await getCategoryNames())[article.categorySlug] ?? article.categorySlug;
  /* Beitraege speichern nur den Autorennamen. Gibt es dazu ein
     Moderatorenprofil, liefert es Bild und Verweis — sonst bleiben die
     Initialen und der Name ohne Verlinkung. */
  const author = (await getAuthorProfiles())[article.authorName];

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
            {categoryName}
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
          <AuthorAvatar name={article.authorName} image={author?.image} />
          {/* Muss ueber der Titelflaeche liegen: `.link::after` deckt die
              ganze Karte ab, sonst waere dieser Verweis nicht anklickbar. */}
          {author ? (
            <Link href={`/moderatoren/${author.slug}`} className={styles.authorLink}>
              {article.authorName}
            </Link>
          ) : (
            <span className={styles.author}>{article.authorName}</span>
          )}
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          <span>{formatReadingTime(article.readingTime)}</span>
        </footer>
      </div>
    </article>
  );
}
