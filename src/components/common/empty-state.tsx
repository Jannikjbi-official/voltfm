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
    <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      <p className="font-wide text-base font-semibold text-foreground">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
