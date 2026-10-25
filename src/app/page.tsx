import type { Metadata } from "next";

import { RadioHero } from "@/components/radio/radio-hero";
import { RadioAidBanner } from "@/components/radioaid/radioaid-banner";
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
import { formatDayMonth, formatTime } from "@/lib/format";
import { radioaid, getRadioAidSchedule } from "@/lib/radioaid";
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
  const aid = getRadioAidSchedule();
  const todaySlots = groupByWeekday(schedule).find((d) => d.weekday === today)?.slots ?? [];

  return (
    <>
      {/* Verschwindet nach dem Sendeende von selbst — auf dem Server beim
          naechsten Neubau, im offenen Tab sofort. */}
      {aid.phase !== "over" && (
        <RadioAidBanner
          start={aid.start.getTime()}
          end={aid.end.getTime()}
          initialPhase={aid.phase}
          organisation={radioaid.organisation}
          donateUrl={radioaid.donateUrl}
          dateLabel={`${formatDayMonth(aid.start)}, ${formatTime(aid.start)} Uhr`}
        />
      )}

      <RadioHero />

      {/* --- Station facts: a thin editorial strip, not a card row --------- */}
      {/* Nur, was stimmt. Die Zahl der laut.fm-Playlistplaetze stand hier
          frueher als "Feste Sendungen" — das sind keine Sendungen. */}
      <section className={styles.facts} aria-label="VoltFM in Zahlen">
        <div className="shell">
          <dl className={styles.factsRow}>
            <div className={styles.factsItem}>
              <dt>Sendebetrieb</dt>
              <dd>24 / 7</dd>
            </div>
            <div className={styles.factsItem}>
              <dt>Seit</dt>
              <dd>{site.foundedYear}</dd>
            </div>
            <div className={styles.factsItem}>
              <dt>Am Mikrofon</dt>
              <dd>{hosts.length}</dd>
            </div>
            <div className={styles.factsItem}>
              <dt>Aus</dt>
              <dd>Hamburg</dd>
            </div>
            <div className={styles.factsItem}>
              <dt>Musik</dt>
              <dd>{site.genres.join(", ")}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* --- News: magazine layout, lead + column ------------------------- */}
      <section className="section shell">
        <SectionHeader
          eyebrow="Aktuelles"
          title="News aus dem Sender"
          description="Was sich bei VoltFM tut, und warum."
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
          eyebrow="Das Team"
          title="Die zwei hinter VoltFM"
          description="Jannik und Mochiko haben den Sender gegründet und machen ihn bis heute."
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
                Am schnellsten erreichst du uns im Discord.
              </h2>
              <p className={styles.communityText}>
                Da kündigen wir alles zuerst an, und da lesen wir, was dir gefällt
                oder fehlt. Zwei Klicks, kein Konto auf dieser Seite.
              </p>
              <ul className={styles.communityList} role="list">
                <li>Ankündigungen, bevor sie hier stehen</li>
                <li>Feedback direkt an uns zwei</li>
                <li>Ein Ticket statt einer E-Mail</li>
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
              2021 eine laut.fm-Station, ein paar Namen später VoltFM. Kein
              festes Programm, keine Redaktion, dafür zwei Leute, die
              weitermachen.
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
