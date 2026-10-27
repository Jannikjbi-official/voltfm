import type { Metadata } from "next";

import { CoverStage } from "@/components/radio/cover-stage";
import { RecentTracks } from "@/components/radio/recent-tracks";
import { RadioAidBanner } from "@/components/radioaid/radioaid-banner";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { ArticleCard } from "@/components/news/article-card";
import { HostCard } from "@/components/common/host-card";
import { EventCard } from "@/components/events/event-card";
import { ButtonLink } from "@/components/common/button-link";

import { getFeaturedArticle, getLatestArticles, listEvents, listHosts } from "@/services/content";
import { getSchedule, groupByWeekday, WEEKDAY_LABELS } from "@/services/radio/schedule";
import { features } from "@/lib/site";
import { formatDayMonth, formatTime } from "@/lib/format";
import { radioaid, getRadioAidSchedule } from "@/lib/radioaid";
import { site } from "@/lib/site";
import { Icon, ArrowRightIcon, DiscordIcon } from "@/lib/icons";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
};

/** Revalidate hourly; the live parts of the page fetch on their own schedule. */
export const revalidate = 3600;

export default async function HomePage() {
  const [featured, latest, hosts, events, schedule] = await Promise.all([
    getFeaturedArticle(),
    getLatestArticles(5),
    listHosts(),
    listEvents("upcoming"),
    // Nur geholt, wenn er auch gezeigt wird.
    features.schedule ? getSchedule() : Promise.resolve([]),
  ]);

  // The featured article leads the news section, so keep it out of the grid.
  const gridArticles = latest.filter((a) => a.slug !== featured?.slug).slice(0, 3);

  const today = new Date().getDay();
  const aid = getRadioAidSchedule();
  const todaySlots = groupByWeekday(schedule).find((d) => d.weekday === today)?.slots ?? [];

  return (
    <>
      {/* Verschwindet nach dem Sendeende von selbst — auf dem Server beim
          naechsten Neubau, im offenen Tab sofort. Vorher abschalten:
          `radioaid.bannerEnabled` in src/lib/radioaid.ts. */}
      {radioaid.bannerEnabled && aid.phase !== "over" && (
        <RadioAidBanner
          start={aid.start.getTime()}
          end={aid.end.getTime()}
          initialPhase={aid.phase}
          organisation={radioaid.organisation}
          donateUrl={radioaid.donateUrl}
          dateLabel={`${formatDayMonth(aid.start)}, ${formatTime(aid.start)} Uhr`}
        />
      )}

      <CoverStage heading={site.tagline} />

      {/* --- Zuletzt gespielt bzw. Sendeplan ------------------------------
          Direkt unter der Buehne: Wer wissen will, was lief, schaut hier
          zuerst. Links die Ansage, rechts die Liste. */}
      <section className="section shell">
        {features.schedule ? (
          <div className={styles.split}>
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
              />
            )}
          </div>
        ) : (
          /* Solange der Sendeplan ruht, waere hier nur ein leerer Kasten. Die
             Titelhistorie ist echte, immer gefuellte Information — und zeigt
             genau das, was der Sendeplan nicht kann: was tatsaechlich lief. */
          <div className={styles.split}>
            <SectionHeader
              eyebrow="Zuletzt gespielt"
              title="Was gerade lief"
              description="Die letzten Titel aus unserem Programm, direkt von laut.fm."
              action={{ href: "/radio", label: "Mehr auf der Radioseite" }}
            />
            <RecentTracks limit={6} emptyText="Die Titelliste ist gerade nicht erreichbar." />
          </div>
        )}
      </section>

      {/* --- News: Aufmacher + Spalte ------------------------------------- */}
      <section className="section shell">
        <SectionHeader
          eyebrow="Aktuelles"
          title="News aus dem Sender"
          description="Was sich bei VoltFM tut, und warum."
          action={{ href: "/news", label: "Alle News" }}
        />

        {featured ? (
          <div className={styles.newsLayout}>
            <ArticleCard article={featured} variant="wide" priority />
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

      {/* --- Team ---------------------------------------------------------- */}
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

      {/* --- Events + Discord ---------------------------------------------- */}
      <section className="section shell">
        <div className={styles.eventsGrid}>
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

          {/* Die eine blaue Flaeche der Seite: Sie markiert den einen Weg zu
              uns, und so soll sie auch auffallen. */}
          <aside className={styles.community} aria-labelledby="community-title">
            <p className={styles.communityEyebrow}>Community</p>
            <h2 id="community-title" className={styles.communityTitle}>
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
      </section>

      {/* --- Über uns: ein Satz, ein Verweis ------------------------------- */}
      <section className={styles.about}>
        <div className="shell">
          <div className={styles.aboutInner}>
            {/* Kein Slogan hier: Der steht schon in der Buehne, zweimal auf
                einer Seite waere einmal zu viel. */}
            <p className={styles.aboutQuote}>
              2021 eine laut.fm-Station, ein paar Namen später VoltFM.
            </p>
            <div className={styles.aboutAside}>
              <p className={styles.aboutText}>
                Kein festes Programm, keine Redaktion, dafür zwei Leute, die
                weitermachen.
              </p>
              <ButtonLink href="/ueber-uns" variant="neutral" mode="stroke" size="md">
                Die ganze Geschichte
                <Icon icon={ArrowRightIcon} />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
