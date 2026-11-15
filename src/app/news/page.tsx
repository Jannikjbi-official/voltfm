import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { chipVariants, cn } from "@heroui/react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { ArticleCard } from "@/components/news/article-card";
import { ButtonLink } from "@/components/common/button-link";
import { ArticleCover } from "@/components/news/article-cover";
import { formatDate, formatReadingTime } from "@/lib/format";
import {
  listArticles,
  listCategories,
  getFeaturedArticle,
  countArticlesByCategory,
  getAuthorProfiles,
} from "@/services/content";

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
    // Der Aufmacher gehoert nur auf die ungefilterte erste Seite.
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
    <>
      <PageHeader
        size="large"
        title={activeCategory ? activeCategory.name : "News"}
        description={
          activeCategory?.description ??
          "Was bei VoltFM passiert — im Sender, in der Musik und in der Community."
        }
        aside={
          total > 0 ? (
            <p className="text-sm text-muted">
              <span className="font-display text-3xl text-foreground">{total}</span>{" "}
              {total === 1 ? "Beitrag" : "Beiträge"}
              {activeCategory ? ` in ${activeCategory.name}` : ""}
            </p>
          ) : undefined
        }
      />

      {/* --- Filter ---------------------------------------------------------- */}
      {visibleCategories.length > 0 && (
        <div className="border-b border-separator">
          <nav aria-label="Kategorien" className="shell">
            <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 py-4 [scrollbar-width:none]">
              <li className="shrink-0">
                <FilterLink href="/news" active={!kategorie} label="Alle" count={total} />
              </li>
              {visibleCategories.map((category) => (
                <li key={category.id} className="shrink-0">
                  <FilterLink
                    href={`/news?kategorie=${category.slug}`}
                    active={kategorie === category.slug}
                    label={category.name}
                    count={counts[category.slug] ?? 0}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <section className="shell py-12 sm:py-16">
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
                <ButtonLink href="/news" size="sm">
                  Alle Artikel ansehen
                </ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* --- Aufmacher -------------------------------------------------- */}
            {featured && (
              <article className="group relative grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-12">
                <Link
                  href={`/news/${featured.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="relative block aspect-[16/10] overflow-hidden rounded-2xl bg-surface-secondary"
                >
                  {featured.coverImage ? (
                    <Image
                      src={featured.coverImage}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 720px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      priority
                    />
                  ) : (
                    <ArticleCover
                      categorySlug={featured.categorySlug}
                      categoryName={categoryNames[featured.categorySlug] ?? featured.categorySlug}
                      label={featured.coverLabel}
                    />
                  )}
                </Link>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                    <span
                      className={chipVariants({ color: "accent", variant: "soft", size: "sm" }).base()}
                    >
                      {categoryNames[featured.categorySlug] ?? featured.categorySlug}
                    </span>
                    {featured.publishedAt && (
                      <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
                    )}
                    <span>{formatReadingTime(featured.readingTime)}</span>
                  </div>

                  <h2 className="font-display text-[2rem] leading-[1.02] text-balance text-foreground sm:text-[2.5rem] lg:text-[2.75rem]">
                    <Link
                      href={`/news/${featured.slug}`}
                      className="rounded-sm decoration-accent-text decoration-[3px] underline-offset-[6px] after:absolute after:inset-0 group-hover:underline"
                    >
                      {featured.title}
                    </Link>
                  </h2>

                  <p className="text-lg leading-relaxed text-pretty text-muted">{featured.excerpt}</p>

                  {/* Muss ueber der Titelflaeche liegen: Der Titel-Link deckt
                      den ganzen Aufmacher ab. */}
                  <p className="text-sm text-muted">
                    von{" "}
                    {featuredAuthor ? (
                      <Link
                        href={`/moderatoren/${featuredAuthor.slug}`}
                        className="relative z-10 rounded-sm font-semibold text-foreground hover:underline"
                      >
                        {featured.authorName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-foreground">{featured.authorName}</span>
                    )}
                  </p>
                </div>
              </article>
            )}

            {/* --- Raster ----------------------------------------------------- */}
            {gridItems.length > 0 && (
              <div className={cn(featured && "mt-16 border-t border-separator pt-12 sm:mt-20")}>
                {featured && (
                  <h2 className="mb-8 font-wide text-xl font-bold text-foreground">
                    Weitere Beiträge
                  </h2>
                )}
                <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {gridItems.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}

            {/* --- Blaettern -------------------------------------------------- */}
            {pages > 1 && (
              <nav
                aria-label="Seitennavigation"
                className="mt-16 flex items-center justify-between gap-4 border-t border-separator pt-8"
              >
                {page > 1 ? (
                  <ButtonLink href={buildHref(kategorie, page - 1)} variant="outline" size="sm">
                    Zurück
                  </ButtonLink>
                ) : (
                  <span />
                )}

                <p className="text-sm text-muted">
                  Seite {page} von {pages}
                </p>

                {page < pages ? (
                  <ButtonLink href={buildHref(kategorie, page + 1)} variant="outline" size="sm">
                    Weiter
                  </ButtonLink>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}

/** Ein Filter in der Kategorienleiste — der aktive in Vordergrundfarbe. */
function FilterLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted hover:border-[color-mix(in_oklab,var(--foreground)_30%,transparent)] hover:text-foreground",
      )}
    >
      {label}
      <span className={cn("text-xs tabular-nums", active ? "opacity-70" : "opacity-80")}>{count}</span>
    </Link>
  );
}
