import styles from "./live-indicator.module.css";

/**
 * The LIVE pulse. Composed rather than taken from OlyxUI because no OlyxUI
 * component carries a broadcast-state animation; Badge would only give the
 * shape, not the meaning.
 */
export function LiveIndicator({
  label = "Live",
  listeners,
}: {
  label?: string;
  listeners?: number | null;
}) {
  return (
    <span className={styles.live}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
      {typeof listeners === "number" && (
        <span className={styles.listeners}>
          {listeners} {listeners === 1 ? "Hörer" : "Hörer"}
        </span>
      )}
    </span>
  );
}
