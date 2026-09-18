import Link from "next/link";
import styles from "./header.module.css";

/** The VoltFM wordmark: a bolt-derived monogram plus the station name. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={styles.logo} aria-label="VoltFM — zur Startseite">
      <span className={styles.logoMark} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path
            d="M13.5 2 4 13.5h6L9.5 22 20 10.5h-6.5L13.5 2Z"
            fill="currentColor"
          />
        </svg>
      </span>
      {!compact && (
        <span className={styles.logoText}>
          Volt<span className={styles.logoAccent}>FM</span>
        </span>
      )}
    </Link>
  );
}
