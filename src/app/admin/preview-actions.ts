"use server";

import { assertCan, AuthorizationError } from "@/lib/session";
import { renderRichText } from "@/lib/sanitize";

/**
 * Die Vorschau im Editor, gerendert wie beim Speichern.
 *
 * Vorher lief die Umwandlung im Browser, und das Ergebnis ging ungefiltert in
 * `dangerouslySetInnerHTML`. Hier läuft derselbe Weg wie beim Speichern —
 * Markdown zu HTML, dann bereinigen. Die Vorschau zeigt damit auch tatsächlich,
 * was nachher in der Datenbank landet, statt etwas Ähnliches.
 */
export async function previewRichText(source: string): Promise<string> {
  try {
    await assertCan("article", ["update"]);
  } catch (error) {
    if (error instanceof AuthorizationError) return "";
    throw error;
  }

  return renderRichText(source);
}
