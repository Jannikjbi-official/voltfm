import Link from "next/link";
import Image from "next/image";
import { chipVariants, cn } from "@heroui/react";
import { AuthorAvatar } from "@/components/news/author-avatar";
import { getCategoryNames, getAuthorProfiles, type ArticleDTO } from "@/services/content";
import { formatDate, formatReadingTime } from "@/lib/format";
import { ArticleCover } from "@/components/news/article-cover";

/**
 * Der Artikel-Teaser, in drei Dichten.
 *
 *   default — das Arbeitspferd im Raster, Bild oben
 *   wide    — der Aufmacher: grosses Bild, Titel in Ueberschriftengroesse
 *   compact — Textzeile fuer Spalten und "Weiterlesen"
 *
 * Kein Kasten um jede Karte: Was die Teaser zusammenhaelt, ist das Raster und
 * die einheitliche Bildkante. Die ganze Karte ist ueber den Titel-Link
 * klickbar (`after:absolute`); Kategorie und Autor liegen darueber (z-10).
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
  /* Der Artikel speichert nur den Slug. Fuer das Etikett braucht es den
     Namen — "in-eigener-sache" ist keine Beschriftung. Faellt eine Kategorie
     weg, bleibt der Slug als ehrlicher Rest stehen. */
  const categoryName = (await getCategoryNames())[article.categorySlug] ?? article.categorySlug;
  /* Beitraege speichern nur den Autorennamen. Gibt es dazu ein
     Moderatorenprofil, liefert es Bild und Verweis — sonst bleiben die
     Initialen und der Name ohne Verlinkung. */
  const author = (await getAuthorProfiles())[article.authorName];

  const wide = variant === "wide";
  const compact = variant === "compact";

  return (
    <article
      className={cn(
        "group relative flex flex-col",
        wide ? "gap-6" : "gap-4",
        compact && "border-t border-separator py-5 first:border-t-0 first:pt-0",
      )}
    >
      {!compact && (
        <Link
          href={`/news/${article.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className={cn(
            "relative block overflow-hidden rounded-xl bg-surface-secondary",
            wide ? "aspect-video" : "aspect-[16/10]",
          )}
        >
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt=""
              fill
              sizes={wide ? "(max-width: 900px) 100vw, 60vw" : "(max-width: 900px) 100vw, 33vw"}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              preload={priority}
            />
          ) : (
            // Kein eigenes Bild: das Titelbild der Kategorie, damit das Raster
            // keine Luecke bekommt.
            <ArticleCover
              categorySlug={article.categorySlug}
              categoryName={categoryName}
              label={article.coverLabel}
            />
          )}
        </Link>
      )}

      <div className={cn("flex flex-col", compact ? "gap-2" : "gap-3")}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <Link
            href={`/news?kategorie=${article.categorySlug}`}
            className={cn(
              chipVariants({ color: "accent", variant: "soft", size: "sm" }).base(),
              "relative z-10 font-semibold before:absolute before:-inset-1.5 hover:underline",
            )}
          >
            {categoryName}
          </Link>
          <time dateTime={article.publishedAt ?? undefined}>{published}</time>
        </div>

        <h3
          className={cn(
            "text-balance text-foreground",
            wide
              ? "font-display text-[1.75rem] leading-[1.05] sm:text-4xl"
              : "font-wide text-lg leading-snug font-bold",
          )}
        >
          <Link
            href={`/news/${article.slug}`}
            className="rounded-sm decoration-accent-text decoration-2 underline-offset-4 after:absolute after:inset-0 group-hover:underline"
          >
            {article.title}
          </Link>
        </h3>

        <p
          className={cn(
            "text-pretty text-muted",
            wide ? "line-clamp-3 text-lg leading-relaxed" : "text-sm leading-relaxed",
            compact ? "line-clamp-2" : !wide && "line-clamp-3",
          )}
        >
          {article.excerpt}
        </p>

        <footer className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <AuthorAvatar name={article.authorName} image={author?.image} />
            {author ? (
              /* Muss ueber der Titelflaeche liegen, sonst faengt der
                 Titel-Link den Klick ab und man landet im Beitrag. */
              <Link
                href={`/moderatoren/${author.slug}`}
                className="relative z-10 rounded-sm font-semibold text-foreground before:absolute before:-inset-1.5 hover:underline"
              >
                {article.authorName}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">{article.authorName}</span>
            )}
          </span>
          <span>{formatReadingTime(article.readingTime)}</span>
        </footer>
      </div>
    </article>
  );
}
