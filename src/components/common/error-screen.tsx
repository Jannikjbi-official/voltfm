import Link from "next/link";

/**
 * Gemeinsamer Aufbau fuer 404 und Fehlerseite: eine dunkle Flaeche wie die
 * Buehne, gross die Kennung, darunter Ausweg und Verweise. So laufen beide
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
    <section data-theme="dark" className="dark bg-ink text-foreground">
      <div className="shell py-20 sm:py-28">
        <p
          aria-hidden="true"
          className="font-display text-[5.5rem] leading-none text-volt sm:text-[9rem]"
        >
          {code}
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.02] text-balance text-paper sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-paper/75">{lead}</p>

        <div className="mt-9 flex flex-wrap gap-3">{actions}</div>

        <nav aria-label="Weitere Bereiche" className="mt-14 border-t border-white/10 pt-8">
          <p className="text-sm text-muted">Oder weiter zu</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {links.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-white/10"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {footer}
      </div>
    </section>
  );
}
