import { cn } from "@heroui/react";
import { Breadcrumbs } from "./breadcrumbs";

export type Crumb = { href: string; label: string };

/**
 * Der Kopf jeder Unterseite: Brotkrumen, grosse breite Ueberschrift, ein
 * Satz darunter, optional etwas rechts daneben (Knopf, Zahl).
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
    <header className="border-b border-separator">
      <div className="shell pt-8 pb-10 sm:pt-10 sm:pb-14">
        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-3xl">
            <h1
              className={cn(
                "font-display text-balance text-foreground",
                size === "large"
                  ? "text-[2.5rem] leading-[0.95] sm:text-6xl lg:text-7xl"
                  : "text-[2rem] leading-[1.02] sm:text-5xl",
              )}
            >
              {title}
            </h1>
            {description && (
              <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted">
                {description}
              </p>
            )}
            {children}
          </div>
          {aside && <div className="flex shrink-0 flex-wrap items-center gap-3">{aside}</div>}
        </div>
      </div>
    </header>
  );
}
