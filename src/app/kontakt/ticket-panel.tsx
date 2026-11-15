import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, ExternalLinkIcon } from "@/lib/icons";
import { operator, site } from "@/lib/site";

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
    <div className="flex flex-col items-start gap-5 rounded-3xl border border-border bg-surface p-6 sm:p-10">
      <span
        aria-hidden="true"
        className="grid size-14 place-items-center rounded-2xl bg-volt text-2xl text-ink"
      >
        <Icon icon={DiscordIcon} />
      </span>

      <h2 className="font-display text-2xl leading-tight text-balance text-foreground sm:text-3xl">
        Schreib uns ein Ticket im Discord
      </h2>

      <p className="max-w-xl leading-relaxed text-muted">
        Unser Kontaktformular ist abgeschaltet. Alles läuft über unseren Discord —
        dort liest nicht nur eine Person mit, sondern das ganze Team, und du
        bekommst meistens noch am selben Tag eine Antwort.
      </p>

      <ol className="flex flex-col gap-3">
        {[
          "Tritt dem VoltFM-Discord bei (dauert einen Klick, kein Konto nötig, das du nicht schon hast).",
          `Geh in den ${site.supportChannelHint} und öffne ein Ticket.`,
          "Beschreib dein Anliegen — wir melden uns dort bei dir.",
        ].map((step, index) => (
          <li key={step} className="flex items-start gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-secondary text-xs font-bold text-foreground">
              {index + 1}
            </span>
            <span className="pt-0.5 text-foreground">{step}</span>
          </li>
        ))}
      </ol>

      <ButtonLink href={site.discordUrl} external variant="primary" size="lg">
        <Icon icon={DiscordIcon} />
        Ticket im Discord öffnen
        <Icon icon={ExternalLinkIcon} />
      </ButtonLink>

      <p className="text-sm leading-relaxed text-muted">
        Kein Discord? Für Rechtliches und Datenschutz erreichst du uns unter{" "}
        <a
          href={`mailto:${operator.email}`}
          className="rounded-sm font-semibold break-all text-foreground underline decoration-accent-text decoration-2 underline-offset-4"
        >
          {operator.email}
        </a>
        . Unsere Adressen auf {site.stationEmail.split("@")[1]} und{" "}
        {site.legacyEmail.split("@")[1]} sind wegen eines Serverausfalls gerade
        nicht erreichbar.
      </p>
    </div>
  );
}
