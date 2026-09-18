import styles from "./empty-state.module.css";

/**
 * Shown whenever a list has nothing to show — including when MongoDB is
 * unreachable and a section degrades to empty. Always says what to do next.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
