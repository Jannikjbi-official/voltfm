/**
 * Wenn eine Liste nichts zu zeigen hat — auch, wenn die Datenbank gerade
 * nicht erreichbar ist. Sagt immer, wie es weitergeht.
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
    <div className="well rounded-[var(--radius)] px-6 py-12 text-center">
      <p className="font-meta text-muted">kein signal</p>
      <p className="mt-2 text-lg font-bold text-foreground">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
