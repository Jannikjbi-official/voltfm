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
    <div className="shell flex justify-center pt-10 pb-4 sm:pt-16">
      <div className="w-full max-w-md">
        <div className="surface-card rounded-[var(--radius)] p-6 shadow-[var(--lift-shadow)] sm:p-10">
          {/* Das Play-Zeichen als App-Symbol: Tinte auf Gelb, in beiden Modi. */}
          <span
            data-theme="light"
            className="light grid size-14 place-items-center rounded-2xl bg-volt"
          >
            <LogoIcon className="h-7 w-auto" />
          </span>
          <h1 className="mt-7 font-display text-[2.1rem] text-balance text-foreground sm:text-[2.6rem]">
            {title}
          </h1>
          <p className="mt-3 text-pretty leading-relaxed text-muted">{description}</p>
          <div className="mt-8 flex flex-col gap-6">{children}</div>
        </div>
        <p className="mt-5 rounded-full bg-default px-5 py-3 text-center text-sm text-muted">{footer}</p>
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
