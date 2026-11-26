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
    <div
      data-theme="dark"
      className="dark relative flex flex-col gap-8 overflow-hidden rounded-[var(--radius)] border border-border bg-surface p-7 text-foreground shadow-[var(--lift-shadow)] sm:p-12"
    >
      <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="flex max-w-2xl flex-col items-start gap-5">
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-2xl bg-volt text-2xl text-ink"
          >
            <Icon icon={DiscordIcon} />
          </span>

          <h2 className="font-display text-[2.1rem] text-balance text-foreground sm:text-5xl">
            Schreib uns ein Ticket im Discord
          </h2>

          <p className="text-lg leading-relaxed text-muted">
            Unser Kontaktformular ist abgeschaltet. Alles läuft über unseren Discord —
            dort liest nicht nur eine Person mit, sondern das ganze Team, und du
            bekommst meistens noch am selben Tag eine Antwort.
          </p>
        </div>

        <ButtonLink href={site.discordUrl} external variant="primary" size="lg" className="shrink-0">
          <Icon icon={DiscordIcon} />
          Ticket im Discord öffnen
          <Icon icon={ExternalLinkIcon} />
        </ButtonLink>
      </div>

      <ol className="grid gap-3 md:grid-cols-3">
        {[
          "Tritt dem VoltFM-Discord bei (dauert einen Klick, kein Konto nötig, das du nicht schon hast).",
          `Geh in den ${site.supportChannelHint} und öffne ein Ticket.`,
          "Beschreib dein Anliegen — wir melden uns dort bei dir.",
        ].map((step, index) => (
          <li key={step} className="flex flex-col gap-4 rounded-2xl bg-default p-5">
            <span className="grid size-9 place-items-center rounded-xl bg-volt font-mono text-sm font-semibold text-ink">
              {index + 1}
            </span>
            <span className="leading-relaxed text-foreground">{step}</span>
          </li>
        ))}
      </ol>

      <p className="max-w-3xl text-sm leading-relaxed text-muted">
        Kein Discord? Für Rechtliches und Datenschutz erreichst du uns unter{" "}
        <a
          href={`mailto:${operator.email}`}
          className="rounded-sm font-semibold break-all text-volt underline-offset-4 hover:underline"
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
