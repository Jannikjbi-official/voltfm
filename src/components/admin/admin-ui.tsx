import { chipVariants } from "@heroui/styles";
import { cn } from "@heroui/react";
import type { ArticleStatus } from "@/types/content";

/*
 * Bausteine fuer die Admin-Seiten. Bewusst ohne Hooks und ohne HeroUI-
 * Compound-Teile: Die Seiten sind Server-Komponenten, und Chips oder Panels
 * brauchen keine Interaktion — die Klassen kommen aus HeroUIs
 * Variantenfunktionen bzw. aus den Theme-Tokens.
 */

/** Kopf einer Admin-Seite: Titel, ein Satz darunter, rechts die Aktion. */
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
        <h1 className="font-display text-3xl leading-[1.05] text-balance text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-pretty text-sm text-muted sm:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Eine Flaeche mit optionaler Ueberschrift und Aktion rechts daneben. */
export function AdminPanel({
  title,
  titleId,
  action,
  className,
  children,
}: {
  title?: string;
  titleId?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn("rounded-2xl border border-border bg-surface p-5 sm:p-6", className)}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && (
            <h2 id={titleId} className="font-wide text-base font-bold text-foreground">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
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

/** Ein kleiner Chip im HeroUI-Look, ohne Client-JavaScript. */
export function StatusBadge({
  color = "default",
  children,
  className,
}: {
  color?: ChipColor;
  children: React.ReactNode;
  className?: string;
}) {
  const slots = chipVariants({ color, variant: "soft", size: "sm" });
  return (
    <span className={cn(slots.base(), "shrink-0 whitespace-nowrap", className)}>
      <span className={slots.label()}>{children}</span>
    </span>
  );
}

const ARTICLE_STATUS: Record<ArticleStatus, { label: string; color: ChipColor }> = {
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
      className="mb-6 rounded-2xl border border-[color-mix(in_oklab,var(--warning)_45%,transparent)] bg-[color-mix(in_oklab,var(--warning)_12%,transparent)] p-4 text-sm leading-relaxed text-foreground sm:p-5"
    >
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div className="text-foreground/85 [&_code]:rounded [&_code]:bg-surface-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]">
        {children}
      </div>
    </div>
  );
}
