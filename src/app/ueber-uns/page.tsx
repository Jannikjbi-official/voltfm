import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/common/button-link";
import { HostCard } from "@/components/common/host-card";
import { SectionHeader } from "@/components/common/section-header";
import { listHosts, listTimeline } from "@/services/content";
import { getStationInfo } from "@/services/radio/metadata";
import { Icon, ArrowRightIcon } from "@/lib/icons";
import { site } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Über VoltFM",
  description:
    "Wie aus einem Jugendzimmer in Hamburg ein Webradio mit eigener Redaktion und Community wurde.",
  alternates: { canonical: "/ueber-uns" },
};

export const revalidate = 3600;



export default async function UeberUnsPage() {
  const [hosts, station, entries] = await Promise.all([
    listHosts(),
    getStationInfo(),
    listTimeline(),
  ]);

  return (
    <div className={styles.page}>
      {/* --- Kopfbereich --------------------------------------------------- */}
      <header className={styles.masthead}>
        <div className="shell">
          <nav className={styles.crumbs} aria-label="Brotkrumen">
            <Link href="/">Start</Link>
            <span aria-hidden="true">/</span>
            <span>Über VoltFM</span>
          </nav>

          <p className={styles.kicker}>Über uns</p>

          <h1 className={styles.title}>
            Radio, dem man anhört,
            <br />
            <span className={styles.titleAccent}>dass jemand da ist.</span>
          </h1>

          <p className={styles.lead}>
            VoltFM ist ein unabhängiges Webradio aus Hamburg. Kein Sender einer
            Kette, keine Werbeblöcke, keine automatisierte Dauerschleife.
          </p>

          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>Auf Sendung seit</dt>
              <dd>2021</dd>
            </div>
            <div className={styles.stat}>
              <dt>Am Mikrofon</dt>
              <dd>{hosts.length}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Sendebetrieb</dt>
              <dd>24 / 7</dd>
            </div>
          </dl>
        </div>
      </header>

      {/* --- Mission: a single wide statement ----------------------------- */}
      <section className="section shell">
        <div className={styles.mission}>
          <p className={styles.missionQuote}>
            {station?.format || "VoltFM – Dein Klang. Deine Welt."}
          </p>
          <div className={styles.missionText}>
            <p>
              Es gibt ein Argument gegen Radio, das schwer zu widerlegen ist: Ein
              Algorithmus kennt deinen Geschmack besser als jede Redaktion. Er
              weiß, welchen Song du übersprungen hast und welchen du dreimal
              hintereinander gehört hast.
            </p>
            <p>
              Was er nicht kann: dafür sorgen, dass viele Menschen im selben
              Moment dasselbe hören. Genau daraus entsteht alles, was uns an
              VoltFM wichtig ist — die Reaktionen im Discord, das gemeinsame
              Aufregen über eine Songauswahl, das Gefühl, nicht allein in einer
              Playlist zu sitzen.
            </p>
            <p>
              Dazu gehört auch, dass mal ein Song läuft, den du nicht magst. Eine
              Redaktion, die sich nicht traut danebenzuliegen, ist auch nur ein
              schlechterer Algorithmus.
            </p>
          </div>
        </div>
      </section>

      {/* --- Timeline ------------------------------------------------------ */}
      <section className={styles.historySection}>
        <div className="shell">
          <SectionHeader
            eyebrow="Geschichte"
            title="Wie es dazu kam"
            description="Seit Januar 2021 — von einer Playlist im Jugendzimmer zu einem Sender mit Redaktion."
          />

          {entries.length === 0 ? (
            <p className={styles.timelineEmpty}>
              Die Zeitleiste wird gerade eingepflegt.
            </p>
          ) : (
          <ol className={styles.timeline} role="list">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className={styles.entry}
                data-current={entry.current || undefined}
              >
                <div className={styles.entryYear}>
                  <span className={styles.entryYearValue}>{entry.year}</span>
                </div>

                <div className={styles.entryBody}>
                  <span className={styles.entryKicker}>{entry.kicker}</span>
                  <h3 className={styles.entryTitle}>{entry.title}</h3>
                  <p className={styles.entryText}>{entry.text}</p>
                  {entry.href && (
                    <Link href={entry.href} className={styles.entryLink}>
                      {entry.linkLabel ?? "Mehr erfahren"}
                      <Icon icon={ArrowRightIcon} />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
          )}
        </div>
      </section>

      {/* --- Team ---------------------------------------------------------- */}
      <section className="section shell">
        <SectionHeader
          eyebrow="Das Team"
          title="Wer VoltFM macht"
          action={{ href: "/moderatoren", label: "Alle Profile" }}
        />
        <div className={styles.team}>
          {hosts.map((host) => (
            <HostCard key={host.id} host={host} />
          ))}
        </div>
      </section>

      {/* --- Ausblick ------------------------------------------------------ */}
      <section className={styles.outlook}>
        <div className="shell">
          <div className={styles.outlookInner}>
            <p className={styles.outlookKicker}>Woran wir arbeiten</p>
            <h2 className={styles.outlookTitle}>Was als Nächstes kommt</h2>

            <ul className={styles.roadmap} role="list">
              <li className={styles.roadmapItem}>
                <h3>Eigener Sendeserver</h3>
                <p>
                  Damit feste Sendezeiten wieder verlässlich sind — und Songwünsche
                  tatsächlich in der laufenden Sendung landen.
                </p>
              </li>
              <li className={styles.roadmapItem}>
                <h3>Favoriten und Hinweise</h3>
                <p>
                  Sendungen merken und benachrichtigt werden, wenn deine startet.
                </p>
              </li>
              <li className={styles.roadmapItem}>
                <h3>Archiv zum Nachhören</h3>
                <p>
                  Daran hängt noch die rechtliche Seite, deshalb gibt es kein Datum.
                </p>
              </li>
            </ul>

            <div className={styles.outlookActions}>
              <ButtonLink href="/radio" variant="primary" mode="filled" size="md">
                Jetzt live hören
              </ButtonLink>
              <ButtonLink href={site.discordUrl} external variant="neutral" mode="stroke" size="md">
                Discord beitreten
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
