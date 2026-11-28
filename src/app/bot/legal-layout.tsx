import { PageHeader } from "@/components/common/page-header";

/**
 * Gemeinsamer Rahmen für die Rechtstexte des Discord-Bots „VoltFM Radio“
 * (/bot/nutzungsbedingungen, /bot/datenschutz) – wie Impressum und Datenschutz:
 * Inhaltsverzeichnis am Rand, Text in einer Karte.
 */
export function BotLegalLayout({
  title,
  description,
  href,
  sections,
  stand,
  children,
}: {
  title: string;
  description: string;
  href: string;
  sections: readonly { id: string; label: string }[];
  stand: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/bot", label: "Discord-Bot" },
          { href, label: title },
        ]}
      />
      <section className="shell pt-2">
        <div className="grid items-start gap-2 lg:grid-cols-12">
          <nav
            aria-label="Auf dieser Seite"
            className="surface-card hidden rounded-[var(--radius)] p-2 lg:sticky lg:top-[calc(var(--header-height)+1.75rem)] lg:col-span-4 lg:block xl:col-span-3"
          >
            <p className="px-3 pt-2 pb-3 font-meta text-muted">Auf dieser Seite</p>
            <ul className="well flex flex-col gap-px rounded-[3px] p-1">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2 rounded-[3px] px-2.5 py-2 text-sm leading-snug text-foreground transition-colors hover:bg-surface"
                  >
                    <span aria-hidden="true" className="font-dot text-xs leading-5 text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{section.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <article className="surface-card min-w-0 rounded-[var(--radius)] p-5 sm:p-10 lg:col-span-8 xl:col-span-9">
            <div className="vfm-prose max-w-[68ch] [&>h2:first-child]:mt-0 [&_h2]:scroll-mt-28">
              {children}
              <p className="text-sm text-muted">Stand: {stand}</p>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
