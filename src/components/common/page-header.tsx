import Link from "next/link";
import { Icon, ChevronRightIcon } from "@/lib/icons";
import styles from "./page-header.module.css";

export type Crumb = { href: string; label: string };

/**
 * The standard header for every sub-page.
 *
 * Every page below the homepage opens exactly the same way — breadcrumb,
 * eyebrow, display heading, standfirst, optional aside — so the site has one
 * recognisable rhythm instead of each page inventing its own.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  aside,
  size = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  aside?: React.ReactNode;
  /** "large" is for section landing pages; "default" for detail pages. */
  size?: "default" | "large";
}) {
  return (
    <header className={styles.header} data-size={size}>
      <div className="shell">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <ol role="list">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href}>
                  {index > 0 && (
                    <Icon icon={ChevronRightIcon} className={styles.crumbIcon} aria-hidden />
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span aria-current="page">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className={styles.inner}>
          <div className={styles.text}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h1 className={styles.title}>{title}</h1>
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {aside && <div className={styles.aside}>{aside}</div>}
        </div>
      </div>
    </header>
  );
}
