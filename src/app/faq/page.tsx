import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon } from "@/lib/icons";
import { features, radio, site } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Häufige Fragen",
  description:
    "Warum die Station jannikjbi heißt, wieso es gerade keinen Sendeplan gibt und wie du VoltFM hörst.",
  alternates: { canonical: "/faq" },
};

/**
 * Antworten auf das, was tatsächlich gefragt wird.
 *
 * Bewusst konkret statt ausweichend: Wer hier landet, hat eine Frage und will
 * keine Broschüre. `answer` ist ein Knoten, damit Antworten verlinken können.
 */
const FAQ: { question: string; answer: React.ReactNode }[] = [
  {
    question: "Wie höre ich VoltFM?",
    answer: (
      <>
        Über den Play-Knopf oben oder auf der{" "}
        <Link href="/radio">Radio-Seite</Link>. Der Klick öffnet {radio.providerName}{" "}
        in einem neuen Fenster — dort läuft unser Programm. Ein Konto brauchst du
        dafür nicht.
      </>
    ),
  },
  {
    question: `Warum heißt die Station ${site.station} und nicht VoltFM?`,
    answer: (
      <>
        Die Station gehört Jannik, dem Gründer, und läuft seit Januar 2021 unter
        seinem Handle — damals gab es den Namen VoltFM noch gar nicht. Eine neue
        anzulegen hätte Historie, Einstellungen und Hörerinnen gekostet. Die
        ganze Geschichte steht{" "}
        <Link href="/news/voltfm-geht-weiter-neue-webseite">in diesem Beitrag</Link>.
      </>
    ),
  },
  {
    question: "Warum läuft der Stream nicht direkt auf der Seite?",
    answer: (
      <>
        Die Nutzungsbedingungen von {radio.providerName} erlauben das Verlinken
        ihrer Streams, nicht aber das Einbetten auf fremden Seiten. Daran halten
        wir uns. Was dabei an Daten übertragen wird, steht im{" "}
        <Link href="/datenschutz">Datenschutz</Link>.
      </>
    ),
  },
  ...(features.schedule
    ? []
    : [
        {
          question: "Wo ist der Sendeplan hin?",
          answer: (
            <>
              Unser Programm liegt derzeit als eine durchlaufende Playlist bei{" "}
              {radio.providerName}. Feste Sendezeiten lassen sich damit nicht
              verlässlich zusagen, und ein Sendeplan, der nicht stimmt, ist
              schlechter als gar keiner. Sobald wir einen eigenen Sendeserver
              haben, kommt er zurück — mit Songwünschen, die tatsächlich in der
              laufenden Sendung landen.
            </>
          ),
        },
      ]),
  {
    question: "Kann ich mir etwas wünschen?",
    answer: (
      <>
        Schick deinen Wunsch in den Discord. Solange wir über {radio.providerName}{" "}
        senden, landet er nicht automatisch im Programm, aber wir nehmen ihn in
        die Rotation auf, wenn er passt.
      </>
    ),
  },
  {
    question: "Kann ich selbst moderieren?",
    answer: (
      <>
        Ja. Vorerfahrung brauchst du nicht, Verlässlichkeit schon. Wie es geht,
        steht auf <Link href="/mitmachen">Mitmachen</Link>.
      </>
    ),
  },
  {
    question: "Kostet VoltFM etwas, und gibt es Werbung?",
    answer: (
      <>
        Nein und nein. VoltFM ist ein nicht-kommerzielles Projekt. Es gibt keine
        Werbeblöcke und keine Bezahlschranke — die Musikrechte trägt{" "}
        {radio.providerName}.
      </>
    ),
  },
  {
    question: "Wie erreiche ich euch?",
    answer: (
      <>
        Am schnellsten über ein Ticket im Discord. Für Rechtliches und
        Datenschutz gibt es die Adresse im <Link href="/impressum">Impressum</Link>.
        Mehr dazu auf der <Link href="/kontakt">Kontaktseite</Link>.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Häufige Fragen"
        title="Gute Frage."
        description="Das hier wird uns am häufigsten gefragt — mit ehrlichen Antworten statt Marketingsätzen."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/faq", label: "Häufige Fragen" },
        ]}
        size="large"
      />

      <section className="section shell">
        <div className={styles.list}>
          {FAQ.map((item) => (
            <details key={item.question} className={styles.item}>
              <summary className={styles.question}>{item.question}</summary>
              <div className={styles.answer}>{item.answer}</div>
            </details>
          ))}
        </div>

        <div className={styles.rest}>
          <h2 className={styles.restTitle}>Deine Frage war nicht dabei?</h2>
          <p className={styles.restText}>
            Dann frag einfach. Im Discord ist meistens jemand von uns online.
          </p>
          <ButtonLink href={site.discordUrl} external variant="primary" mode="filled" size="md">
            <Icon icon={DiscordIcon} />
            Im Discord fragen
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
