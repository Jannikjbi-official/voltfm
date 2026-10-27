import { LogoIcon } from "@/components/layout/logo";
import { coverSrc, type CoverSize } from "./cover-url";
import styles from "./player.module.css";

/**
 * Track artwork with a VoltFM fallback. laut.fm serves no cover art, and the
 * iTunes lookup misses now and then, so a fallback is the normal case, not an
 * error state.
 *
 * Ein schlichtes <img> statt <Image>: Die Adresse kommt schon fertig aus
 * `coverSrc` (ueber `/_next/image`, eine feste Breite). <Image> wuerde daraus
 * wieder ein srcset mit mehreren Breiten bauen — jede davon eine eigene
 * Bildumwandlung bei Vercel. Groesse und Seitenverhaeltnis legt das CSS fest.
 */
export function CoverArt({
  src,
  alt,
  size = "thumb",
  eager = false,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  size?: CoverSize;
  /** Das grosse Cover im Hero: sofort laden, nicht erst beim Scrollen. */
  eager?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <span className={`${styles.cover} ${styles.coverFallback} ${className ?? ""}`} aria-hidden="true">
        <LogoIcon className={styles.coverFallbackIcon} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- siehe Kommentar oben: feste Breite statt srcset
    <img
      src={coverSrc(src, size)}
      alt={alt}
      width={size === "large" ? 640 : 96}
      height={size === "large" ? 640 : 96}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      className={`${styles.cover} ${className ?? ""}`}
    />
  );
}
