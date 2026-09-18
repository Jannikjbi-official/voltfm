import { ButtonLink } from "@/components/common/button-link";
import { Icon, ArrowRightIcon } from "@/lib/icons";
import styles from "./section-header.module.css";

/**
 * The recurring section lead-in: an eyebrow label, a display heading, an
 * optional standfirst and an optional "see all" action.
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
        <ButtonLink
          href={action.href}
          variant="neutral"
          mode="stroke"
          size="sm"
          className={styles.action}
        >
          {action.label}
          <Icon icon={ArrowRightIcon} />
        </ButtonLink>
      )}
    </header>
  );
}
