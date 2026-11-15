import Link from "next/link";
import { cn } from "@heroui/react";

/**
 * Der Kopf eines Abschnitts: Ueberschrift, ein Satz, rechts ein schlichter
 * Textlink "Alle …". Der Link bleibt Text — Knoepfe sind fuer das, was man
 * tatsaechlich tut (hoeren, beitreten).
 */
export function SectionHeader({
  title,
  description,
  action,
  id,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  action?: { href: string; label: string };
  /** Fuer aria-labelledby am Abschnitt. */
  id?: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        <h2
          id={id}
          className="font-display text-balance text-3xl leading-[1.02] text-foreground sm:text-4xl"
        >
          {title}
        </h2>
        {description && <p className="mt-3 text-pretty text-base text-muted">{description}</p>}
      </div>

      {action && (
        <Link
          href={action.href}
          className="shrink-0 self-start rounded-sm text-sm font-semibold text-foreground underline decoration-accent-text decoration-2 underline-offset-4 transition-colors hover:decoration-foreground sm:self-auto"
        >
          {action.label}
        </Link>
      )}
    </header>
  );
}
