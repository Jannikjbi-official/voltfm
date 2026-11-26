import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, ClockIcon, NewsIcon, WarningIcon, SendIcon } from "@/lib/icons";
import { operator, site } from "@/lib/site";
import { ContactForm } from "./contact-form";
import { TicketPanel } from "./ticket-panel";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Feedback, Kooperationen oder Presseanfragen: So erreichst du die VoltFM Redaktion.",
  alternates: { canonical: "/kontakt" },
};

const card = "surface-card flex flex-col items-start gap-3 rounded-[var(--radius)] p-5 sm:p-6";
const iconTile = "well grid size-11 place-items-center rounded-[var(--radius)] text-foreground";
const cardTitle = "font-wide text-xl font-bold text-foreground";
const cardText = "text-sm leading-relaxed text-muted";

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

      <section className="shell flex flex-col gap-2 pt-2">
        {site.mailOutage && (
          <div
            role="status"
            className="surface-card flex flex-col gap-4 rounded-[var(--radius)] border-l-4 border-l-warning p-5 sm:flex-row sm:items-start sm:p-6"
          >
            <span
              aria-hidden="true"
              className="key grid size-11 shrink-0 place-items-center rounded-[var(--radius)] bg-warning text-warning-foreground active:translate-y-0"
            >
              <Icon icon={WarningIcon} />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-meta text-muted">
                <span className="led" aria-hidden="true" />
                störung
              </p>
              <h2 className="mt-1 font-wide text-lg font-bold text-foreground">
                Unsere E-Mail ist gerade nicht erreichbar
              </h2>
              <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-foreground">
                Unser Mailserver ist ausgefallen: Nachrichten an{" "}
                <strong className="break-words">{site.stationEmail}</strong> und{" "}
                <strong className="break-words">{site.legacyEmail}</strong> kommen derzeit{" "}
                <strong>nicht</strong> bei uns an. Wir richten gerade einen neuen
                Anbieter ein. Nimm für alles Alltägliche den Discord — dort geht
                nichts verloren.
              </p>
            </div>
          </div>
        )}

        {site.contactFormEnabled ? <ContactForm /> : <TicketPanel />}

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className={card}>
            <span aria-hidden="true" className={iconTile}>
              <Icon icon={DiscordIcon} />
            </span>
            <h2 className={cardTitle}>Warum über Discord?</h2>
            <p className={cardText}>
              Wir sind ein kleines Team und kein Callcenter. Im Discord sieht
              eine Anfrage jeder von uns, statt in einem Postfach zu liegen, in
              das gerade niemand schaut.
            </p>
            <ButtonLink href={site.discordUrl} external variant="tertiary" size="sm" className="mt-auto">
              <Icon icon={DiscordIcon} />
              Discord öffnen
            </ButtonLink>
          </div>

          <div className={card}>
            <span aria-hidden="true" className={iconTile}>
              <Icon icon={ClockIcon} />
            </span>
            <h2 className={cardTitle}>Wie lange dauert es?</h2>
            <p className={cardText}>
              Wir sind ein kleines Team und machen VoltFM neben Schule, Studium
              und Job. Rechne mit ein paar Tagen — aber wir antworten wirklich.
            </p>
          </div>

          <div className={card}>
            <span aria-hidden="true" className={iconTile}>
              <Icon icon={SendIcon} />
            </span>
            <h2 className={cardTitle}>E-Mail</h2>
            <p className={cardText}>
              Für Rechtliches, Datenschutz und alles, was schriftlich sein muss,
              erreichst du uns unter{" "}
              <a
                href={`mailto:${operator.email}`}
                className="rounded-sm font-semibold break-words text-foreground underline decoration-accent-text decoration-2 underline-offset-4"
              >
                {operator.email}
              </a>
              . Diese Adresse funktioniert, auch während unser eigener
              Mailserver ausfällt.
            </p>
          </div>

          <div className={card}>
            <span aria-hidden="true" className={iconTile}>
              <Icon icon={NewsIcon} />
            </span>
            <h2 className={cardTitle}>Presse</h2>
            <p className={cardText}>
              Für Interviews und Pressematerial öffne bitte ein Ticket mit dem
              Stichwort &bdquo;Presse&ldquo;. Wir melden uns dort mit allem, was du
              brauchst.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
