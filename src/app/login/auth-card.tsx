import { LogoIcon } from "@/components/layout/logo";

/**
 * Der Rahmen fuer Anmelden und Registrieren: eine Platte in der Mitte, oben
 * ein kleines Display mit dem Play-Zeichen, darunter Ueberschrift und ein
 * Satz. Unten das Typenschild mit dem Verweis auf die andere Seite.
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
    <div className="shell flex justify-center pt-2 pb-4 sm:pt-10">
      <div className="w-full max-w-md">
        <div className="surface-card rounded-[var(--radius)] p-2">
          {/* Das Display oben: Play-Zeichen in Gelb, daneben die Kennung. */}
          <div
            aria-hidden="true"
            className="display-panel display-dots flex items-center justify-between gap-4 rounded-[3px] px-4 py-3"
          >
            <span className="flex items-center gap-3">
              <LogoIcon className="h-5 w-auto [--logo-mark:var(--volt)]" />
              <span className="font-dot text-base text-display-foreground">voltfm</span>
            </span>
            <span className="led" />
          </div>

          <div className="px-4 pt-7 pb-5 sm:px-7 sm:pt-9 sm:pb-7">
            <h1 className="font-display text-[2.1rem] text-balance text-foreground sm:text-[2.6rem]">
              {title}
            </h1>
            <p className="mt-3 text-pretty leading-relaxed text-muted">{description}</p>
            <div className="mt-8 flex flex-col gap-6">{children}</div>
          </div>
        </div>
        <p className="mt-2 rounded-[var(--radius)] border border-border px-5 py-3 text-center text-sm text-muted">
          {footer}
        </p>
      </div>
    </div>
  );
}

/** Trennlinie mit Beschriftung in der Mitte. */
export function AuthDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-meta text-muted" role="separator">
      <span className="h-px flex-1 bg-border" />
      {children}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
