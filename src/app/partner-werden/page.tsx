import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, ExternalLinkIcon } from "@/lib/icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Partner werden",
  description:
    "Wie eine Partnerschaft mit VoltFM aussieht und wie du anfragst: per Ticket im Discord.",
  alternates: { canonical: "/partner-werden" },
};

/**
 * Nur was es tatsaechlich gibt: eine Seite unter /partner, die das Team im
 * Admin pflegt. Angefragt wird per Discord-Ticket — es gibt kein Formular.
 */
export default function PartnerWerdenPage() {
  return (
    <>
      <PageHeader
        title="Partner werden"
        description="Du streamst oder hast ein Projekt und willst mit VoltFM zusammenarbeiten? So läuft das."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/partner", label: "Partner" },
          { href: "/partner-werden", label: "Partner werden" },
        ]}
        size="large"
      />

      <section className="shell pt-2">
        <div className="grid gap-2 lg:grid-cols-12">
          <div className="surface-card flex flex-col gap-5 rounded-[var(--radius)] p-6 sm:p-10 lg:col-span-7">
            <p className="font-meta text-muted">was du bekommst</p>
            <h2 className="font-display text-[2rem] text-foreground sm:text-4xl">Eine eigene Partnerseite</h2>
            <p className="max-w-2xl leading-relaxed text-muted">
              Jeder Partner steht auf unserer{" "}
              <Link href="/partner" className="font-semibold text-foreground underline underline-offset-4">
                Partnerseite
              </Link>{" "}
              und bekommt dort eine eigene Unterseite.
            </p>
            <ul className="grid gap-2 sm:grid-cols-3">
              {[
                { title: "Logo", text: "Dein Logo auf der Übersicht und auf deiner Seite." },
                { title: "Text", text: "Ein paar Sätze dazu, wer du bist und was du machst." },
                { title: "Links", text: "Deine Kanäle, zum Beispiel Stream, Website oder Social Media." },
              ].map((item) => (
                <li key={item.title} className="well flex flex-col gap-2 rounded-[var(--radius)] p-4">
                  <span className="font-wide font-bold text-foreground">{item.title}</span>
                  <span className="text-sm leading-relaxed text-muted">{item.text}</span>
                </li>
              ))}
            </ul>
            <p className="max-w-2xl leading-relaxed text-muted">
              Eingetragen und gepflegt wird die Seite vom VoltFM-Team. Ändert sich bei dir
              etwas, sag uns Bescheid, und wir passen sie an.
            </p>
          </div>

          <div className="display-panel display-dots flex flex-col items-start gap-6 rounded-[var(--radius)] p-6 sm:p-10 lg:col-span-5">
            <p className="flex items-center gap-2 font-meta text-display-muted">
              <span className="led" aria-hidden="true" />
              anfrage / discord
            </p>
            <h2 className="font-display text-[2rem] text-balance text-display-foreground sm:text-4xl">
              So fragst du an
            </h2>
            <ol className="flex w-full flex-col gap-2">
              {[
                "Tritt dem VoltFM-Discord bei.",
                `Geh in den ${site.supportChannelHint} und öffne ein Ticket.`,
                "Erzähl kurz, wer du bist, und schick die Links zu deinen Kanälen mit.",
              ].map((step, index) => (
                <li key={step} className="flex gap-4 rounded-[3px] border border-white/10 p-4">
                  <span className="font-dot text-xl leading-none text-volt">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-relaxed text-display-foreground">{step}</span>
                </li>
              ))}
            </ol>
            <ButtonLink href={site.discordUrl} external variant="primary">
              <Icon icon={DiscordIcon} />
              Ticket im Discord öffnen
              <Icon icon={ExternalLinkIcon} />
            </ButtonLink>
            <p className="text-sm text-display-muted">Ein Formular dafür gibt es nicht.</p>
          </div>
        </div>
      </section>
    </>
  );
}
