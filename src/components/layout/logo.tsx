import Link from "next/link";
import Image from "next/image";
import styles from "./header.module.css";

/**
 * Die Wortmarke: das offizielle VoltFM-Logo plus der Sendername.
 *
 * Das Logo bringt seinen eigenen Verlauf mit und steht deshalb frei, ohne den
 * farbigen Kachelhintergrund, den die frühere Eigenbau-Marke brauchte. Es ist
 * dekorativ — den Namen trägt der Text daneben, und der Link hat ein eigenes
 * `aria-label` —, also bleibt das `alt` leer.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={styles.logo} aria-label="VoltFM — zur Startseite">
      <Image
        src="/voltfm-logo.webp"
        alt=""
        width={34}
        height={34}
        className={styles.logoMark}
        priority
      />
      {!compact && (
        <span className={styles.logoText}>
          Volt<span className={styles.logoAccent}>FM</span>
        </span>
      )}
    </Link>
  );
}
