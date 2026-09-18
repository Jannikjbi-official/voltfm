import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, ExternalLinkIcon, DiscordIcon, HeartIcon, CalendarIcon, ClockIcon } from "@/lib/icons";
import { parseStationTime, formatDate, formatTime } from "@/lib/format";
import { site } from "@/lib/site";
import { Countdown } from "./countdown";
import styles from "./page.module.css";

/**
 * RadioAid — die jaehrliche Charity-Sendung aus der laut.fm-Community, die
 * VoltFM mit ausstrahlt.
 *
 * Der Sendetermin steht hier fest im Code und nicht im CMS: Er wird einmal im
 * Jahr bekanntgegeben und aendert sich nicht spontan. Die Angaben stammen von
 * radioaid.de; aendert sich dort etwas, muss es hier nachgezogen werden.
 */
const BROADCAST = {
  /** Naechster Sendestart, als Senderzeit (Europe/Berlin). */
  startsAt: "2026-11-06T18:00",
  /** Die Show laeuft 24 Stunden am Stueck. */
  durationHours: 24,
  organisation: "Seelenpflaster e. V.",
  website: "https://radioaid.de/",
} as const;

/**
 * Die Ausgaben, bei denen VoltFM dabei war — RadioAid selbst laeuft schon
 * laenger. Empfaenger uebernommen aus dem RadioAid-Blog; aendert sich dort
 * etwas, muss es hier nachgezogen werden.
 */
const EDITIONS = [
  {
    year: "2022",
    org: "Tafeln Deutschland",
    note: "Das erste Mal. Die Station heißt damals noch nicht VoltFM.",
  },
  { year: "2023", org: "Deutsche Depressionshilfe", note: null },
  { year: "2024", org: "Ambulantes Kinderhospiz München", note: null },
  { year: "2025", org: "Hamburger Kinderwünsche e. V.", note: null },
  {
    year: "2026",
    org: "Seelenpflaster e. V.",
    note: "Am 6. November, 24 Stunden lang — unsere fünfte Ausgabe.",
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
  const start = parseStationTime(BROADCAST.startsAt);
  const end = new Date(start.getTime() + BROADCAST.durationHours * 3_600_000);

  return (
    <>
      <PageHeader
        eyebrow="Charity"
        title="RadioAid — wenn Radio Gutes tut"
        description="Einmal im Jahr macht die Radio-Community 24 Stunden lang gemeinsam Programm für einen guten Zweck. VoltFM ist dabei."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/radioaid", label: "RadioAid" },
        ]}
        size="large"
      />

      <section className="section shell">
        <div className={styles.hero}>
          <Countdown target={start.getTime()} label="Bis zum Sendestart" />

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
              <dd>{BROADCAST.organisation}</dd>
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
              Die Spenden gehen an <strong>{BROADCAST.organisation}</strong>. Der
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

            <h2>Unsere Ausgaben seit 2022</h2>
            <ol className={styles.timeline}>
              {EDITIONS.map((edition) => (
                <li
                  key={edition.year}
                  className={styles.entry}
                  data-upcoming={"upcoming" in edition ? true : undefined}
                >
                  <span className={styles.entryYear}>{edition.year}</span>
                  <div className={styles.entryBody}>
                    <p className={styles.entryOrg}>
                      Zugunsten von <strong>{edition.org}</strong>
                    </p>
                    {edition.note && <p className={styles.entryNote}>{edition.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
            <p className={styles.timelineSource}>
              RadioAid gibt es schon länger — die vollständige Geschichte steht im{" "}
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
                href={BROADCAST.website}
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
    </>
  );
}
