import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/common/button-link";
import { Icon, PlusIcon, NewsIcon, EventsIcon, MicIcon, RadioIcon } from "@/lib/icons";
import { countArticlesByStatus, adminListArticles, listEvents, listHosts } from "@/services/content";
import { getRadioSnapshot } from "@/services/radio";
import { formatRelative } from "@/lib/format";
import { AdminPageHeader, AdminPanel, ArticleStatusBadge, DataList, StatusBadge } from "@/components/admin/admin-ui";

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
      <AdminPageHeader
        title="Übersicht"
        description="Alles Wichtige auf einen Blick — Redaktion, Termine und Sendebetrieb."
        actions={
          <ButtonLink href="/admin/news/new" variant="primary">
            <Icon icon={PlusIcon} />
            Neuer Artikel
          </ButtonLink>
        }
      />

      <ul className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link
              href={stat.href}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-[color-mix(in_oklab,var(--foreground)_25%,transparent)] hover:bg-surface-secondary"
            >
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-lg bg-surface-secondary text-sm text-muted transition-colors group-hover:bg-volt group-hover:text-ink"
              >
                <Icon icon={stat.icon} />
              </span>
              <span className="font-display text-3xl leading-none text-foreground">{stat.value}</span>
              <span className="text-sm text-muted">{stat.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <AdminPanel title="Sendebetrieb" titleId="onair-title">
          <DataList
            rows={[
              {
                label: "Aktueller Titel",
                value: snapshot.nowPlaying
                  ? `${snapshot.nowPlaying.artist} — ${snapshot.nowPlaying.title}`
                  : "Keine Metadaten",
              },
              { label: "Sendung", value: snapshot.currentShow?.name ?? "—" },
              { label: "Als Nächstes", value: snapshot.nextShow?.name ?? "—" },
              {
                label: "Systemstatus",
                value: (
                  <StatusBadge color={snapshot.degraded ? "warning" : "success"}>
                    {snapshot.degraded ? "Metadaten gestört" : "Alles in Ordnung"}
                  </StatusBadge>
                ),
              },
            ]}
          />
        </AdminPanel>

        <AdminPanel
          title="Zuletzt bearbeitet"
          titleId="recent-title"
          action={
            <ButtonLink href="/admin/news" variant="ghost" size="sm">
              Alle Artikel
            </ButtonLink>
          }
        >
          {recent.length === 0 ? (
            <p className="text-sm text-muted">Noch keine Artikel angelegt.</p>
          ) : (
            <ul className="-mx-2 flex flex-col">
              {recent.slice(0, 8).map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/admin/news/${article.id}`}
                    className="flex flex-col gap-1.5 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface-secondary sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                      {article.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-3 text-xs text-muted">
                      <ArticleStatusBadge status={article.status} />
                      {formatRelative(article.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </>
  );
}
