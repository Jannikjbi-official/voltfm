import type { Metadata } from "next";
import Link from "next/link";

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
import { Icon, CheckIcon, DiscordIcon } from "@/lib/icons";

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
          Direkt unter dem Plakat: Wer wissen will, was lief, schaut hier
          zuerst. Gesetzt wie ein Fahrplan: Uhrzeit links, Titel rechts. */}
      <section className="shell pt-16 sm:pt-24" aria-labelledby="home-recent">
        {features.schedule ? (
          <>
            <SectionHeader
              id="home-recent"
              title="Heute auf Sendung"
              description="Der Sendeplan kommt direkt von laut.fm und ist damit immer aktuell."
              action={{ href: "/programm", label: "Ganze Woche" }}
            />
            {todaySlots.length > 0 ? (
              <ol className="grid border-t-2 border-border md:grid-cols-2 md:gap-x-10">
                {todaySlots.map((slot) => (
                  <li
                    key={`${slot.id}-${slot.startHour}`}
                    className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-b border-separator py-4"
                  >
                    <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                      {String(slot.startHour).padStart(2, "0")}:00
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-wide font-bold text-foreground">{slot.name}</h3>
                      {slot.description && (
                        <p className="mt-1 text-sm text-muted">{slot.description}</p>
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
          </>
        ) : (
          /* Solange der Sendeplan ruht, waere hier nur ein leerer Kasten. Die
             Titelhistorie ist echte, immer gefuellte Information — und zeigt
             genau das, was der Sendeplan nicht kann: was tatsaechlich lief. */
          <>
            <SectionHeader
              id="home-recent"
              title="Was gerade lief"
              description="Die letzten Titel aus unserem Programm, direkt von laut.fm."
              action={{ href: "/radio", label: "Mehr auf der Radioseite" }}
            />
            <RecentTracks limit={6} columns emptyText="Die Titelliste ist gerade nicht erreichbar." />
          </>
        )}
      </section>

      {/* --- News: Aufmacher + Spalte ------------------------------------- */}
      <section className="shell pt-16 sm:pt-24" aria-labelledby="home-news">
        <SectionHeader
          id="home-news"
          title="News aus dem Sender"
          description="Was sich bei VoltFM tut, und warum."
          action={{ href: "/news", label: "Alle News" }}
        />

        {featured ? (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-0">
            <div className="lg:pr-10">
              <ArticleCard article={featured} variant="wide" priority />
            </div>
            <div className="flex flex-col border-t-2 border-border pt-6 lg:border-t-0 lg:border-l-2 lg:pt-0 lg:pl-10">
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
      <section className="shell pt-16 sm:pt-24" aria-labelledby="home-team">
        <SectionHeader
          id="home-team"
          title="Die zwei hinter VoltFM"
          description="Jannik und Mochiko haben den Sender gegründet und machen ihn bis heute."
          action={{ href: "/moderatoren", label: "Alle Moderatoren" }}
        />

        {hosts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hosts.slice(0, 4).map((host) => (
              <HostCard key={host.id} host={host} />
            ))}
          </div>
        ) : (
          <EmptyState title="Noch keine Profile hinterlegt" />
        )}
      </section>

      {/* --- Events + Discord ---------------------------------------------- */}
      <section className="shell pt-16 sm:pt-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
          <div aria-labelledby="home-events">
            <SectionHeader
              id="home-events"
              title="Kommende Events"
              action={{ href: "/events", label: "Alle Events" }}
            />
            {events.length > 0 ? (
              <div className="flex flex-col">
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

          {/* Der eine Weg zu uns: ein Block aus Tinte, die Ansage in Gelb. */}
          <aside
            aria-labelledby="community-title"
            data-theme="dark"
            className="dark flex flex-col items-start gap-5 self-start border-2 border-ink bg-ink p-7 text-paper sm:p-9"
          >
            <span aria-hidden="true" className="grid size-12 place-items-center bg-volt text-xl text-ink">
              <Icon icon={DiscordIcon} />
            </span>
            <h2 id="community-title" className="font-display text-[2.6rem] text-balance text-volt sm:text-5xl">
              Am schnellsten erreichst du uns im Discord.
            </h2>
            <p className="text-base leading-relaxed text-paper/80">
              Da kündigen wir alles zuerst an, und da lesen wir, was dir gefällt
              oder fehlt. Zwei Klicks, kein Konto auf dieser Seite.
            </p>
            <ul className="flex w-full flex-col border-t border-white/20 text-sm">
              {[
                "Ankündigungen, bevor sie hier stehen",
                "Feedback direkt an uns zwei",
                "Ein Ticket statt einer E-Mail",
              ].map((item) => (
                <li key={item} className="flex items-baseline gap-2.5 border-b border-white/20 py-2.5">
                  <Icon icon={CheckIcon} className="text-xs text-volt" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
              <ButtonLink href={site.discordUrl} external size="lg">
                <Icon icon={DiscordIcon} />
                Discord beitreten
              </ButtonLink>
              <Link
                href="/community"
                className="font-wide text-sm font-bold underline decoration-2 underline-offset-4 hover:text-volt"
              >
                Mehr zur Community
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* --- Über uns: ein Satz, ein Verweis ------------------------------- */}
      <section className="shell pt-16 sm:pt-24">
        <div className="border-t-4 border-border pt-6">
          {/* Kein Slogan hier: Der steht schon im Plakat. */}
          <p className="font-display text-[3rem] text-balance text-foreground sm:text-8xl lg:text-[9rem]">
            2021 eine laut.fm-Station, ein paar Namen später VoltFM.
          </p>
          <div className="mt-8 flex flex-col items-start gap-5 border-t-2 border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              Kein festes Programm, keine Redaktion, dafür zwei Leute, die
              weitermachen.
            </p>
            <ButtonLink href="/ueber-uns" variant="outline">
              Die ganze Geschichte
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
