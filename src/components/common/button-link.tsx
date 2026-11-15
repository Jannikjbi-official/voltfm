import Link from "next/link";
import { buttonVariants, cn } from "@heroui/react";

type Variant = "primary" | "secondary" | "tertiary" | "outline" | "ghost" | "danger";

/**
 * Ein Link, der wie ein HeroUI-Knopf aussieht.
 *
 * Bewusst ein echter Link (Next-<Link> bzw. <a>) mit den Klassen aus
 * `buttonVariants` — so funktionieren Mittelklick, "Adresse kopieren" und
 * Vorabladen, und ein Screenreader sagt "Link", nicht "Taste".
 */
export function ButtonLink({
  href,
  external = false,
  variant = "primary",
  size = "md",
  isIconOnly = false,
  fullWidth = false,
  className,
  children,
  ...rest
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  /** Oeffnet in einem neuen Tab, mit dem ueblichen rel-Schutz. */
  external?: boolean;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  isIconOnly?: boolean;
  fullWidth?: boolean;
}) {
  const classes = cn(buttonVariants({ variant, size, isIconOnly, fullWidth }), className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={classes} {...rest}>
        {children}
        <span className="sr-only"> (öffnet einen neuen Tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
