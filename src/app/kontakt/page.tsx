import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon } from "@/lib/icons";
import { operator, site } from "@/lib/site";
import { ContactForm } from "./contact-form";
import { TicketPanel } from "./ticket-panel";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Feedback, Kooperationen oder Presseanfragen: So erreichst du die VoltFM Redaktion.",
  alternates: { canonical: "/kontakt" },
};

const sideBlock = "flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-6";
const sideTitle = "font-wide text-lg font-bold text-foreground";
const sideText = "text-sm leading-relaxed text-muted";

export default function KontaktPage() {
  return (
    <>
      <PageHeader
        title="Schreib uns"
        description="Feedback, Songwünsche, Kooperationen oder eine Presseanfrage — am schnellsten geht es über ein Ticket in unserem Discord."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/kontakt", label: "Kontakt" },
        ]}
      />

      <section className="shell py-14 sm:py-20">
        {site.mailOutage && (
          <div
            role="status"
            className="mb-10 rounded-2xl border border-warning/40 bg-warning-soft p-5 sm:p-6"
          >
            <h2 className="font-wide text-base font-bold text-foreground">
              Unsere E-Mail ist gerade nicht erreichbar
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              Unser Mailserver ist ausgefallen: Nachrichten an{" "}
              <strong>{site.stationEmail}</strong> und{" "}
              <strong>{site.legacyEmail}</strong> kommen derzeit{" "}
              <strong>nicht</strong> bei uns an. Wir richten gerade einen neuen
              Anbieter ein. Nimm für alles Alltägliche den Discord — dort geht
              nichts verloren.
            </p>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            {site.contactFormEnabled ? <ContactForm /> : <TicketPanel />}
          </div>

          <aside className="flex flex-col gap-4 self-start">
            <div className={sideBlock}>
              <h2 className={sideTitle}>Warum über Discord?</h2>
              <p className={sideText}>
                Wir sind ein kleines Team und kein Callcenter. Im Discord sieht
                eine Anfrage jeder von uns, statt in einem Postfach zu liegen, in
                das gerade niemand schaut.
              </p>
              <ButtonLink href={site.discordUrl} external variant="secondary" size="sm">
                <Icon icon={DiscordIcon} />
                Discord öffnen
              </ButtonLink>
            </div>

            <div className={sideBlock}>
              <h2 className={sideTitle}>Wie lange dauert es?</h2>
              <p className={sideText}>
                Wir sind ein kleines Team und machen VoltFM neben Schule, Studium
                und Job. Rechne mit ein paar Tagen — aber wir antworten wirklich.
              </p>
            </div>

            <div className={sideBlock}>
              <h2 className={sideTitle}>E-Mail</h2>
              <p className={sideText}>
                Für Rechtliches, Datenschutz und alles, was schriftlich sein muss,
                erreichst du uns unter{" "}
                <a
                  href={`mailto:${operator.email}`}
                  className="rounded-sm font-semibold break-all text-foreground underline decoration-accent-text decoration-2 underline-offset-4"
                >
                  {operator.email}
                </a>
                . Diese Adresse funktioniert, auch während unser eigener
                Mailserver ausfällt.
              </p>
            </div>

            <div className={sideBlock}>
              <h2 className={sideTitle}>Presse</h2>
              <p className={sideText}>
                Für Interviews und Pressematerial öffne bitte ein Ticket mit dem
                Stichwort &bdquo;Presse&ldquo;. Wir melden uns dort mit allem, was du
                brauchst.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
