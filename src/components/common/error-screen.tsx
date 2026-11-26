import Link from "next/link";

/**
 * Gemeinsamer Aufbau fuer 404 und Fehlerseite: links ein Display, auf dem die
 * Kennung in Punktmatrix steht wie ein Senderdisplay ohne Signal, daneben die
 * Platte mit Ueberschrift und Ausweg, darunter die Verweise als Tastenreihe.
 * So laufen beide Seiten nicht auseinander.
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
    <section className="shell pt-2">
      <div className="grid gap-2 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div
          aria-hidden="true"
          className="display-panel display-dots flex min-h-56 flex-col justify-between gap-6 rounded-[var(--radius)] p-6 sm:min-h-80 sm:p-8"
        >
          <p className="flex items-center gap-2 font-meta text-display-muted">
            <span className="led" />
            kein signal
          </p>
          <p className="font-dot text-[4.5rem] leading-none break-words text-volt sm:text-[7.5rem]">
            {code}
          </p>
          <p className="font-dot text-base text-display-muted">voltfm.xyz</p>
        </div>

        <div className="surface-card flex flex-col justify-center rounded-[var(--radius)] p-6 sm:p-10">
          <h1 className="max-w-3xl font-display text-[2.4rem] text-balance text-foreground sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted">{lead}</p>

          <div className="mt-8 flex flex-wrap gap-3">{actions}</div>

          {footer}
        </div>

        <nav aria-label="Weitere Bereiche" className="surface-card rounded-[var(--radius)] p-2 lg:col-span-2">
          <p className="px-3 pt-2 pb-3 font-meta text-muted">Oder weiter zu</p>
          <ul className="well flex flex-wrap gap-2 rounded-[3px] p-2.5">
            {links.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="key inline-flex rounded-[var(--radius)] bg-surface px-3.5 py-1.5 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-volt hover:text-graphite"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
