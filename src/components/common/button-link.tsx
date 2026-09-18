import Link from "next/link";
import { Button } from "@/components/ui/button";

type ButtonProps = React.ComponentProps<typeof Button>;

/**
 * A button-shaped link.
 *
 * OlyxUI's Button renders a real <button> by default, and Base UI (correctly)
 * warns when you hand it a non-button through `render` without also setting
 * `nativeButton={false}` — the element would keep button semantics it cannot
 * honour. Rather than repeating that flag at every call site, VoltFM composes
 * it once here.
 *
 * OlyxUI's own LinkButton is a text link style, not a button-shaped CTA, so it
 * is not a substitute for this.
 */
export function ButtonLink({
  href,
  external = false,
  children,
  ...buttonProps
}: Omit<ButtonProps, "render" | "nativeButton"> & {
  href: string;
  /** Opens in a new tab with the usual rel hardening. */
  external?: boolean;
}) {
  return (
    <Button
      {...buttonProps}
      nativeButton={false}
      render={
        external ? (
          <a href={href} target="_blank" rel="noreferrer noopener" />
        ) : (
          <Link href={href} />
        )
      }
    >
      {children}
    </Button>
  );
}
