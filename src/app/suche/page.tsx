import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ArticleCard } from "@/components/news/article-card";
import { SearchForm } from "./search-form";
import { searchArticles, listEvents, listHosts } from "@/services/content";
import { buildPageIndex } from "@/lib/site";
import { formatDate } from "@/lib/format";
import styles from "./page.module.css";

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
        eyebrow="Suche"
        title={query ? `Suche nach „${query}"` : "Suche"}
        description={
          query
            ? `${total} ${total === 1 ? "Treffer" : "Treffer"} in News, Events, Moderatoren und Seiten.`
            : "Durchsuche News, Events, Moderatoren und alle Seiten von VoltFM."
        }
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/suche", label: "Suche" },
        ]}
      />

      <section className="section shell">
        <SearchForm initialQuery={query} />

        {!query ? (
          <EmptyState
            title="Wonach suchst du?"
            description="Gib einen Suchbegriff ein — zum Beispiel einen Sendungsnamen, einen Moderator oder ein Thema."
          />
        ) : total === 0 ? (
          <EmptyState
            title={`Keine Treffer für „${query}"`}
            description="Versuch es mit einem anderen Begriff oder schau direkt in den News vorbei."
          />
        ) : (
          <div className={styles.results}>
            {articles.length > 0 && (
              <section aria-labelledby="results-news">
                <h2 id="results-news" className={styles.groupTitle}>
                  News <span className={styles.count}>{articles.length}</span>
                </h2>
                <div className={styles.articleGrid}>
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}

            {matchedHosts.length > 0 && (
              <section aria-labelledby="results-hosts">
                <h2 id="results-hosts" className={styles.groupTitle}>
                  Moderatoren <span className={styles.count}>{matchedHosts.length}</span>
                </h2>
                <ul className={styles.linkList} role="list">
                  {matchedHosts.map((host) => (
                    <li key={host.id}>
                      <Link href={`/moderatoren/${host.slug}`} className={styles.resultLink}>
                        <span className={styles.resultTitle}>{host.name}</span>
                        <span className={styles.resultMeta}>{host.role}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {matchedEvents.length > 0 && (
              <section aria-labelledby="results-events">
                <h2 id="results-events" className={styles.groupTitle}>
                  Events <span className={styles.count}>{matchedEvents.length}</span>
                </h2>
                <ul className={styles.linkList} role="list">
                  {matchedEvents.map((event) => (
                    <li key={event.id}>
                      <Link href={`/events/${event.slug}`} className={styles.resultLink}>
                        <span className={styles.resultTitle}>{event.title}</span>
                        <span className={styles.resultMeta}>
                          {formatDate(event.startsAt)} · {event.location}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {matchedPages.length > 0 && (
              <section aria-labelledby="results-pages">
                <h2 id="results-pages" className={styles.groupTitle}>
                  Seiten <span className={styles.count}>{matchedPages.length}</span>
                </h2>
                <ul className={styles.linkList} role="list">
                  {matchedPages.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={styles.resultLink}>
                        <span className={styles.resultTitle}>{item.label}</span>
                        {item.hint && <span className={styles.resultMeta}>{item.hint}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </section>
    </>
  );
}
