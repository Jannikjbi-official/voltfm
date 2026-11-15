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
    <div className="border-2 border-dashed border-border px-6 py-10">
      <p className="font-display text-3xl text-foreground">{title}</p>
      {description && <p className="mt-3 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-5 flex">{action}</div>}
    </div>
  );
}
