import Link from "next/link";
import { cn } from "@heroui/react";

/**
 * Der Kopf eines Abschnitts wie in einer Zeitung: eine kraeftige Linie aus
 * Tinte, darunter die Ueberschrift schmal und schwer, rechts ein schlichter
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
        "mb-8 flex flex-col gap-3 border-t-4 border-border pt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div className="min-w-0 max-w-3xl">
        <h2 id={id} className="font-display text-[2.6rem] text-balance text-foreground sm:text-6xl">
          {title}
        </h2>
        {description && <p className="mt-3 text-pretty text-base text-muted">{description}</p>}
      </div>

      {action && (
        <Link
          href={action.href}
          className="shrink-0 self-start font-wide text-sm font-bold text-foreground underline decoration-2 underline-offset-4 transition-colors hover:bg-volt hover:text-ink hover:no-underline sm:self-auto"
        >
          {action.label}
        </Link>
      )}
    </header>
  );
}
