import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { HostCard } from "@/components/common/host-card";
import { SectionHeader } from "@/components/common/section-header";
import { listHosts } from "@/services/content";
import { getStationInfo } from "@/services/radio/metadata";
import { site } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Über VoltFM",
  description:
    "Wie aus einem Jugendzimmer in Oldenburg ein Webradio mit eigener Redaktion und Community wurde.",
  alternates: { canonical: "/ueber-uns" },
};

export const revalidate = 3600;

const TIMELINE = [
  {
    year: "2021",
    title: "Ein geliehenes Mikrofon",
    text: "Jannik startet VoltFM in seinem Jugendzimmer in Oldenburg. Die erste Sendung hört, nach eigener Zählung, seine Schwester. Der Sound ist schlecht, die Idee steht.",
  },
  {
    year: "2022",
    title: "Der Discord entsteht",
    text: "Aus einzelnen Hörerinnen und Hörern wird eine Community. Songwünsche laufen zum ersten Mal nicht mehr per Direktnachricht, sondern in einem eigenen Kanal.",
  },
  {
    year: "2023",
    title: "Feste Sendungen",
    text: "Mochiko baut die EDM-Strecken auf und übernimmt die Musikredaktion. VoltFM bekommt einen Sendeplan statt einer Dauerplaylist — und damit zum ersten Mal ein echtes Programm.",
  },
  {
    year: "2024",
    title: "Ein richtiges Studio",
    text: "Absorber an den Wänden, ein Mischpult aus zweiter Hand, ein Signalweg, der jeden Tag gleich klingt. Der Unterschied ist sofort hörbar.",
  },
  {
    year: "2025",
    title: "Das Team wächst",
    text: "Mira übernimmt Community und Events, Tobi bringt Gaming und Technik ins Programm. Vier Menschen, sechs Sendungen.",
  },
  {
    year: "2026",
    title: "Die neue Plattform",
    text: "VoltFM bekommt eine eigene Website mit Redaktionssystem: News, Sendeplan, Moderatorenprofile und ein Player, der beim Seitenwechsel nicht abbricht.",
  },
];

export default async function UeberUnsPage() {
  const [hosts, station] = await Promise.all([listHosts(), getStationInfo()]);

  return (
    <>
      <PageHeader
        eyebrow="Über uns"
        title="Radio, dem man anhört, dass jemand da ist."
        description="VoltFM ist ein unabhängiges Webradio aus Oldenburg. Kein Sender einer Kette, keine Werbeblöcke, keine automatisierte Dauerschleife."
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
            description="Sechs Jahre, von einer Playlist im Jugendzimmer zu einem Sender mit Redaktion."
          />

          <ol className={styles.timeline} role="list">
            {TIMELINE.map((entry) => (
              <li key={entry.year} className={styles.entry}>
                <div className={styles.entryYear}>{entry.year}</div>
                <div className={styles.entryBody}>
                  <h3 className={styles.entryTitle}>{entry.title}</h3>
                  <p className={styles.entryText}>{entry.text}</p>
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
