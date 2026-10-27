import Link from "next/link";
import { Icon, ArrowRightIcon } from "@/lib/icons";
import styles from "./section-header.module.css";

/**
 * The recurring section lead-in: an eyebrow label, a display heading, an
 * optional standfirst and an optional "see all" action.
 *
 * Der Verweis ist ein Textlink mit Pfeil, kein umrandeter Knopf: Auf einer
 * Seite mit sechs Abschnitten waeren das sechs Kaesten mehr, und die Knoepfe
 * sollen fuer das bleiben, was man tatsaechlich tut (hoeren, beitreten).
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "start",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  align?: "start" | "center";
}) {
  return (
    <header className={styles.header} data-align={align}>
      <div className={styles.text}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {action && (
        <Link href={action.href} className={styles.action}>
          {action.label}
          <Icon icon={ArrowRightIcon} className={styles.actionIcon} />
        </Link>
      )}
    </header>
  );
}
