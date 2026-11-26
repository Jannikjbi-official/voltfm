import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@heroui/react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { ArticleCard } from "@/components/news/article-card";
import { ButtonLink } from "@/components/common/button-link";
import { ArticleCover } from "@/components/news/article-cover";
import { AuthorAvatar } from "@/components/news/author-avatar";
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
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/news", label: "News" },
        ]}
        aside={
          total > 0 ? (
            /* Die Zahl als kleines Display am Gehaeuse. */
            <div className="display-panel display-dots flex min-w-[9rem] flex-col gap-2 rounded-[var(--radius)] px-4 py-3">
              <span className="font-meta text-display-muted">
                {total === 1 ? "Beitrag" : "Beiträge"}
                {activeCategory ? ` in ${activeCategory.name}` : ""}
              </span>
              <span className="font-dot text-4xl leading-none text-volt">{total}</span>
            </div>
          ) : undefined
        }
      />

      {/* --- Filter ----------------------------------------------------------
          Eine Tastenreihe in einer Mulde, die am Handy waagerecht scrollt. */}
      {visibleCategories.length > 0 && (
        <nav aria-label="Kategorien" className="shell pt-2">
          <div className="surface-card flex flex-col gap-2 rounded-[var(--radius)] p-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="hidden shrink-0 pl-2 font-meta text-muted sm:block">kategorie</span>
            <ul className="well flex min-w-0 gap-1 overflow-x-auto rounded-[var(--radius)] p-1 [scrollbar-width:none]">
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
          </div>
        </nav>
      )}

      <section className="shell pt-2">
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
            {/* --- Aufmacher: Bild im Fenster links, Text rechts ------------- */}
            {featured && (
              <article className="group surface-card hover-lift relative grid gap-2 rounded-[var(--radius)] p-2 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
                <Link
                  href={`/news/${featured.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="well relative block aspect-[16/10] overflow-hidden rounded-[3px] lg:aspect-auto lg:min-h-[26rem]"
                >
                  {featured.coverImage ? (
                    <Image
                      src={featured.coverImage}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 720px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
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

                <div className="flex flex-col justify-between gap-8 px-3 pt-3 pb-4 sm:px-6 sm:pt-6 sm:pb-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-meta text-muted">aufmacher</span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {featured.publishedAt && (
                        <time className="font-mono text-xs text-muted" dateTime={featured.publishedAt}>
                          {formatDate(featured.publishedAt)}
                        </time>
                      )}
                      <span className="font-mono text-xs text-muted">{formatReadingTime(featured.readingTime)}</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-5">
                    <Link
                      href={`/news?kategorie=${featured.categorySlug}`}
                      className="relative z-10 w-fit rounded-[3px] bg-volt px-2 py-0.5 font-mono text-[0.7rem] font-semibold lowercase text-graphite before:absolute before:-inset-1.5 hover:bg-graphite hover:text-volt"
                    >
                      {categoryNames[featured.categorySlug] ?? featured.categorySlug}
                    </Link>

                    <h2 className="font-display text-[2.1rem] text-balance break-words hyphens-auto text-foreground sm:text-5xl">
                      <Link
                        href={`/news/${featured.slug}`}
                        className="transition-colors after:absolute after:inset-0 group-hover:text-accent-text"
                      >
                        {featured.title}
                      </Link>
                    </h2>

                    <p className="text-lg leading-relaxed text-pretty text-muted">{featured.excerpt}</p>
                  </div>

                  {/* Muss ueber der Titelflaeche liegen: Der Titel-Link deckt
                      den ganzen Aufmacher ab. */}
                  <p className="flex items-center gap-2 border-t border-separator pt-4 text-sm text-muted">
                    <AuthorAvatar name={featured.authorName} image={featuredAuthor?.image} />
                    <span>
                      von{" "}
                      {featuredAuthor ? (
                        <Link
                          href={`/moderatoren/${featuredAuthor.slug}`}
                          className="relative z-10 font-semibold text-foreground hover:text-accent-text"
                        >
                          {featured.authorName}
                        </Link>
                      ) : (
                        <span className="font-semibold text-foreground">{featured.authorName}</span>
                      )}
                    </span>
                  </p>
                </div>
              </article>
            )}

            {/* --- Raster ----------------------------------------------------- */}
            {gridItems.length > 0 && (
              <div className={cn(featured && "pt-12 sm:pt-16")}>
                {featured && (
                  <h2 className="mb-6 border-b border-border pb-5 font-display text-[2.1rem] text-foreground sm:text-5xl">
                    Weitere Beiträge
                  </h2>
                )}
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
                className="surface-card mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-[var(--radius)] p-2"
              >
                <span className="justify-self-start">
                  {page > 1 && <PageKey href={buildHref(kategorie, page - 1)}>Zurück</PageKey>}
                </span>

                <p className="display-panel rounded-[3px] px-3 py-1.5 font-dot text-sm text-display-foreground">
                  <span className="sr-only">Seite </span>
                  <span className="text-volt">{page}</span>
                  <span aria-hidden="true" className="text-display-muted"> / </span>
                  <span className="sr-only"> von </span>
                  {pages}
                </p>

                <span className="justify-self-end">
                  {page < pages && <PageKey href={buildHref(kategorie, page + 1)}>Weiter</PageKey>}
                </span>
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}

/** Eine Taste zum Blaettern. */
function PageKey({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="key inline-flex items-center rounded-[var(--radius)] bg-surface px-4 py-2 font-wide text-sm font-bold text-foreground ring-1 ring-border transition-colors hover:bg-volt hover:text-graphite"
    >
      {children}
    </Link>
  );
}

/** Ein Filter in der Tastenreihe — der aktive als gelbe, gedrueckte Taste. */
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
        "inline-flex h-9 items-center gap-2 rounded-[calc(var(--radius)-2px)] px-3 font-wide text-[0.92rem] font-semibold whitespace-nowrap transition-colors",
        active ? "key bg-volt text-graphite" : "text-muted hover:bg-surface hover:text-foreground",
      )}
    >
      {label}
      <span className={cn("font-dot text-xs", active ? "text-graphite/70" : "opacity-70")}>{count}</span>
    </Link>
  );
}
