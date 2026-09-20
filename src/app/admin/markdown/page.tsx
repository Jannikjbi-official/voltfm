import type { Metadata } from "next";

import { requireCan } from "@/lib/session";
import { renderRichText } from "@/lib/sanitize";
import { MARKDOWN_GROUPS } from "./examples";
import pageStyles from "../page.module.css";
import styles from "./page.module.css";

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
      <header className={pageStyles.header}>
        <div>
          <h1 className={pageStyles.title}>Textformat</h1>
          <p className={pageStyles.subtitle}>
            Alles, was im Textfeld von News und Events funktioniert. Links das, was
            du tippst, rechts das, was dabei herauskommt.
          </p>
        </div>
      </header>

      <div className={styles.groups}>
        {MARKDOWN_GROUPS.map((group) => (
          <section key={group.title} className={styles.group}>
            <h2 className={styles.groupTitle}>{group.title}</h2>
            {group.intro && <p className={styles.groupIntro}>{group.intro}</p>}

            <ul className={styles.rows} role="list">
              {group.examples.map((example) => (
                <li key={example.title} className={styles.row}>
                  <div className={styles.meta}>
                    <h3 className={styles.exampleTitle}>{example.title}</h3>
                    {example.hint && <p className={styles.hint}>{example.hint}</p>}
                  </div>

                  <pre className={styles.source}>
                    <code>{example.source}</code>
                  </pre>

                  {/* Aus renderRichText() und damit schon bereinigt — derselbe
                      Weg, den ein gespeicherter Beitrag nimmt. */}
                  <div
                    className={styles.result}
                    dangerouslySetInnerHTML={{ __html: renderRichText(example.source) }}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className={styles.footer}>
        Alles andere — eigene Tags, Schriftfarben, eingebettete Videos — wird beim
        Speichern entfernt. Wenn dir etwas fehlt, sag Bescheid, statt es über HTML
        zu versuchen.
      </p>
    </>
  );
}
