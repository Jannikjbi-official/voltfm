import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ArticleCard } from "@/components/news/article-card";
import { SearchForm } from "./search-form";
import { searchArticles, listEvents, listHosts } from "@/services/content";
import { buildPageIndex } from "@/lib/site";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Suche",
  description: "Durchsuche News, Events, Moderatoren und alle Seiten von VoltFM.",
  alternates: { canonical: "/suche" },
  robots: { index: false, follow: true },
};

export default async function SuchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  // Articles use a Mongo text index; the other collections are small enough
  // that filtering them in memory is cheaper than maintaining more indexes.
  const [articles, events, hosts] = query
    ? await Promise.all([searchArticles(query, 12), listEvents("all"), listHosts()])
    : [[], [], []];

  const needle = query.toLowerCase();
  const matchedEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(needle) ||
      event.description.toLowerCase().includes(needle),
  );
  const matchedHosts = hosts.filter(
    (host) =>
      host.name.toLowerCase().includes(needle) ||
      host.role.toLowerCase().includes(needle) ||
      host.bio.toLowerCase().includes(needle),
  );
  const matchedPages = query
    ? buildPageIndex().filter(
        (item) =>
          item.label.toLowerCase().includes(needle) ||
          item.hint?.toLowerCase().includes(needle),
      )
    : [];

  const total =
    articles.length + matchedEvents.length + matchedHosts.length + matchedPages.length;

  return (
    <>
      <PageHeader
        title={query ? `Suche nach „${query}“` : "Suche"}
        description={
          query
            ? `${total} Treffer in News, Events, Moderatoren und Seiten.`
            : "Durchsuche News, Events, Moderatoren und alle Seiten von VoltFM."
        }
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/suche", label: "Suche" },
        ]}
      />

      <section className="shell">
        <SearchForm initialQuery={query} />

        <div className="mt-10">
          {!query ? (
            <EmptyState
              title="Wonach suchst du?"
              description="Gib einen Suchbegriff ein — zum Beispiel einen Sendungsnamen, einen Moderator oder ein Thema."
            />
          ) : total === 0 ? (
            <EmptyState
              title={`Keine Treffer für „${query}“`}
              description="Versuch es mit einem anderen Begriff oder schau direkt in den News vorbei."
            />
          ) : (
            <div className="flex flex-col gap-12 sm:gap-16">
              {articles.length > 0 && (
                <section aria-labelledby="results-news">
                  <GroupTitle id="results-news" count={articles.length}>
                    News
                  </GroupTitle>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              )}

              {matchedHosts.length > 0 && (
                <section aria-labelledby="results-hosts">
                  <GroupTitle id="results-hosts" count={matchedHosts.length}>
                    Moderatoren
                  </GroupTitle>
                  <ResultList>
                    {matchedHosts.map((host) => (
                      <ResultLink
                        key={host.id}
                        href={`/moderatoren/${host.slug}`}
                        title={host.name}
                        meta={[host.role]}
                      />
                    ))}
                  </ResultList>
                </section>
              )}

              {matchedEvents.length > 0 && (
                <section aria-labelledby="results-events">
                  <GroupTitle id="results-events" count={matchedEvents.length}>
                    Events
                  </GroupTitle>
                  <ResultList>
                    {matchedEvents.map((event) => (
                      <ResultLink
                        key={event.id}
                        href={`/events/${event.slug}`}
                        title={event.title}
                        meta={[formatDate(event.startsAt), event.location]}
                      />
                    ))}
                  </ResultList>
                </section>
              )}

              {matchedPages.length > 0 && (
                <section aria-labelledby="results-pages">
                  <GroupTitle id="results-pages" count={matchedPages.length}>
                    Seiten
                  </GroupTitle>
                  <ResultList>
                    {matchedPages.map((item) => (
                      <ResultLink
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        meta={item.hint ? [item.hint] : []}
                      />
                    ))}
                  </ResultList>
                </section>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function GroupTitle({ id, count, children }: { id: string; count: number; children: string }) {
  return (
    <h2 id={id} className="mb-5 flex items-center gap-3 font-display text-[1.75rem] text-foreground sm:text-4xl">
      {children}
      <span className="rounded-full bg-default px-3 py-1 font-mono text-sm font-semibold tracking-normal text-foreground">
        {count}
      </span>
    </h2>
  );
}

function ResultList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </ul>
  );
}

/** Ein Treffer. Mehrere Angaben stehen nebeneinander, getrennt durch Abstand. */
function ResultLink({ href, title, meta }: { href: string; title: string; meta: string[] }) {
  return (
    <li>
      <Link
        href={href}
        className="surface-card hover-lift flex h-full flex-col gap-1.5 rounded-3xl p-5 sm:p-6"
      >
        <span className="text-lg font-bold tracking-tight text-foreground">{title}</span>
        {meta.filter(Boolean).length > 0 && (
          <span className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted">
            {meta.filter(Boolean).map((part) => (
              <span key={part}>{part}</span>
            ))}
          </span>
        )}
      </Link>
    </li>
  );
}
