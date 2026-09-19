import type { Metadata } from "next";

import { RadioHero } from "@/components/radio/radio-hero";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { ArticleCard } from "@/components/news/article-card";
import { HostCard } from "@/components/common/host-card";
import { EventCard } from "@/components/events/event-card";
import { ButtonLink } from "@/components/common/button-link";
import { Badge } from "@/components/ui/badge";

import { getFeaturedArticle, getLatestArticles, listEvents, listHosts } from "@/services/content";
import { getSchedule, groupByWeekday, WEEKDAY_LABELS } from "@/services/radio/schedule";
import { getLastSongs } from "@/services/radio/metadata";
import { features } from "@/lib/site";
import { formatTime } from "@/lib/format";
import { getStationInfo } from "@/services/radio/metadata";
import { site } from "@/lib/site";
import { Icon, ArrowRightIcon, DiscordIcon, MusicIcon } from "@/lib/icons";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
};

/** Revalidate hourly; the live parts of the page fetch on their own schedule. */
export const revalidate = 3600;

export default async function HomePage() {
  const [featured, latest, hosts, events, schedule, station, history] = await Promise.all([
    getFeaturedArticle(),
    getLatestArticles(5),
    listHosts(),
    listEvents("upcoming"),
    getSchedule(),
    getStationInfo(),
    // Nur geholt, wenn sie auch gezeigt wird.
    features.schedule ? Promise.resolve([]) : getLastSongs(6),
  ]);

  // The featured article leads the news section, so keep it out of the grid.
  const gridArticles = latest.filter((a) => a.slug !== featured?.slug).slice(0, 3);

  const today = new Date().getDay();
  const todaySlots = groupByWeekday(schedule).find((d) => d.weekday === today)?.slots ?? [];

  return (
    <>
      <RadioHero />

      {/* --- Station facts: a thin editorial strip, not a card row --------- */}
      <section className={styles.facts} aria-label="VoltFM in Zahlen">
        <div className="shell">
          <dl className={styles.factsRow}>
            <div className={styles.factsItem}>
              <dt>Sendebetrieb</dt>
              <dd>24 / 7</dd>
            </div>
            <div className={styles.factsItem}>
              <dt>Zuhause in</dt>
              <dd>Hamburg</dd>
            </div>
            <div className={styles.factsItem}>
              <dt>Feste Sendungen</dt>
              <dd>{schedule.length > 0 ? schedule.length : "6"}</dd>
            </div>
            <div className={styles.factsItem}>
              <dt>Genres</dt>
              <dd>{station?.genres.slice(0, 3).join(", ") || "Pop, Dance, Deutschpop"}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* --- News: magazine layout, lead + column ------------------------- */}
      <section className="section shell">
        <SectionHeader
          eyebrow="Aktuelles"
          title="News aus dem Sender"
          description="Programmänderungen, Blicke hinter die Kulissen und was in der Community passiert."
          action={{ href: "/news", label: "Alle News" }}
        />

        {featured ? (
          <div className={styles.newsLayout}>
            <div className={styles.newsLead}>
              <ArticleCard article={featured} variant="wide" priority />
            </div>
            <div className={styles.newsColumn}>
              {gridArticles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Noch keine Artikel veröffentlicht"
            description="Sobald die Redaktion den ersten Beitrag freigibt, erscheint er hier."
          />
        )}
      </section>

      {/* --- Zuletzt gespielt bzw. Sendeplan ------------------------------ */}
      {features.schedule ? (
        <section className={styles.programme}>
          <div className="shell">
            <SectionHeader
              eyebrow="Sendeplan"
              title="Heute auf Sendung"
              description="Der Sendeplan kommt direkt von laut.fm und ist damit immer aktuell."
              action={{ href: "/programm", label: "Ganze Woche" }}
            />

            {todaySlots.length > 0 ? (
              <ol className={styles.timeline} role="list">
                {todaySlots.map((slot) => (
                  <li key={`${slot.id}-${slot.startHour}`} className={styles.timelineItem}>
                    <span className={styles.timelineTime}>
                      {String(slot.startHour).padStart(2, "0")}:00
                    </span>
                    <span className={styles.timelineDot} aria-hidden="true" />
                    <div className={styles.timelineBody}>
                      <h3 className={styles.timelineTitle}>{slot.name}</h3>
                      {slot.description && (
                        <p className={styles.timelineDescription}>{slot.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState
                title={`Für ${WEEKDAY_LABELS[today]} liegt kein Sendeplan vor`}
                description="Die Musik läuft trotzdem durchgehend — schalte einfach ein."
                action={
                  <ButtonLink href="/radio" variant="primary" mode="filled" size="sm">
                    Zum Player
                  </ButtonLink>
                }
              />
            )}
          </div>
        </section>
      ) : (
        /* Solange der Sendeplan ruht, waere hier nur ein leerer Kasten. Die
           Titelhistorie ist echte, immer gefuellte Information — und zeigt
           genau das, was der Sendeplan nicht kann: was tatsaechlich lief. */
        history.length > 0 && (
          <section className={styles.programme}>
            <div className="shell">
              <SectionHeader
                eyebrow="Zuletzt gespielt"
                title="Was gerade lief"
                description="Die letzten Titel aus unserem Programm, direkt von laut.fm."
                action={{ href: "/radio", label: "Zum Player" }}
              />

              <ol className={styles.tracks} role="list">
                {history.map((track) => (
                  <li key={`${track.id}-${track.startedAt}`} className={styles.track}>
                    <span className={styles.trackTime}>
                      {track.startedAt ? formatTime(track.startedAt) : "—"}
                    </span>
                    <span className={styles.trackDot} aria-hidden="true" />
                    <div className={styles.trackBody}>
                      <h3 className={styles.trackTitle}>{track.title}</h3>
                      <p className={styles.trackArtist}>{track.artist}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )
      )}

      {/* --- Hosts: portrait grid ---------------------------------------- */}
      <section className="section shell">
        <SectionHeader
          eyebrow="Die Stimmen"
          title="Unsere Moderatorinnen und Moderatoren"
          description="Vier Menschen, sechs Sendungen und ein gemeinsamer Anspruch: Radio, dem man anhört, dass jemand da ist."
          action={{ href: "/moderatoren", label: "Alle Moderatoren" }}
        />

        {hosts.length > 0 ? (
          <div className={styles.hostGrid}>
            {hosts.slice(0, 4).map((host) => (
              <HostCard key={host.id} host={host} />
            ))}
          </div>
        ) : (
          <EmptyState title="Noch keine Profile hinterlegt" />
        )}
      </section>

      {/* --- Events + Community: split layout ----------------------------- */}
      <section className={styles.split}>
        <div className="shell">
          <div className={styles.splitGrid}>
            <div>
              <SectionHeader
                eyebrow="Termine"
                title="Kommende Events"
                action={{ href: "/events", label: "Alle Events" }}
              />
              {events.length > 0 ? (
                <div className={styles.eventList}>
                  {events.slice(0, 3).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Aktuell sind keine Events geplant"
                  description="Neue Termine kündigen wir zuerst im Discord an."
                />
              )}
            </div>

            <aside className={styles.community}>
              <Badge mode="lighter" size="sm">
                Community
              </Badge>
              <h2 className={styles.communityTitle}>
                Radio wird erst mit euch zu VoltFM.
              </h2>
              <p className={styles.communityText}>
                Im Discord laufen Songwünsche, Feedback und die Planung der
                nächsten Sendungen zusammen. Wer mitreden will, ist in zwei
                Klicks dabei — ohne Anmeldung auf der Website.
              </p>
              <ul className={styles.communityList} role="list">
                <li>Songwünsche direkt an die Redaktion</li>
                <li>Live-Chat während der Sendungen</li>
                <li>Monatliche Community-Abende</li>
              </ul>
              <div className={styles.communityActions}>
                <ButtonLink href={site.discordUrl} external variant="primary" mode="filled" size="md">
                  <Icon icon={DiscordIcon} />
                  Discord beitreten
                </ButtonLink>
                <ButtonLink href="/community" variant="neutral" mode="ghost" size="md">
                  Mehr zur Community
                  <Icon icon={ArrowRightIcon} />
                </ButtonLink>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* --- About: full-width editorial band ----------------------------- */}
      <section className={styles.about}>
        <div className="shell">
          <div className={styles.aboutInner}>
            <Icon
              icon={MusicIcon}
              className={styles.aboutIcon}
            />
            <p className={styles.aboutQuote}>
              {station?.format || "VoltFM – Dein Klang. Deine Welt."}
            </p>
            <p className={styles.aboutText}>
              Was 2021 als Experiment in einem Jugendzimmer in Hamburg begann,
              ist heute ein Sender mit festem Programm, eigener Redaktion und
              einer Community, die ihn trägt.
            </p>
            <ButtonLink href="/ueber-uns" variant="neutral" mode="stroke" size="md">
              Die ganze Geschichte
              <Icon icon={ArrowRightIcon} />
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
