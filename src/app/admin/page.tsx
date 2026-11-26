import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@heroui/react";

import { ButtonLink } from "@/components/common/button-link";
import { Icon, PlusIcon, NewsIcon, EventsIcon, MicIcon, RadioIcon } from "@/lib/icons";
import { countArticlesByStatus, adminListArticles, listEvents, listHosts } from "@/services/content";
import { getRadioSnapshot } from "@/services/radio";
import { listSwitchOnDays } from "@/services/milestones/days";
import { formatDate, formatRelative, formatTime } from "@/lib/format";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  ArticleStatusBadge,
  StatCard,
  StatusBadge,
  Td,
  emptyWellClass,
  Th,
  trClass,
} from "@/components/admin/admin-ui";
import { SwitchOnsChart } from "@/components/admin/switch-ons-chart";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** Admin data must never be served from a cache shared between users. */
export const dynamic = "force-dynamic";

const CHART_DAYS = 30;

export default async function AdminDashboard() {
  const [counts, recent, events, hosts, snapshot, days] = await Promise.all([
    countArticlesByStatus(),
    adminListArticles(),
    listEvents("upcoming"),
    listHosts(true),
    getRadioSnapshot(),
    // Die Tageszahlen sind ein Extra: Fehlt die Datenbank-Sammlung, bleibt
    // die Uebersicht trotzdem stehen.
    listSwitchOnDays(CHART_DAYS).catch(() => []),
  ]);

  const activeHosts = hosts.filter((host) => host.active).length;
  const hiddenHosts = hosts.length - activeHosts;
  const nextEvent = events[0];
  const { nowPlaying, currentShow, nextShow } = snapshot;

  return (
    <>
      <AdminPageHeader
        title="Übersicht"
        description="Was ansteht und was gerade läuft."
        actions={
          <ButtonLink href="/admin/news/new" variant="primary">
            <Icon icon={PlusIcon} />
            Neuer Artikel
          </ButtonLink>
        }
      />

      <ul className="mb-2 grid grid-cols-2 gap-2 xl:grid-cols-4">
        <li>
          <StatCard
            accent
            label="Hörer gerade"
            value={snapshot.listeners ?? "—"}
            icon={RadioIcon}
            href="/admin/radio"
            hint={currentShow ? `Läuft: ${currentShow.name}` : snapshot.degraded ? "laut.fm antwortet nicht" : "Zahl von laut.fm"}
          />
        </li>
        <li>
          <StatCard
            label="Veröffentlicht"
            value={counts.published}
            icon={NewsIcon}
            href="/admin/news?status=published"
            hint={`${counts.draft} ${counts.draft === 1 ? "Entwurf" : "Entwürfe"}, ${counts.scheduled} geplant`}
          />
        </li>
        <li>
          <StatCard
            label="Kommende Events"
            value={events.length}
            icon={EventsIcon}
            href="/admin/events"
            hint={nextEvent ? `Nächstes am ${formatDate(nextEvent.startsAt, "short")}` : "Keins geplant"}
          />
        </li>
        <li>
          <StatCard
            label="Moderatoren"
            value={activeHosts}
            icon={MicIcon}
            href="/admin/moderatoren"
            hint={hiddenHosts > 0 ? `${hiddenHosts} versteckt` : "Alle sichtbar"}
          />
        </li>
      </ul>

      <div className="mb-2 grid grid-cols-1 items-stretch gap-2 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <AdminPanel
          title="Einschaltungen pro Tag"
          titleId="switch-ons-title"
          description={`Die letzten ${CHART_DAYS} Tage, Zahlen von laut.fm`}
        >
          {days.length === 0 ? (
            <div className="well flex flex-col items-start gap-3 rounded-[var(--radius)] px-5 py-8">
              <span aria-hidden="true" className="flex h-10 items-end gap-1">
                {[40, 65, 50, 85, 60, 100, 75].map((h, i) => (
                  <span key={i} className="w-2.5 rounded-t-[2px] bg-default" style={{ height: `${h}%` }} />
                ))}
              </span>
              <p className="font-semibold text-foreground">Noch keine Tageszahlen da.</p>
              <p className="max-w-md text-sm text-muted">
                Sie kommen mit dem täglichen Abruf bei laut.fm. Ob der eingerichtet ist, steht unter{" "}
                <Link href="/admin/settings" className="font-medium text-foreground underline underline-offset-4">
                  Einstellungen
                </Link>
                .
              </p>
            </div>
          ) : (
            <SwitchOnsChart days={days} />
          )}
        </AdminPanel>

        <AdminPanel
          title="Sendebetrieb"
          titleId="onair-title"
          action={
            <StatusBadge color={snapshot.degraded ? "warning" : "success"}>
              {snapshot.degraded ? "Metadaten gestört" : "Alles in Ordnung"}
            </StatusBadge>
          }
          bodyClassName="flex flex-col gap-5"
        >
          {/* Was laeuft, steht auf einem kleinen Display mit Pegel. */}
          <div className="display-panel display-dots flex items-center gap-4 rounded-[var(--radius)] p-4">
            <span aria-hidden="true" className="flex h-10 w-8 shrink-0 items-end justify-center gap-[3px]">
              {[0, 1, 2, 3].map((bar) => (
                <span
                  key={bar}
                  className={cn(
                    "w-1 origin-bottom rounded-[1px] bg-volt",
                    nowPlaying && "animate-[vfm-level_1.1s_ease-in-out_infinite] motion-reduce:animate-none",
                  )}
                  style={{ height: `${[55, 85, 40, 70][bar]}%`, animationDelay: `${bar * -0.27}s` }}
                />
              ))}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-meta text-display-muted">
                {nowPlaying && <span aria-hidden="true" className="led" />}
                Läuft gerade
              </p>
              <p className="mt-0.5 truncate font-bold text-display-foreground">
                {nowPlaying ? nowPlaying.title : "Keine Metadaten"}
              </p>
              {nowPlaying && <p className="truncate text-sm text-display-muted">{nowPlaying.artist}</p>}
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <dt className="font-meta text-muted">Sendung</dt>
              <dd className="mt-0.5 truncate text-sm font-semibold text-foreground">{currentShow?.name ?? "—"}</dd>
              {currentShow?.endsAt && (
                <dd className="font-mono text-xs text-muted">bis {formatTime(currentShow.endsAt)}</dd>
              )}
            </div>
            <div className="min-w-0">
              <dt className="font-meta text-muted">Als Nächstes</dt>
              <dd className="mt-0.5 truncate text-sm font-semibold text-foreground">{nextShow?.name ?? "—"}</dd>
              {nextShow?.startsAt && (
                <dd className="font-mono text-xs text-muted">ab {formatTime(nextShow.startsAt)}</dd>
              )}
            </div>
          </dl>

          <ButtonLink href="/admin/radio" variant="secondary" size="sm" className="self-start">
            Zum Radio
          </ButtonLink>
        </AdminPanel>
      </div>

      <section aria-labelledby="recent-title" className="pt-6">
        <div className="mb-2 flex items-center justify-between gap-4">
          <h2 id="recent-title" className="font-wide text-lg font-bold text-foreground">
            Zuletzt bearbeitet
          </h2>
          <ButtonLink href="/admin/news" variant="ghost" size="sm">
            Alle Artikel
          </ButtonLink>
        </div>

        {recent.length === 0 ? (
          <p className={emptyWellClass}>
            Noch keine Artikel angelegt.
          </p>
        ) : (
          <AdminTable>
            <thead>
              <tr>
                <Th>Titel</Th>
                <Th className="w-0">Status</Th>
                <Th className="hidden w-0 md:table-cell">Autor</Th>
                <Th className="hidden w-0 text-right sm:table-cell">Geändert</Th>
              </tr>
            </thead>
            <tbody>
              {recent.slice(0, 6).map((article) => (
                <tr key={article.id} className={trClass}>
                  <Td className="w-full max-w-0">
                    <Link
                      href={`/admin/news/${article.id}`}
                      className="block truncate font-semibold text-foreground transition-colors hover:text-accent-text"
                    >
                      {article.title}
                    </Link>
                  </Td>
                  <Td>
                    <ArticleStatusBadge status={article.status} />
                  </Td>
                  <Td className="hidden whitespace-nowrap text-muted md:table-cell">{article.authorName}</Td>
                  <Td className="hidden text-right whitespace-nowrap text-muted sm:table-cell">
                    {formatRelative(article.updatedAt)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        )}
      </section>
    </>
  );
}
