import Link from "next/link";
import { cn } from "@heroui/react";
import { Icon, type IconDefinition } from "@/lib/icons";
import type { ArticleStatus } from "@/types/content";

/*
 * Bausteine fuer die Admin-Seiten — bewusst ohne Hooks, damit die Seiten
 * Server-Komponenten bleiben koennen. Farben kommen aus den Theme-Tokens.
 *
 * Das Admin ist ein Arbeitsplatz am Geraet, keine Lesestrecke: Platten mit
 * abgesetzter Kopfzeile, Kennzahlen auf eingelassenen Displays, Tabellen mit
 * Gehaeuse-Beschriftung (font-meta) und Status als LED.
 */

/** Kopf einer Admin-Seite: Titel, ein Satz darunter, rechts die Aktionen. */
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-separator pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[2.25rem] text-balance break-words hyphens-auto text-foreground sm:text-5xl">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-pretty text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Eine Platte mit abgesetzter Kopfzeile (Titel links, Aktion rechts). */
export function AdminPanel({
  title,
  titleId,
  description,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  titleId?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn("surface-card min-w-0 overflow-hidden rounded-[var(--radius)]", className)}
    >
      {(title || action) && (
        <div className="flex min-h-13 items-center justify-between gap-4 border-b border-separator bg-surface-secondary/50 px-4 py-2.5 sm:px-5">
          <div className="min-w-0">
            {title && (
              <h2 id={titleId} className="font-wide text-[0.95rem] font-bold text-foreground">
                {title}
              </h2>
            )}
            {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/**
 * Eine Kennzahl als kleines Modul: oben die Beschriftung, darunter ein
 * eingelassenes Display mit der Zahl in Punktmatrix — optional als Link.
 */
export function StatCard({
  label,
  value,
  icon,
  href,
  hint,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  icon: IconDefinition;
  href?: string;
  hint?: React.ReactNode;
  /** Die eine Kennzahl, die zaehlt: gelbe Ziffern und eine LED. */
  accent?: boolean;
}) {
  const body = (
    <>
      <span className="flex items-center justify-between gap-3 px-1">
        <span className="truncate font-meta text-muted">{label}</span>
        <Icon icon={icon} aria-hidden="true" className="shrink-0 text-[0.7rem] text-muted" />
      </span>
      <span className="display-panel display-dots relative mt-2 flex min-h-[4.75rem] items-end rounded-[calc(var(--radius)-2px)] px-3.5 pt-5 pb-3 sm:min-h-[5.5rem]">
        {accent && <span aria-hidden="true" className="led absolute top-3 right-3" />}
        <span
          className={cn(
            "block min-w-0 font-dot text-[2.5rem] leading-none sm:text-[3rem]",
            accent ? "text-volt" : "text-display-foreground",
          )}
        >
          {value}
        </span>
      </span>
      {hint && <span className="mt-2 block truncate px-1 text-xs text-muted">{hint}</span>}
    </>
  );

  const className = cn(
    "surface-card block h-full rounded-[var(--radius)] p-2 pt-2.5 text-foreground",
    href && "hover-lift",
  );

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** Bezeichnung links, Wert rechts — am Handy untereinander. */
export function DataList({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="divide-y divide-separator">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        >
          <dt className="shrink-0 font-meta text-muted">{row.label}</dt>
          <dd className="min-w-0 text-sm font-medium break-words text-foreground sm:text-right">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type ChipColor = "default" | "accent" | "success" | "warning" | "danger";

/** LED-Farben: ein Punkt mit Fassung, kein Leuchten. */
export const DOT: Record<ChipColor, string> = {
  default: "bg-muted ring-muted/25",
  accent: "bg-volt ring-volt/35",
  success: "bg-success ring-success/25",
  warning: "bg-warning ring-warning/30",
  danger: "bg-danger ring-danger/25",
};

/** Status als LED mit Beschriftung — liest sich in Tabellen ruhiger als bunte Chips. */
export function StatusBadge({
  color = "default",
  children,
  className,
}: {
  color?: ChipColor;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-[3px] border border-border bg-surface-secondary px-2 py-0.5 font-mono text-[0.7rem] whitespace-nowrap text-foreground lowercase",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-[7px] shrink-0 rounded-full ring-2", DOT[color])} />
      {children}
    </span>
  );
}

export const ARTICLE_STATUS: Record<ArticleStatus, { label: string; color: ChipColor }> = {
  published: { label: "Veröffentlicht", color: "success" },
  draft: { label: "Entwurf", color: "default" },
  scheduled: { label: "Geplant", color: "accent" },
  archived: { label: "Archiviert", color: "warning" },
};

export function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  const entry = ARTICLE_STATUS[status] ?? { label: status, color: "default" as const };
  return <StatusBadge color={entry.color}>{entry.label}</StatusBadge>;
}

/** Ein Hinweis-Kasten fuer Server-Seiten (ohne Live-Region). */
export function AdminNotice({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className="surface-card mb-2 flex gap-3 rounded-[var(--radius)] p-4 text-sm leading-relaxed text-foreground"
    >
      <span aria-hidden="true" className={cn("mt-1.5 size-2 shrink-0 rounded-full ring-2", DOT.warning)} />
      <div className="min-w-0">
        {title && <p className="mb-1 font-wide font-bold">{title}</p>}
        <div className="text-foreground/85 [&_code]:rounded-[3px] [&_code]:bg-surface-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Leerer Zustand oder Meldung in einer Mulde — statt gestrichelter Rahmen. */
export const emptyWellClass = "well rounded-[var(--radius)] px-6 py-10 text-center text-sm text-muted";

/* --- Filter-Tasten ---------------------------------------------------------
   Eine Tastenreihe in einer Mulde, wie oben im Header der Website: Die aktive
   Taste ist gelb und gedrueckt. Gleiche Optik fuer Links (News-Status ueber
   searchParams) und Knoepfe (Filter im Browser, z. B. Benutzer und Medien). */

/** Die Mulde um die Tasten. Scrollt am Handy waagerecht in sich. */
export const filterRowClass =
  "well flex max-w-full gap-1 overflow-x-auto rounded-[var(--radius)] p-1 pb-1.5 [scrollbar-width:thin]";

export function filterPillClass(active: boolean) {
  return cn(
    "inline-flex shrink-0 items-center gap-2 rounded-[calc(var(--radius)-2px)] py-1.5 pr-1.5 pl-3 font-wide text-sm font-semibold whitespace-nowrap transition-colors",
    active ? "key bg-volt text-graphite" : "text-muted hover:bg-surface hover:text-foreground",
  );
}

/** Die Zahl rechts auf der Taste. */
export function PillCount({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "min-w-6 rounded-[3px] px-1.5 py-0.5 text-center font-mono text-[0.7rem] font-medium tabular-nums",
        active ? "bg-graphite/15 text-graphite" : "bg-default text-muted",
      )}
    >
      {children}
    </span>
  );
}

/* --- Tabellen -------------------------------------------------------------
   Native <table> mit Tailwind: liest sich als Tabelle fuer Screenreader,
   bleibt Server-Komponente, und scrollt am Handy waagerecht in sich.
   Die Tabelle ist eine Platte, die Spaltenkoepfe sind Gehaeuse-Beschriftung. */

/* Am Handy blenden die Tabellen Nebenspalten aus (`hidden sm:table-cell`)
   und zeigen das Wichtigste unter dem Titel — so passt alles ohne seitliches
   Scrollen. Der Rahmen scrollt trotzdem in sich, falls es einmal eng wird. */
export function AdminTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    /* relative: sonst entkommen absolut positionierte Kinder (sr-only)
       dem scrollenden Rahmen und verbreitern am Handy die ganze Seite. */
    <div className={cn("surface-card relative overflow-x-auto rounded-[var(--radius)]", className)}>
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-border bg-surface-secondary/60 px-4 py-2.5 font-meta font-normal whitespace-nowrap text-muted",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("border-b border-separator px-4 py-3 align-middle", className)}>{children}</td>;
}

/** Zeile, die beim Ueberfahren hervorgehoben wird; die letzte ohne Linie. */
export const trClass = "transition-colors hover:bg-surface-secondary/60 [&:last-child>td]:border-b-0";
