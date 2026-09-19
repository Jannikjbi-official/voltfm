import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/common/button-link";
import { Icon, ExternalLinkIcon, DiscordIcon, HeartIcon, CalendarIcon, ClockIcon } from "@/lib/icons";
import { formatDate, formatTime } from "@/lib/format";
import { radioaid, getRadioAidSchedule } from "@/lib/radioaid";
import { site } from "@/lib/site";
import { Countdown } from "./countdown";
import styles from "./page.module.css";

/**
 * RadioAid — die jaehrliche Charity-Sendung aus der laut.fm-Community, die
 * VoltFM mit ausstrahlt.
 *
 * Termin, Dauer und Empfaenger stehen in `src/lib/radioaid.ts`, damit die
 * Navigation dieselbe Quelle liest und beide nicht auseinanderlaufen koennen.
 */

/**
 * Unser eigener Weg mit RadioAid — nicht die Chronik des Projekts.
 *
 * `org` nennt nur den Empfaenger des jeweiligen Jahres als Einordnung; die
 * Ueberschrift jedes Eintrags beschreibt, was bei uns passiert ist. Was wir in
 * einem Jahr konkret beigetragen haben, gehoert in `text` — steht dort nichts,
 * ist es schlicht noch nicht aufgeschrieben.
 */
const EDITIONS = [
  {
    year: "Jan 2021",
    title: "Die Station geht an den Start",
    text: "Jannik legt seine laut.fm-Station an — damals noch als jannikjbiFM. RadioAid ist zu dem Zeitpunkt noch kein Thema.",
    org: null,
  },
  {
    year: "2022",
    title: "Zum ersten Mal dabei",
    text: "Wir übernehmen die 24-Stunden-Sendung erstmals in unser Programm. Die Station heißt zu der Zeit noch nicht VoltFM.",
    org: "Tafeln Deutschland",
  },
  { year: "2023", title: "Wieder mit an Bord", text: null, org: "Deutsche Depressionshilfe" },
  { year: "2024", title: "Wieder mit an Bord", text: null, org: "Ambulantes Kinderhospiz München" },
  { year: "2025", title: "Wieder mit an Bord", text: null, org: "Hamburger Kinderwünsche e. V." },
  {
    year: "2026",
    title: "Erstmals als VoltFM mit eigener Seite",
    text: "Fünfte Teilnahme — und die erste, bei der wir eine richtige Website haben, um vorher darauf hinzuweisen.",
    org: "Seelenpflaster e. V.",
    upcoming: true,
  },
] as const;

const FACTS = [
  { value: "8", label: "Jahre RadioAid" },
  { value: "24 h", label: "Livesendung am Stück" },
  { value: "39.425 €", label: "bisher gesammelt" },
] as const;

export const metadata: Metadata = {
  title: "RadioAid",
  description:
    "24 Stunden Charity-Radio: VoltFM überträgt RadioAid zugunsten von Seelenpflaster e. V. Countdown, Infos und wie du mitmachst.",
  alternates: { canonical: "/radioaid" },
};

export default function RadioAidPage() {
  const { start, end, phase } = getRadioAidSchedule();

  return (
    /* Eigene Farbwelt: RadioAid ist eine fremde Marke im VoltFM-Gewand, und ein
       warmes Rot traegt das Thema besser als das Senderblau. Gesetzt als Tokens
       auf dem Wurzelelement, damit alles darunter sie erbt. */
    <div className={styles.page} data-phase={phase}>
      <header className={styles.masthead}>
        <div className="shell">
          <nav className={styles.crumbs} aria-label="Brotkrumen">
            <Link href="/">Start</Link>
            <span aria-hidden="true">/</span>
            <span>RadioAid</span>
          </nav>

          <p className={styles.eyebrow}>
            <span className={styles.heart} aria-hidden="true">
              <Icon icon={HeartIcon} />
            </span>
            Charity-Aktion der Radio-Community
          </p>

          <h1 className={styles.mastheadTitle}>
            Wenn Radio
            <br />
            <span className={styles.mastheadAccent}>Gutes tut.</span>
          </h1>

          <p className={styles.mastheadLead}>
            Einmal im Jahr macht die Radio-Community 24 Stunden lang gemeinsam
            Programm für einen guten Zweck. VoltFM ist dabei.
          </p>
        </div>
      </header>

      <section className="section shell">
        <div className={styles.hero}>
          <Countdown
            start={start.getTime()}
            end={end.getTime()}
            initialPhase={phase}
            label="Bis zum Sendestart"
          />

          <dl className={styles.when}>
            <div className={styles.whenRow}>
              <dt>
                <Icon icon={CalendarIcon} /> Termin
              </dt>
              <dd>{formatDate(start)}</dd>
            </div>
            <div className={styles.whenRow}>
              <dt>
                <Icon icon={ClockIcon} /> Sendezeit
              </dt>
              <dd>
                {formatTime(start)} Uhr bis {formatTime(end)} Uhr am Folgetag
              </dd>
            </div>
            <div className={styles.whenRow}>
              <dt>
                <Icon icon={HeartIcon} /> Zugunsten von
              </dt>
              <dd>{radioaid.organisation}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section shell">
        <div className={styles.columns}>
          <article className={styles.prose}>
            <h2>Was ist RadioAid?</h2>
            <p>
              RadioAid ist ein Gemeinschaftsprojekt, das aus der laut.fm-Community
              entstanden ist und inzwischen allen Radiostationen offensteht. Einmal
              im Jahr unterstützt es mit einer Charity-Radio-Show eine wohltätige
              Organisation bei ihrer Arbeit.
            </p>
            <p>
              Die Sendung läuft <strong>24 Stunden am Stück</strong> und wird von
              wechselnden Moderatorinnen, Moderatoren und Stationen gestaltet.
              Jede Station darf sie kostenfrei ausstrahlen — es geht nicht um
              Reichweite für einen Sender, sondern darum, möglichst viele Ohren zu
              erreichen.
            </p>
            <p>
              Ziel ist, die Hörerinnen und Hörer über die ausgewählte Organisation
              zu informieren, konkrete Wege der Unterstützung zu zeigen und zum
              Spenden zu motivieren.
            </p>

            <h2>Wem es dieses Jahr hilft</h2>
            <p>
              Die Spenden gehen an <strong>{radioaid.organisation}</strong>. Der
              Verein verfolgt seit August 2021 das Ziel, Kindern in besonders
              schweren Lebenssituationen mit personalisierter
              &bdquo;Seelenpflaster&ldquo;-Post eine Freude zu machen: ein kleines
              Überraschungsgeschenk, eine Grußkarte, adressiert an genau dieses
              Kind.
            </p>
            <p>
              Das Ziel ist bewusst unbescheiden formuliert — ein breites Grinsen im
              Gesicht der Kinder. Der Alltag ist schwer genug.
            </p>

            <h2>Was VoltFM macht</h2>
            <p>
              Wir übernehmen die Sendung in voller Länge in unser Programm. Wer am{" "}
              {formatDate(start, "short")} bei uns einschaltet, hört RadioAid — und
              erfährt zwischendurch, wie gespendet werden kann.
            </p>

            <h2>Wir sind seit 2022 dabei</h2>
            <p>
              Jannik ist <strong>seit 2022</strong> bei RadioAid — die
              laut.fm-Station selbst gibt es seit <strong>Januar 2021</strong>, das
              erste Mal mitgemacht hat er also im Jahr danach. Nur hieß die
              Station in dieser Zeit nicht durchgehend VoltFM.
            </p>
            <p>
              Angefangen hat sie als <strong>jannikjbiFM</strong>, danach kamen
              etliche weitere Namen, die ausprobiert und wieder verworfen wurden —
              aus Langeweile und weil damals schlicht nicht klar war, was bei den
              Hörern ankommt. Geblieben sind am Ende zwei Dinge: der Sendername{" "}
              <strong>VoltFM</strong> und die laut.fm-Station{" "}
              <strong>{site.station}</strong>, die noch aus dem Januar 2021 stammt.
              Warum wir sie behalten haben, steht{" "}
              <Link href="/news/voltfm-geht-weiter-neue-webseite">
                in diesem Beitrag
              </Link>
              .
            </p>

            <h2>Unser Weg mit RadioAid</h2>
            <ol className={styles.timeline}>
              {EDITIONS.map((edition) => (
                <li
                  key={edition.year}
                  className={styles.entry}
                  data-upcoming={"upcoming" in edition ? true : undefined}
                >
                  <span className={styles.entryYear}>{edition.year}</span>
                  <div className={styles.entryBody}>
                    <p className={styles.entryTitle}>{edition.title}</p>
                    {edition.text && <p className={styles.entryNote}>{edition.text}</p>}
                    {edition.org && (
                      <p className={styles.entryOrg}>Gesammelt wurde für {edition.org}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className={styles.timelineSource}>
RadioAid selbst gibt es schon länger als uns — die Chronik des Projekts steht im{" "}
              <a href="https://radioaid.de/blog/" target="_blank" rel="noreferrer noopener">
                RadioAid-Blog
              </a>
              .
            </p>
          </article>

          <aside className={styles.side}>
            <div className={styles.sideBlock}>
              <h2 className={styles.sideTitle}>Mitmachen</h2>
              <p className={styles.sideText}>
                Du hast selbst einen Sender, willst moderieren oder einfach nur
                Werbung machen? Bei RadioAid kann jede Station mitmachen — die
                Sendung wird kostenfrei zur Verfügung gestellt.
              </p>
              <ButtonLink
                href={radioaid.website}
                external
                variant="primary"
                mode="filled"
                size="sm"
              >
                Zu RadioAid
                <Icon icon={ExternalLinkIcon} />
              </ButtonLink>
            </div>

            <div className={styles.sideBlock}>
              <h2 className={styles.sideTitle}>In Zahlen</h2>
              <dl className={styles.facts}>
                {FACTS.map((fact) => (
                  <div key={fact.label} className={styles.fact}>
                    <dt className={styles.factValue}>{fact.value}</dt>
                    <dd className={styles.factLabel}>{fact.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className={styles.sideBlock}>
              <h2 className={styles.sideTitle}>Auf dem Laufenden bleiben</h2>
              <p className={styles.sideText}>
                Wir kündigen die Sendung rechtzeitig im Discord an — dort gibt es
                auch die Sendeplätze, sobald sie feststehen.
              </p>
              <ButtonLink href={site.discordUrl} external variant="neutral" mode="stroke" size="sm">
                <Icon icon={DiscordIcon} />
                Discord öffnen
              </ButtonLink>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
