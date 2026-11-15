import type { Metadata } from "next";

import { requireCan } from "@/lib/session";
import { renderRichText } from "@/lib/sanitize";
import { MARKDOWN_GROUPS } from "./examples";
import { CopyButton } from "./copy-button";
import { AdminPageHeader, PillCount, filterPillClass } from "@/components/admin/admin-ui";

export const metadata: Metadata = { title: "Textformat · Admin", robots: { index: false } };

/**
 * Der Spickzettel für das Textfeld.
 *
 * Jedes Beispiel wird hier tatsächlich gerendert, mit demselben Aufruf wie beim
 * Speichern eines Beitrags. Die Seite kann deshalb nicht auseinanderlaufen: Was
 * links steht und rechts nicht ankommt, funktioniert wirklich nicht mehr.
 */
export default async function Page() {
  // Ein ausgeblendeter Menuepunkt ist kein Schutz — die Seite prueft selbst.
  await requireCan("article", ["update"]);

  return (
    <>
      <AdminPageHeader
        title="Textformat"
        description="Alles, was im Textfeld von News und Events funktioniert. Links das, was du tippst, rechts das, was dabei herauskommt."
      />

      {/* Sprungmarken: Die Seite ist lang, man sucht meist eine Sache. */}
      <nav aria-label="Abschnitte" className="-mx-1 mb-8 flex gap-1.5 overflow-x-auto px-1 py-1">
        {MARKDOWN_GROUPS.map((group, index) => (
          <a key={group.title} href={`#format-${index}`} className={filterPillClass(false)}>
            {group.title}
            <PillCount active={false}>{group.examples.length}</PillCount>
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-12">
        {MARKDOWN_GROUPS.map((group, index) => (
          <section key={group.title} id={`format-${index}`} aria-labelledby={`format-${index}-title`} className="scroll-mt-24">
            <h2 id={`format-${index}-title`} className="font-display text-2xl text-foreground sm:text-3xl">
              {group.title}
            </h2>
            {group.intro && <p className="mt-2 max-w-2xl text-sm text-muted">{group.intro}</p>}

            <ul className="mt-5 flex flex-col gap-3">
              {group.examples.map((example) => (
                <li
                  key={example.title}
                  className="surface-card grid grid-cols-1 gap-4 rounded-2xl p-4 sm:p-5 xl:grid-cols-[12rem_minmax(0,1fr)_minmax(0,1fr)] xl:items-start"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground">{example.title}</h3>
                    {example.hint && <p className="mt-1 text-xs text-muted">{example.hint}</p>}
                  </div>

                  <div className="relative min-w-0 rounded-xl bg-surface-secondary">
                    <p className="px-4 pt-3 text-xs text-muted">Du tippst</p>
                    <pre className="overflow-x-auto pt-1 pr-12 pb-3 pl-4 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap break-words text-foreground">
                      <code>{example.source}</code>
                    </pre>
                    <div className="absolute top-1.5 right-1.5">
                      <CopyButton source={example.source} label={example.title} />
                    </div>
                  </div>

                  <div className="min-w-0 rounded-xl border border-separator">
                    <p className="px-4 pt-3 text-xs text-muted">So sieht es aus</p>
                    {/* Aus renderRichText() und damit schon bereinigt — derselbe
                        Weg, den ein gespeicherter Beitrag nimmt. */}
                    <div
                      className="vfm-prose vfm-prose--compact min-w-0 px-4 pt-1 pb-4"
                      dangerouslySetInnerHTML={{ __html: renderRichText(example.source) }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-10 max-w-2xl rounded-2xl bg-surface-secondary p-5 text-sm text-muted">
        Alles andere — eigene Tags, Schriftfarben, eingebettete Videos — wird beim
        Speichern entfernt. Wenn dir etwas fehlt, sag Bescheid, statt es über HTML
        zu versuchen.
      </p>
    </>
  );
}
