import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ArticleCard } from "@/components/news/article-card";
import { ButtonLink } from "@/components/common/button-link";
import { listArticles, listCategories, getFeaturedArticle } from "@/services/content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "News",
  description:
    "Aktuelles von VoltFM: Programmänderungen, Musik, Community und Blicke hinter die Kulissen.",
  alternates: { canonical: "/news" },
};

export const revalidate = 300;

const PER_PAGE = 9;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ kategorie?: string; seite?: string }>;
}) {
  const { kategorie, seite } = await searchParams;
  const page = Math.max(1, Number(seite) || 1);

  const [{ items, pages, total }, categories, featured] = await Promise.all([
    listArticles({ page, perPage: PER_PAGE, category: kategorie }),
    listCategories(),
    // The lead slot only makes sense on the unfiltered first page.
    !kategorie && page === 1 ? getFeaturedArticle() : Promise.resolve(null),
  ]);

  const activeCategory = categories.find((c) => c.slug === kategorie);
  const gridItems = featured ? items.filter((a) => a.slug !== featured.slug) : items;

  return (
    <>
      <PageHeader
        eyebrow="Redaktion"
        title={activeCategory ? activeCategory.name : "News"}
        description={
          activeCategory?.description ??
          "Was bei VoltFM passiert — im Sender, in der Musik und in der Community."
        }
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/news", label: "News" },
          ...(activeCategory
            ? [{ href: `/news?kategorie=${activeCategory.slug}`, label: activeCategory.name }]
            : []),
        ]}
        size="large"
      />

      <section className="section shell">
        {/* Category filter. Plain links, so filtering works without JS and each
            filter is its own shareable URL. */}
        {categories.length > 0 && (
          <nav className={styles.filters} aria-label="Kategorien">
            <Link
              href="/news"
              className={styles.filter}
              aria-current={!kategorie ? "page" : undefined}
            >
              Alle
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/news?kategorie=${category.slug}`}
                className={styles.filter}
                aria-current={kategorie === category.slug ? "page" : undefined}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        )}

        {items.length === 0 ? (
          <EmptyState
            title="Keine Artikel gefunden"
            description={
              activeCategory
                ? `In der Kategorie „${activeCategory.name}" ist noch nichts erschienen.`
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
            {featured && (
              <div className={styles.lead}>
                <ArticleCard article={featured} variant="wide" priority />
              </div>
            )}

            <div className={styles.grid}>
              {gridItems.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {pages > 1 && (
              <nav className={styles.pagination} aria-label="Seitennavigation">
                <div className={styles.paginationInfo}>
                  Seite {page} von {pages} · {total} Artikel
                </div>
                <div className={styles.paginationActions}>
                  {page > 1 && (
                    <ButtonLink
                      href={buildHref(kategorie, page - 1)}
                      variant="neutral"
                      mode="stroke"
                      size="sm"
                    >
                      Zurück
                    </ButtonLink>
                  )}
                  {page < pages && (
                    <ButtonLink
                      href={buildHref(kategorie, page + 1)}
                      variant="neutral"
                      mode="stroke"
                      size="sm"
                    >
                      Weiter
                    </ButtonLink>
                  )}
                </div>
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}

function buildHref(category: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (category) params.set("kategorie", category);
  if (page > 1) params.set("seite", String(page));
  const query = params.toString();
  return query ? `/news?${query}` : "/news";
}
