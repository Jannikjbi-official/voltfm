import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { FaqList } from "./faq-list";
import { Icon, DiscordIcon } from "@/lib/icons";
import { features, radio, site } from "@/lib/site";

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
        Ja. Wir schreiben offene Stellen in unserem Bewerbungsportal aus — dort
        suchst du dir aus, worauf du Lust hast. Bei manchen Stellen gehört ein
        kleiner Test dazu. Die Wege stehen auf{" "}
        <Link href="/mitmachen">Mitmachen</Link>.
      </>
    ),
  },
  {
    question: "Kostet VoltFM etwas, und gibt es Werbung?",
    answer: (
      <>
        VoltFM ist nicht-kommerziell: Wir verlangen nichts und verdienen nichts
        daran. Werbung im Stream gibt es trotzdem — die schaltet{" "}
        {radio.providerName} und finanziert damit die Ausstrahlung und die
        Musikrechte. Darauf haben wir keinen Einfluss.
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
        title="Gute Frage."
        description="Das hier wird uns am häufigsten gefragt — mit ehrlichen Antworten statt Marketingsätzen."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/faq", label: "Häufige Fragen" },
        ]}
        size="large"
      />

      <section className="shell">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <div>
            <FaqList items={FAQ} />
          </div>

          <div
            data-theme="dark"
            className="dark flex flex-col items-start gap-4 rounded-[var(--radius)] border border-border bg-surface p-7 text-foreground shadow-[var(--lift-shadow)] sm:p-9 lg:sticky lg:top-[calc(var(--header-height)+1.75rem)]"
          >
            <span aria-hidden="true" className="grid size-12 place-items-center rounded-2xl bg-volt text-xl text-ink">
              <Icon icon={DiscordIcon} />
            </span>
            <h2 className="font-display text-[2rem] text-volt sm:text-4xl">
              Deine Frage war nicht dabei?
            </h2>
            <p className="text-muted">
              Dann frag einfach. Im Discord ist meistens jemand von uns online.
            </p>
            <ButtonLink href={site.discordUrl} external variant="primary">
              <Icon icon={DiscordIcon} />
              Im Discord fragen
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
