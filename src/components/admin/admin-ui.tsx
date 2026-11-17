import Link from "next/link";
import { cn } from "@heroui/react";
import { Icon, type IconDefinition } from "@/lib/icons";
import type { ArticleStatus } from "@/types/content";

/*
 * Bausteine fuer die Admin-Seiten — bewusst ohne Hooks, damit die Seiten
 * Server-Komponenten bleiben koennen. Farben kommen aus den Theme-Tokens.
 *
 * Das Admin ist eine Arbeitsoberflaeche, keine Lesestrecke: kompakte
 * Ueberschriften (font-wide statt font-display), Karten mit abgesetzter
 * Kopfzeile, Tabellen statt Listen.
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
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[2.25rem] text-balance text-foreground sm:text-5xl">
          {title}
        </h1>
        {description && <p className="mt-1.5 max-w-2xl text-pretty text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Eine Karte mit abgesetzter Kopfzeile (Titel links, Aktion rechts). */
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
      className={cn("surface-card overflow-hidden rounded-2xl", className)}
    >
      {(title || action) && (
        <div className="flex min-h-14 items-center justify-between gap-4 border-b border-separator px-5 py-3">
          <div className="min-w-0">
            {title && (
              <h2 id={titleId} className="text-sm font-bold text-foreground">
                {title}
              </h2>
            )}
            {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Eine Kennzahl als Kachel — optional als Link. */
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
  /** Gelbe Flaeche fuer die eine Kennzahl, die zaehlt. */
  accent?: boolean;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className={cn("text-sm", accent ? "text-ink/75" : "text-muted")}>{label}</span>
        <span
          aria-hidden="true"
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl text-xs max-[420px]:hidden",
            accent ? "bg-ink text-volt" : "bg-surface-secondary text-muted",
          )}
        >
          <Icon icon={icon} />
        </span>
      </div>
      {/* Grosse Einzelzahl: proportionale Ziffern, tabellarische nur in Spalten. */}
      <span className="mt-3 block font-display text-[2.25rem] sm:mt-4 sm:text-[2.75rem]">{value}</span>
      {hint && <span className={cn("mt-1 block text-xs", accent ? "text-ink/70" : "text-muted")}>{hint}</span>}
    </>
  );

  const className = cn(
    "block h-full rounded-2xl p-4 sm:p-5",
    accent ? "bg-volt text-ink" : "surface-card text-foreground",
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
          className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        >
          <dt className="shrink-0 text-sm text-muted">{row.label}</dt>
          <dd className="min-w-0 text-sm font-medium break-words text-foreground sm:text-right">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type ChipColor = "default" | "accent" | "success" | "warning" | "danger";

export const DOT: Record<ChipColor, string> = {
  default: "bg-muted",
  accent: "bg-volt",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

/** Status mit farbigem Punkt — liest sich in Tabellen ruhiger als bunte Chips. */
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
        "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-default px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-foreground",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", DOT[color])} />
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
      className="mb-6 flex gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--warning)_35%,transparent)] bg-[color-mix(in_oklab,var(--warning)_10%,transparent)] p-4 text-sm leading-relaxed text-foreground"
    >
      <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-warning" />
      <div className="min-w-0">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div className="text-foreground/85 [&_code]:rounded [&_code]:bg-surface-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]">
          {children}
        </div>
      </div>
    </div>
  );
}

/* --- Filter-Pillen ---------------------------------------------------------
   Gleiche Optik fuer Links (News-Status ueber searchParams) und Knoepfe
   (Filter im Browser, z. B. Benutzer und Medien). */

export function filterPillClass(active: boolean) {
  return cn(
    "inline-flex shrink-0 items-center gap-2 rounded-full py-1.5 pr-1.5 pl-3.5 text-sm font-medium transition-colors",
    active ? "bg-foreground text-background" : "bg-default text-foreground hover:bg-surface-tertiary",
  );
}

/** Die Zahl rechts in der Pille. */
export function PillCount({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "min-w-6 rounded-full px-1.5 py-0.5 text-center font-mono text-xs tabular-nums",
        active ? "bg-background/15" : "bg-surface text-muted",
      )}
    >
      {children}
    </span>
  );
}

/* --- Tabellen -------------------------------------------------------------
   Native <table> mit Tailwind: liest sich als Tabelle fuer Screenreader,
   bleibt Server-Komponente, und scrollt am Handy waagerecht in sich. */

/* Am Handy blenden die Tabellen Nebenspalten aus (`hidden sm:table-cell`)
   und zeigen das Wichtigste unter dem Titel — so passt alles ohne seitliches
   Scrollen. Der Rahmen scrollt trotzdem in sich, falls es einmal eng wird. */
export function AdminTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    /* relative: sonst entkommen absolut positionierte Kinder (sr-only)
       dem scrollenden Rahmen und verbreitern am Handy die ganze Seite. */
    <div className={cn("surface-card relative overflow-x-auto rounded-2xl", className)}>
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-separator px-4 py-3 text-xs font-medium whitespace-nowrap text-muted",
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
export const trClass = "transition-colors hover:bg-surface-secondary/50 [&:last-child>td]:border-b-0";
