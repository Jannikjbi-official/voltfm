import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { HostCard } from "@/components/common/host-card";
import { SectionHeader } from "@/components/common/section-header";
import { listHosts } from "@/services/content";
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

/**
 * Die Geschichte von VoltFM.
 *
 * Bewusst kurz gehalten: Hier steht nur, was tatsaechlich belegt ist. Die
 * Jahre 2023 bis 2025 sind zu einem Eintrag zusammengefasst, weil sich in
 * ihnen dasselbe wiederholt hat — fuenf fast gleiche Zeilen waeren gestreckt.
 * `year` ist absichtlich ein freier Text: nicht jeder Schritt laesst sich auf
 * eine Jahreszahl festnageln.
 */
const TIMELINE = [
  {
    year: "Jan 2021",
    kicker: "Der Anfang",
    title: "Jemand drückt auf Play",
    text: "Jannik legt eine laut.fm-Station an — damals noch als jannikjbiFM, aus dem Jugendzimmer in Hamburg. Kein Konzept, kein Sendeplan, keine Hörer. Mochiko ist von der ersten Stunde an dabei.",
  },
  {
    year: "danach",
    kicker: "Die Namenssuche",
    title: "Wie heißt das hier eigentlich?",
    text: "Aus jannikjbiFM wird ein anderer Name, und noch einer, und noch einer. Ausprobiert und wieder verworfen — weil damals schlicht nicht klar war, was bei Hörern ankommt. Geblieben ist am Ende VoltFM. Und die Station-ID jannikjbi, die bis heute im Stream steht.",
  },
  {
    year: "2022",
    kicker: "Zum ersten Mal RadioAid",
    title: "Radio, das etwas bewirkt",
    text: "Die Station überträgt zum ersten Mal RadioAid, die 24-stündige Charity-Sendung der laut.fm-Community — in dem Jahr zugunsten der Tafeln Deutschland. Seitdem gehört das zum festen Jahresablauf.",
  },
  {
    year: "2023–2025",
    kicker: "Jedes Jahr wieder",
    title: "Drei Ausgaben, drei Organisationen",
    text: "Deutsche Depressionshilfe, Ambulantes Kinderhospiz München, Hamburger Kinderwünsche. Jedes Jahr 24 Stunden Programm, das nicht uns gehört, sondern einem guten Zweck.",
    href: "/radioaid",
    linkLabel: "Alle Ausgaben ansehen",
  },
  {
    year: "2026",
    kicker: "Heute",
    title: "VoltFM bekommt ein Zuhause",
    text: "Eine eigene Website mit Redaktionssystem: Sendeplan, News, Moderatorenprofile und ein Player, der beim Seitenwechsel nicht abbricht. Am 6. November läuft wieder RadioAid, diesmal für Seelenpflaster e. V.",
    current: true,
  },
];

export default async function UeberUnsPage() {
  const [hosts, station] = await Promise.all([listHosts(), getStationInfo()]);

  return (
    <>
      <PageHeader
        eyebrow="Über uns"
        title="Radio, dem man anhört, dass jemand da ist."
        description="VoltFM ist ein unabhängiges Webradio aus Hamburg. Kein Sender einer Kette, keine Werbeblöcke, keine automatisierte Dauerschleife."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/ueber-uns", label: "Über VoltFM" },
        ]}
        size="large"
      />

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

          <ol className={styles.timeline} role="list">
            {TIMELINE.map((entry) => (
              <li
                key={entry.year}
                className={styles.entry}
                data-current={"current" in entry ? true : undefined}
              >
                <div className={styles.entryYear}>
                  <span className={styles.entryYearValue}>{entry.year}</span>
                </div>

                <div className={styles.entryBody}>
                  <span className={styles.entryKicker}>{entry.kicker}</span>
                  <h3 className={styles.entryTitle}>{entry.title}</h3>
                  <p className={styles.entryText}>{entry.text}</p>
                  {"href" in entry && entry.href && (
                    <Link href={entry.href} className={styles.entryLink}>
                      {entry.linkLabel}
                      <Icon icon={ArrowRightIcon} />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
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

      {/* --- Outlook ------------------------------------------------------- */}
      <section className={styles.outlook}>
        <div className="shell">
          <div className={styles.outlookInner}>
            <h2 className={styles.outlookTitle}>Was als Nächstes kommt</h2>
            <p className={styles.outlookText}>
              Favoriten, die du dir merken kannst. Benachrichtigungen, wenn deine
              Sendung startet. Und irgendwann ein Archiv zum Nachhören — daran
              hängt noch die rechtliche Seite, deshalb gibt es kein Datum.
            </p>
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
    </>
  );
}
