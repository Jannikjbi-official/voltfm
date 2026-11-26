import Link from "next/link";
import { cn } from "@heroui/react";

/**
 * Der Kopf eines Abschnitts: Ueberschrift gross und eng gesetzt, ein Satz
 * darunter, rechts ein Verweis "Alle …" als Taste. Darunter eine Fuge.
 * Knoepfe bleiben fuer das, was man tatsaechlich tut (hoeren, beitreten).
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
        "mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div className="min-w-0 max-w-3xl">
        <h2 id={id} className="font-display text-[2.1rem] text-balance text-foreground sm:text-5xl">
          {title}
        </h2>
        {description && <p className="mt-3 text-pretty text-base text-muted">{description}</p>}
      </div>

      {action && (
        <Link
          href={action.href}
          className="key inline-flex shrink-0 items-center self-start rounded-[var(--radius)] bg-surface px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-volt hover:text-graphite sm:self-auto"
        >
          {action.label}
        </Link>
      )}
    </header>
  );
}
