import { Breadcrumbs } from "./breadcrumbs";

export type Crumb = { href: string; label: string };

/**
 * Der Kopf jeder Unterseite: Brotkrumen, die Ueberschrift gross und eng
 * gesetzt, ein Satz darunter, rechts optional etwas daneben (Knopf, Zahl).
 *
 * Kein Etikett ueber der Ueberschrift — die Brotkrumen sagen schon, wo man ist.
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  aside,
  size = "default",
  children,
}: {
  title: string;
  description?: React.ReactNode;
  breadcrumbs?: Crumb[];
  aside?: React.ReactNode;
  /** "large" fuer Uebersichtsseiten, "default" fuer Detailseiten. */
  size?: "default" | "large";
  children?: React.ReactNode;
}) {
  return (
    <header>
      <div className="shell pt-10 pb-10 sm:pt-14 sm:pb-14">
        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-4xl">
            <h1
              className={
                /* Lange deutsche Woerter ("Datenschutzerklärung") passen
                   am Handy nicht immer in eine Zeile. */
                size === "large"
                  ? "font-display text-[2.9rem] text-balance break-words hyphens-auto text-foreground sm:text-7xl lg:text-8xl"
                  : "font-display text-[2.4rem] text-balance break-words hyphens-auto text-foreground sm:text-6xl"
              }
            >
              {title}
            </h1>
            {description && (
              <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted">{description}</p>
            )}
            {children}
          </div>
          {aside && <div className="flex shrink-0 flex-wrap items-center gap-3">{aside}</div>}
        </div>
      </div>
    </header>
  );
}
