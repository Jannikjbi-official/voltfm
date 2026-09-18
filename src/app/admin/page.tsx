import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/common/button-link";
import { Icon, PlusIcon, NewsIcon, EventsIcon, MicIcon, RadioIcon } from "@/lib/icons";
import { countArticlesByStatus, adminListArticles, listEvents, listHosts } from "@/services/content";
import { getRadioSnapshot } from "@/services/radio";
import { formatRelative } from "@/lib/format";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** Admin data must never be served from a cache shared between users. */
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [counts, recent, events, hosts, snapshot] = await Promise.all([
    countArticlesByStatus(),
    adminListArticles(),
    listEvents("upcoming"),
    listHosts(true),
    getRadioSnapshot(),
  ]);

  const stats = [
    { label: "Veröffentlicht", value: counts.published, href: "/admin/news?status=published", icon: NewsIcon },
    { label: "Entwürfe", value: counts.draft, href: "/admin/news?status=draft", icon: NewsIcon },
    { label: "Geplant", value: counts.scheduled, href: "/admin/news?status=scheduled", icon: NewsIcon },
    { label: "Kommende Events", value: events.length, href: "/admin/events", icon: EventsIcon },
    { label: "Moderatoren", value: hosts.length, href: "/admin/moderatoren", icon: MicIcon },
    {
      label: "Hörer gerade",
      value: snapshot.listeners ?? "—",
      href: "/admin/radio",
      icon: RadioIcon,
    },
  ];

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Übersicht</h1>
          <p className={styles.subtitle}>
            Alles Wichtige auf einen Blick — Redaktion, Termine und Sendebetrieb.
          </p>
        </div>
        <ButtonLink href="/admin/news/new" variant="primary" mode="filled" size="md">
          <Icon icon={PlusIcon} />
          Neuer Artikel
        </ButtonLink>
      </header>

      <div className={styles.stats}>
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className={styles.stat}>
            <Icon icon={stat.icon} className={styles.statIcon} />
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </Link>
        ))}
      </div>

      <section className={styles.panel} aria-labelledby="onair-title">
        <h2 id="onair-title" className={styles.panelTitle}>
          Sendebetrieb
        </h2>
        <dl className={styles.onAir}>
          <div className={styles.onAirRow}>
            <dt>Aktueller Titel</dt>
            <dd>
              {snapshot.nowPlaying
                ? `${snapshot.nowPlaying.artist} — ${snapshot.nowPlaying.title}`
                : "Keine Metadaten"}
            </dd>
          </div>
          <div className={styles.onAirRow}>
            <dt>Sendung</dt>
            <dd>{snapshot.currentShow?.name ?? "—"}</dd>
          </div>
          <div className={styles.onAirRow}>
            <dt>Als Nächstes</dt>
            <dd>{snapshot.nextShow?.name ?? "—"}</dd>
          </div>
          <div className={styles.onAirRow}>
            <dt>Systemstatus</dt>
            <dd>
              <span className={snapshot.degraded ? styles.statusWarn : styles.statusOk}>
                {snapshot.degraded ? "Metadaten gestört" : "Alles in Ordnung"}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className={styles.panel} aria-labelledby="recent-title">
        <div className={styles.panelHead}>
          <h2 id="recent-title" className={styles.panelTitle}>
            Zuletzt bearbeitet
          </h2>
          <ButtonLink href="/admin/news" variant="neutral" mode="ghost" size="sm">
            Alle Artikel
          </ButtonLink>
        </div>

        {recent.length === 0 ? (
          <p className={styles.empty}>Noch keine Artikel angelegt.</p>
        ) : (
          <ul className={styles.recent} role="list">
            {recent.slice(0, 8).map((article) => (
              <li key={article.id}>
                <Link href={`/admin/news/${article.id}`} className={styles.recentLink}>
                  <span className={styles.recentTitle}>{article.title}</span>
                  <span className={styles.recentMeta}>
                    <span className={styles.status} data-status={article.status}>
                      {article.status}
                    </span>
                    {formatRelative(article.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
