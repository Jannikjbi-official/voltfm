import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { FaqList } from "@/app/faq/faq-list";
import { Icon, DiscordIcon } from "@/lib/icons";
import { radio, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "So funktioniert VoltFM",
  description:
    "Wie du VoltFM hörst, woher die Titelangaben kommen, wo Songwünsche und Bewerbungen landen und was es sonst noch gibt.",
  alternates: { canonical: "/so-gehts" },
};

/** Die Bedienung der Seite in kurzen Antworten. Mehr Fragen stehen auf /faq. */
const GUIDE: { question: string; answer: React.ReactNode }[] = [
  {
    question: "Wie höre ich VoltFM?",
    answer: (
      <>
        Drück auf Play, oben in der Kopfzeile oder auf der{" "}
        <Link href="/radio">Radio-Seite</Link>. Beim ersten Mal kommt ein kurzer Hinweis,
        danach öffnet sich der Webplayer von {radio.externalName} in einem neuen
        Fenster. Dort läuft unser Programm.
      </>
    ),
  },
  {
    question: "Warum ein neues Fenster?",
    answer: (
      <>
        Unser Stream kommt von {radio.providerName}, und deren Nutzungsbedingungen
        erlauben nur das Verlinken, nicht das Einbetten auf fremden Seiten. Was beim
        Öffnen an Daten übertragen wird, steht im{" "}
        <Link href="/datenschutz#livestream-und-sendedaten-laut-fm">Datenschutz</Link>.
      </>
    ),
  },
  {
    question: "Woher kommt die Anzeige, was gerade läuft?",
    answer: (
      <>
        Titel und Künstler kommen von {radio.providerName}. Unser Server fragt sie dort
        ab, dein Browser verbindet sich dafür nicht mit {radio.providerName}.
      </>
    ),
  },
  {
    question: "Wie wünsche ich mir einen Song?",
    answer: (
      <>
        Über das VoltFM-Portal. Wie das geht, steht auf{" "}
        <Link href="/wunsch">Song wünschen</Link>.
      </>
    ),
  },
  {
    question: "Wie bewerbe ich mich?",
    answer: (
      <>
        Ebenfalls über das <a href={site.portalUrl} target="_blank" rel="noreferrer noopener">VoltFM-Portal</a>
        , dort stehen die offenen Stellen. Mehr dazu auf{" "}
        <Link href="/mitmachen">Mitmachen</Link>.
      </>
    ),
  },
  {
    question: "Was passiert im Discord?",
    answer: (
      <>
        Dort kündigen wir Neues an, dort kannst du mitreden, und dort öffnest du ein
        Ticket, wenn du etwas von uns willst ({site.supportChannelHint}). Ein
        Kontaktformular gibt es nicht. Mehr auf der{" "}
        <Link href="/kontakt">Kontaktseite</Link>.
      </>
    ),
  },
  {
    question: "Geht das auch dunkel?",
    answer: (
      <>
        Ja. Oben in der Kopfzeile schaltest du zwischen hellem und dunklem Design um.
        Hell ist voreingestellt, deine Wahl merkt sich die Seite in einem Cookie.
      </>
    ),
  },
  {
    question: "Ich streame. Gibt es etwas für meinen Stream?",
    answer: (
      <>
        Ja, ein Overlay für OBS und Streamlabs: Alle paar Minuten erscheint eine
        VoltFM-Karte in einer Ecke. Download und Anleitung auf{" "}
        <Link href="/overlay">Overlay</Link>.
      </>
    ),
  },
];

export default function SoGehtsPage() {
  return (
    <>
      <PageHeader
        title="So funktioniert VoltFM"
        description="Hören, wünschen, mitmachen: die Seite in kurzen Antworten."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/so-gehts", label: "So geht's" },
        ]}
        size="large"
      />

      <section className="shell pt-2">
        <div className="grid items-start gap-2 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <div>
            <FaqList items={GUIDE} />
          </div>

          <div className="flex flex-col gap-2 lg:sticky lg:top-[calc(var(--header-height)+1.75rem)]">
            <div className="surface-card flex flex-col items-start gap-4 rounded-[var(--radius)] p-6 sm:p-8">
              <p className="font-meta text-muted">noch fragen</p>
              <h2 className="font-display text-[2rem] text-balance text-foreground sm:text-4xl">
                Mehr Antworten
              </h2>
              <p className="leading-relaxed text-muted">
                Warum die Station {site.station} heißt, ob es Werbung gibt und mehr steht bei
                den häufigen Fragen.
              </p>
              <ButtonLink href="/faq" variant="secondary">
                Häufige Fragen
              </ButtonLink>
            </div>

            <div className="display-panel display-dots flex flex-col items-start gap-4 rounded-[var(--radius)] p-6 sm:p-8">
              <p className="flex items-center gap-2 font-meta text-display-muted">
                <span className="led" aria-hidden="true" />
                offene leitung
              </p>
              <p className="text-display-muted">Im Discord ist meistens jemand von uns online.</p>
              <ButtonLink href={site.discordUrl} external variant="primary">
                <Icon icon={DiscordIcon} />
                Zum Discord
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
