import Link from "next/link";

/**
 * Gemeinsamer Aufbau fuer 404 und Fehlerseite: eine dunkle Platte, die
 * Kennung gross auf Gelb, darunter Ausweg und Verweise. So laufen beide
 * Seiten nicht auseinander.
 */
export function ErrorScreen({
  code,
  title,
  lead,
  actions,
  links,
  footer,
}: {
  code: string;
  title: string;
  lead: string;
  actions: React.ReactNode;
  links: { href: string; label: string }[];
  footer?: React.ReactNode;
}) {
  return (
    /* Eine dunkle Platte mit runden Ecken wie der Footer — eingerueckt statt
       randlos, damit sie zur Seite gehoert und nicht wie ein Absturz wirkt. */
    <section className="px-3 pt-4 sm:pt-8">
      <div
        data-theme="dark"
        className="dark rounded-[2rem] border border-border bg-surface text-foreground shadow-[var(--lift-shadow)]"
      >
        <div className="shell py-16 sm:py-24">
          <p
            aria-hidden="true"
            className="inline-flex rounded-[1.75rem] bg-volt px-5 pt-3 pb-2 font-display text-[4.5rem] leading-none text-ink sm:rounded-[2.5rem] sm:px-8 sm:pt-5 sm:pb-4 sm:text-[8rem]"
          >
            {code}
          </p>
          <h1 className="mt-8 max-w-3xl font-display text-[2.4rem] text-balance text-foreground sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted">{lead}</p>

          <div className="mt-9 flex flex-wrap gap-3">{actions}</div>

          <nav aria-label="Weitere Bereiche" className="mt-12 rounded-3xl bg-surface-secondary p-5 sm:p-6">
            <p className="text-sm font-semibold text-muted">Oder weiter zu</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex rounded-full bg-default px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-volt hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {footer}
        </div>
      </div>
    </section>
  );
}
