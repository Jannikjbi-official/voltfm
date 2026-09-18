import Image from "next/image";
import styles from "./player.module.css";

/**
 * Track artwork with a VoltFM monogram fallback. laut.fm serves no cover art,
 * so a miss is the normal case, not an error state.
 */
export function CoverArt({
  src,
  alt,
  size = 48,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  size?: number;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`${styles.cover} ${styles.coverFallback} ${className ?? ""}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        VFM
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`${styles.cover} ${className ?? ""}`}
      style={{ width: size, height: size }}
      unoptimized
    />
  );
}
