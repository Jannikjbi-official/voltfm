import type { Metadata } from "next";

import { requireCan } from "@/lib/session";
import { renderRichText } from "@/lib/sanitize";
import { MARKDOWN_GROUPS } from "./examples";
import { CopyButton } from "./copy-button";
import { AdminPageHeader } from "@/components/admin/admin-ui";

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

      <div className="flex flex-col gap-10">
        {MARKDOWN_GROUPS.map((group) => (
          <section key={group.title} aria-label={group.title}>
            <h2 className="font-display text-2xl text-foreground">{group.title}</h2>
            {group.intro && <p className="mt-2 max-w-2xl text-sm text-muted">{group.intro}</p>}

            <ul className="mt-5 divide-y divide-separator rounded-2xl border border-border bg-surface">
              {group.examples.map((example) => (
                <li
                  key={example.title}
                  className="grid grid-cols-1 gap-4 p-5 sm:p-6 xl:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)] xl:items-start"
                >
                  <div className="min-w-0">
                    <h3 className="font-wide text-sm font-bold text-foreground">{example.title}</h3>
                    {example.hint && <p className="mt-1 text-xs text-muted">{example.hint}</p>}
                  </div>

                  <div className="relative min-w-0 rounded-xl bg-surface-secondary">
                    <pre className="overflow-x-auto py-3 pr-12 pl-4 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap break-words text-foreground">
                      <code>{example.source}</code>
                    </pre>
                    <div className="absolute top-1.5 right-1.5">
                      <CopyButton source={example.source} label={example.title} />
                    </div>
                  </div>

                  {/* Aus renderRichText() und damit schon bereinigt — derselbe
                      Weg, den ein gespeicherter Beitrag nimmt. */}
                  <div
                    className="vfm-prose vfm-prose--compact min-w-0 rounded-xl border border-border p-4"
                    dangerouslySetInnerHTML={{ __html: renderRichText(example.source) }}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-10 max-w-2xl text-sm text-muted">
        Alles andere — eigene Tags, Schriftfarben, eingebettete Videos — wird beim
        Speichern entfernt. Wenn dir etwas fehlt, sag Bescheid, statt es über HTML
        zu versuchen.
      </p>
    </>
  );
}
