import styles from "./image-placeholder.module.css";

/**
 * The fallback for content that genuinely has no image.
 *
 * Deliberately not a photo and not a gradient: a flat surface with the VoltFM
 * bolt and the item's initial. It reads as "intentionally blank" rather than
 * pretending to be artwork, and it stays legible in both themes.
 */
export function ImagePlaceholder({
  label,
  ratio = "16 / 10",
  className,
}: {
  /** Usually the title — its first character becomes the monogram. */
  label?: string;
  ratio?: string;
  className?: string;
}) {
  const initial = label?.trim().charAt(0).toUpperCase() ?? "";

  return (
    <div
      className={`${styles.placeholder} ${className ?? ""}`}
      style={{ aspectRatio: ratio }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className={styles.bolt} fill="none">
        <path d="M13.5 2 4 13.5h6L9.5 22 20 10.5h-6.5L13.5 2Z" fill="currentColor" />
      </svg>
      {initial && <span className={styles.initial}>{initial}</span>}
    </div>
  );
}
