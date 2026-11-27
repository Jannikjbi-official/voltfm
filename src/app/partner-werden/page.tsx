import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, ExternalLinkIcon } from "@/lib/icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Partner werden",
  description:
    "Wie eine Partnerschaft mit VoltFM aussieht und wie du dich bewirbst: über das VoltFM-Portal.",
  alternates: { canonical: "/partner-werden" },
};

/**
 * Nur was es tatsaechlich gibt: eine Seite unter /partner, die das Team im
 * Admin pflegt. Beworben wird ueber das VoltFM-Portal (site.portalUrl).
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
              bewerbung / portal
            </p>
            <h2 className="font-display text-[2rem] text-balance text-display-foreground sm:text-4xl">
              So bewirbst du dich
            </h2>
            <ol className="flex w-full flex-col gap-2">
              {[
                "Öffne das VoltFM-Portal und melde dich mit deinem Discord-Konto an.",
                "Wähl die Bewerbung als Partner und erzähl kurz, wer du bist. Schick die Links zu deinen Kanälen mit.",
                "Wir melden uns bei dir. Wie es steht, siehst du jederzeit im Portal.",
              ].map((step, index) => (
                <li key={step} className="flex gap-4 rounded-[3px] border border-white/10 p-4">
                  <span className="font-dot text-xl leading-none text-volt">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-relaxed text-display-foreground">{step}</span>
                </li>
              ))}
            </ol>
            <ButtonLink href={site.portalUrl} external variant="primary">
              Zum Portal
              <Icon icon={ExternalLinkIcon} />
            </ButtonLink>
            <p className="text-sm text-display-muted">
              Vorher eine Frage?{" "}
              <a
                href={site.discordUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 font-semibold text-display-foreground underline underline-offset-4"
              >
                <Icon icon={DiscordIcon} />
                Schreib uns im Discord
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
