import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, ExternalLinkIcon } from "@/lib/icons";
import { operator, site } from "@/lib/site";
import styles from "./page.module.css";

/**
 * Was an der Stelle des Kontaktformulars steht, solange es abgeschaltet ist.
 *
 * Anfragen laufen ueber ein Ticket im Discord: dort sieht sie das ganze Team,
 * es kann sofort jemand antworten, und es geht nichts unter, weil niemand in
 * die Datenbank schaut. Das Formular ist nicht geloescht, sondern ueber
 * `site.contactFormEnabled` deaktiviert.
 */
export function TicketPanel() {
  return (
    <div className={styles.ticket}>
      <span className={styles.ticketIcon} aria-hidden="true">
        <Icon icon={DiscordIcon} />
      </span>

      <h2 className={styles.ticketTitle}>Schreib uns ein Ticket im Discord</h2>

      <p className={styles.ticketText}>
        Unser Kontaktformular ist abgeschaltet. Alles läuft über unseren Discord —
        dort liest nicht nur eine Person mit, sondern das ganze Team, und du
        bekommst meistens noch am selben Tag eine Antwort.
      </p>

      <ol className={styles.ticketSteps}>
        <li>Tritt dem VoltFM-Discord bei (dauert einen Klick, kein Konto nötig, das du nicht schon hast).</li>
        <li>Geh in den {site.supportChannelHint} und öffne ein Ticket.</li>
        <li>Beschreib dein Anliegen — wir melden uns dort bei dir.</li>
      </ol>

      <ButtonLink href={site.discordUrl} external variant="primary" mode="filled" size="lg">
        <Icon icon={DiscordIcon} />
        Ticket im Discord öffnen
        <Icon icon={ExternalLinkIcon} />
      </ButtonLink>

      <p className={styles.ticketFallback}>
        Kein Discord? Für Rechtliches und Datenschutz erreichst du uns unter{" "}
        <a href={`mailto:${operator.email}`} className={styles.sideLink}>
          {operator.email}
        </a>
        . Unsere Adressen auf {site.stationEmail.split("@")[1]} und{" "}
        {site.legacyEmail.split("@")[1]} sind wegen eines Serverausfalls gerade
        nicht erreichbar.
      </p>
    </div>
  );
}
