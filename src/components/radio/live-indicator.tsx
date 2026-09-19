import styles from "./live-indicator.module.css";

/**
 * The LIVE pulse. Composed rather than taken from OlyxUI because no OlyxUI
 * component carries a broadcast-state animation; Badge would only give the
 * shape, not the meaning.
 *
 * Die Hoererzahl stand hier frueher daneben. Sie ist bei einem kleinen Sender
 * keine gute Kennzahl: Eine einstellige Momentaufnahme sagt nichts ueber das
 * Programm und wirkt nach aussen wie ein Armutszeugnis, obwohl sie es nicht
 * ist. Der Wert bleibt in den Daten — nur nicht mehr auf jeder Seite.
 */
export function LiveIndicator({ label = "Live" }: { label?: string }) {
  return (
    <span className={styles.live}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </span>
  );
}
