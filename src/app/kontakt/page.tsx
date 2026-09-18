import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon } from "@/lib/icons";
import { operator, site } from "@/lib/site";
import { ContactForm } from "./contact-form";
import { TicketPanel } from "./ticket-panel";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Feedback, Kooperationen oder Presseanfragen: So erreichst du die VoltFM Redaktion.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <>
      <PageHeader
        eyebrow="Kontakt"
        title="Schreib uns"
        description="Feedback, Songwünsche, Kooperationen oder eine Presseanfrage — am schnellsten geht es über ein Ticket in unserem Discord."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/kontakt", label: "Kontakt" },
        ]}
      />

      <section className="section shell">
        {site.mailOutage && (
          <div className={styles.notice} role="status">
            <h2 className={styles.noticeTitle}>Unsere E-Mail ist gerade nicht erreichbar</h2>
            <p className={styles.noticeText}>
              Unser Mailserver ist ausgefallen: Nachrichten an{" "}
              <strong>{site.stationEmail}</strong> und{" "}
              <strong>{site.legacyEmail}</strong> kommen derzeit{" "}
              <strong>nicht</strong> bei uns an. Wir richten gerade einen neuen
              Anbieter ein. Nimm für alles Alltägliche den Discord — dort geht
              nichts verloren.
            </p>
          </div>
        )}

        <div className={styles.layout}>
          <div className={styles.formColumn}>
            {site.contactFormEnabled ? <ContactForm /> : <TicketPanel />}
          </div>

          <aside className={styles.side}>
            <div className={styles.sideBlock}>
              <h2 className={styles.sideTitle}>Warum über Discord?</h2>
              <p className={styles.sideText}>
                Wir sind ein kleines Team und kein Callcenter. Im Discord sieht
                eine Anfrage jeder von uns, statt in einem Postfach zu liegen, in
                das gerade niemand schaut.
              </p>
              <ButtonLink
                href={site.discordUrl}
                external
                variant="primary"
                mode="stroke"
                size="sm"
              >
                <Icon icon={DiscordIcon} />
                Discord öffnen
              </ButtonLink>
            </div>

            <div className={styles.sideBlock}>
              <h2 className={styles.sideTitle}>Wie lange dauert es?</h2>
              <p className={styles.sideText}>
                Wir sind ein kleines Team und machen VoltFM neben Schule, Studium
                und Job. Rechne mit ein paar Tagen — aber wir antworten wirklich.
              </p>
            </div>

            <div className={styles.sideBlock}>
              <h2 className={styles.sideTitle}>E-Mail</h2>
              <p className={styles.sideText}>
                Für Rechtliches, Datenschutz und alles, was schriftlich sein muss,
                erreichst du uns unter{" "}
                <a href={`mailto:${operator.email}`} className={styles.sideLink}>
                  {operator.email}
                </a>
                . Diese Adresse funktioniert, auch während unser eigener
                Mailserver ausfällt.
              </p>
            </div>

            <div className={styles.sideBlock}>
              <h2 className={styles.sideTitle}>Presse</h2>
              <p className={styles.sideText}>
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
