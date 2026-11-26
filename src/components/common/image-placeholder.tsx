import { cn } from "@heroui/react";

/**
 * Ersatz fuer Inhalte, die wirklich kein Bild haben.
 *
 * Bewusst kein Foto und kein Verlauf: eine flache Flaeche mit dem
 * VoltFM-Blitz und dem Anfangsbuchstaben. Das liest sich als "absichtlich
 * leer" statt als vorgetaeuschtes Artwork und bleibt in beiden Modi lesbar.
 */
export function ImagePlaceholder({
  label,
  ratio = "16 / 10",
  className,
}: {
  /** Meist der Titel — sein erstes Zeichen wird zum Monogramm. */
  label?: string;
  ratio?: string;
  className?: string;
}) {
  const initial = label?.trim().charAt(0).toUpperCase() ?? "";

  return (
    <div
      aria-hidden="true"
      /* Das Seitenverhaeltnis ist ein Wert des Aufrufers — als Variable, nicht als Stil. */
      style={{ "--placeholder-ratio": ratio } as React.CSSProperties}
      className={cn(
        "relative flex aspect-[var(--placeholder-ratio)] w-full items-center justify-center gap-3 overflow-hidden rounded-[var(--radius)] well text-muted",
        className,
      )}
    >
      {/* Der Blitz als gelbe Kachel mit Tinte darauf. */}
      <span className="grid size-12 place-items-center key rounded-[var(--radius)] bg-volt text-graphite">
        <svg viewBox="0 0 24 24" className="size-6" fill="none">
          <path d="M13.5 2 4 13.5h6L9.5 22 20 10.5h-6.5L13.5 2Z" fill="currentColor" />
        </svg>
      </span>
      {initial && <span className="font-display text-4xl text-foreground">{initial}</span>}
    </div>
  );
}
