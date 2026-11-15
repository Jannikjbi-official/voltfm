import { LogoIcon } from "@/components/layout/logo";

/**
 * Der Rahmen fuer Anmelden und Registrieren: eine Karte in der Mitte, oben
 * das Play-Zeichen, darunter Ueberschrift und ein Satz.
 */
export function AuthCard({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="shell flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-surface sm:p-9">
          <LogoIcon className="h-9 w-auto" />
          <h1 className="mt-6 font-display text-3xl leading-[1.02] text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted">{description}</p>
          <div className="mt-7 flex flex-col gap-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </div>
    </div>
  );
}

/** Trennlinie mit Text in der Mitte. */
export function AuthDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted" role="separator">
      <span className="h-px flex-1 bg-separator" />
      {children}
      <span className="h-px flex-1 bg-separator" />
    </div>
  );
}
