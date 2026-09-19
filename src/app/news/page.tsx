import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { EmptyState } from "@/components/common/empty-state";
import { ArticleCard } from "@/components/news/article-card";
import { ButtonLink } from "@/components/common/button-link";
import { ImagePlaceholder } from "@/components/common/image-placeholder";
import { Icon, ArrowRightIcon, ArrowLeftIcon } from "@/lib/icons";
import { formatDate, formatReadingTime } from "@/lib/format";
import {
  listArticles,
  listCategories,
  getFeaturedArticle,
  countArticlesByCategory,
  getAuthorProfiles,
} from "@/services/content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "News",
  description:
    "Aktuelles von VoltFM: Programmänderungen, Musik, Community und Blicke hinter die Kulissen.",
  alternates: { canonical: "/news" },
};

export const revalidate = 300;

const PER_PAGE = 9;

function buildHref(category: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (category) params.set("kategorie", category);
  if (page > 1) params.set("seite", String(page));
  const query = params.toString();
  return query ? `/news?${query}` : "/news";
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ kategorie?: string; seite?: string }>;
}) {
  const { kategorie, seite } = await searchParams;
  const page = Math.max(1, Number(seite) || 1);

  const [{ items, pages, total }, categories, featured, counts] = await Promise.all([
    listArticles({ page, perPage: PER_PAGE, category: kategorie }),
    listCategories(),
    // The lead slot only makes sense on the unfiltered first page.
    !kategorie && page === 1 ? getFeaturedArticle() : Promise.resolve(null),
    countArticlesByCategory(),
  ]);

  const activeCategory = categories.find((c) => c.slug === kategorie);
  const gridItems = featured ? items.filter((a) => a.slug !== featured.slug) : items;
  const categoryNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const authors = await getAuthorProfiles();
  const featuredAuthor = featured ? authors[featured.authorName] : undefined;

  /* Leere Kategorien gehören nicht in die Filterleiste: Ein Filter, der
     garantiert nichts findet, ist eine Sackgasse. Die gerade aktive bleibt
     drin, sonst verschwände sie unter den eigenen Füßen. */
  const visibleCategories = categories.filter(
    (c) => (counts[c.slug] ?? 0) > 0 || c.slug === kategorie,
  );

  return (
    <div className={styles.page}>
      {/* --- Kopf ---------------------------------------------------------- */}
      <header className={styles.masthead}>
        <div className="shell">
          <div className={styles.mastheadTop}>
            <p className={styles.kicker}>
              <span className={styles.kickerDot} aria-hidden="true" />
              Redaktion
            </p>
            {total > 0 && (
              <p className={styles.count}>
                {total} {total === 1 ? "Beitrag" : "Beiträge"}
                {activeCategory ? ` in ${activeCategory.name}` : ""}
              </p>
            )}
          </div>

          <h1 className={styles.title}>{activeCategory ? activeCategory.name : "News"}</h1>

          <p className={styles.lead}>
            {activeCategory?.description ??
              "Was bei VoltFM passiert — im Sender, in der Musik und in der Community."}
          </p>
        </div>
      </header>

      {/* --- Filter -------------------------------------------------------- */}
      {visibleCategories.length > 0 && (
        <div className={styles.filterBar}>
          <div className="shell">
            <nav className={styles.filters} aria-label="Kategorien">
              <Link
                href="/news"
                className={styles.filter}
                aria-current={!kategorie ? "page" : undefined}
              >
                Alle
                <span className={styles.filterCount}>{total}</span>
              </Link>
              {visibleCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/news?kategorie=${category.slug}`}
                  className={styles.filter}
                  aria-current={kategorie === category.slug ? "page" : undefined}
                >
                  {category.name}
                  <span className={styles.filterCount}>{counts[category.slug] ?? 0}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <section className="section shell">
        {items.length === 0 ? (
          <EmptyState
            title="Keine Artikel gefunden"
            description={
              activeCategory
                ? `In der Kategorie „${activeCategory.name}“ ist noch nichts erschienen.`
                : "Sobald die Redaktion den ersten Beitrag freigibt, erscheint er hier."
            }
            action={
              activeCategory ? (
                <ButtonLink href="/news" variant="primary" mode="filled" size="sm">
                  Alle Artikel ansehen
                </ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* --- Aufmacher ------------------------------------------------ */}
            {featured && (
              <article className={styles.hero}>
                <Link href={`/news/${featured.slug}`} className={styles.heroMedia} tabIndex={-1} aria-hidden="true">
                  {featured.coverImage ? (
                    <Image
                      src={featured.coverImage}
                      alt=""
                      fill
                      sizes="(max-width: 900px) 100vw, 1200px"
                      className={styles.heroImage}
                      priority
                    />
                  ) : (
                    <ImagePlaceholder label={featured.title} ratio="16 / 9" />
                  )}
                </Link>

                <div className={styles.heroBody}>
                  <div className={styles.heroMeta}>
                    <span className={styles.heroBadge}>
                      {categoryNames[featured.categorySlug] ?? featured.categorySlug}
                    </span>
                    {featured.publishedAt && (
                      <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{formatReadingTime(featured.readingTime)}</span>
                  </div>

                  <h2 className={styles.heroTitle}>
                    <Link href={`/news/${featured.slug}`} className={styles.heroLink}>
                      {featured.title}
                    </Link>
                  </h2>

                  <p className={styles.heroExcerpt}>{featured.excerpt}</p>

                  {/* Muss ueber der Titelflaeche liegen: `.heroLink::after`
                      deckt den ganzen Aufmacher ab. */}
                  <p className={styles.heroAuthor}>
                    von{" "}
                    {featuredAuthor ? (
                      <Link
                        href={`/moderatoren/${featuredAuthor.slug}`}
                        className={styles.heroAuthorLink}
                      >
                        {featured.authorName}
                      </Link>
                    ) : (
                      <span>{featured.authorName}</span>
                    )}
                  </p>

                  <span className={styles.heroCta}>
                    Weiterlesen
                    <Icon icon={ArrowRightIcon} />
                  </span>
                </div>
              </article>
            )}

            {/* --- Raster --------------------------------------------------- */}
            {gridItems.length > 0 && (
              <>
                {featured && (
                  <h2 className={styles.sectionLabel}>
                    <span>Weitere Beiträge</span>
                  </h2>
                )}
                <div className={styles.grid}>
                  {gridItems.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </>
            )}

            {/* --- Blättern ------------------------------------------------- */}
            {pages > 1 && (
              <nav className={styles.pagination} aria-label="Seitennavigation">
                {page > 1 ? (
                  <ButtonLink
                    href={buildHref(kategorie, page - 1)}
                    variant="neutral"
                    mode="stroke"
                    size="sm"
                  >
                    <Icon icon={ArrowLeftIcon} />
                    Zurück
                  </ButtonLink>
                ) : (
                  <span />
                )}

                <p className={styles.paginationInfo}>
                  Seite {page} von {pages}
                </p>

                {page < pages ? (
                  <ButtonLink
                    href={buildHref(kategorie, page + 1)}
                    variant="neutral"
                    mode="stroke"
                    size="sm"
                  >
                    Weiter
                    <Icon icon={ArrowRightIcon} />
                  </ButtonLink>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
