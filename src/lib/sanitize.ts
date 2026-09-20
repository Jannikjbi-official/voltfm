import sanitizeHtml from "sanitize-html";

import { markdownToHtml } from "./markdown";

/**
 * Was ein Beitrag speichern darf.
 *
 * Artikel- und Event-Texte werden mit `dangerouslySetInnerHTML` ausgegeben.
 * Das hier ist deshalb die Grenze gegen gespeichertes XSS: Wird beim Schreiben
 * bereinigt, darf die Ausgabe dem vertrauen, was in der Datenbank steht. Alles,
 * was nicht auf dieser Liste steht, verschwindet.
 *
 * Die Liste stand vorher zweimal da — einmal für Artikel, einmal für Events,
 * mit kleinen Abweichungen, die niemand beabsichtigt hatte. Eine Liste ist auch
 * die, die man beim Ändern nicht vergisst.
 */
export const RICH_TEXT_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s", "mark", "small", "sup", "sub", "blockquote",
    "h2", "h3", "h4",
    "ul", "ol", "li",
    "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
    "aside", "div",
    "code", "pre", "hr",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    th: ["scope", "colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    // `class` nur auf diesen Elementen, und nur mit den Namen weiter unten.
    figure: ["class"],
    aside: ["class"],
    div: ["class"],
    table: ["class"],
    p: ["class"],
  },
  /**
   * Das Layout-Vokabular, das der Bild-Dialog erzeugen kann; gestaltet wird es
   * global in styles/editor-content.css. Die Begrenzung hier verhindert, dass
   * über den Editor beliebige Klassennamen in die Seite wandern.
   */
  allowedClasses: {
    figure: ["vfm-figure", "vfm-figure--wide", "vfm-figure--left", "vfm-figure--right"],
    aside: ["vfm-callout", "vfm-callout--warning", "vfm-callout--success"],
    div: ["vfm-columns", "vfm-clear"],
    table: ["vfm-table"],
    p: ["vfm-lead"],
  },
  allowedSchemes: ["https", "mailto"],
  // Bilder nur von Hosts, die wir selbst ausliefern — das hält Tracker und
  // unverschlüsselte Inhalte aus den Beiträgen heraus.
  allowedSchemesByTag: { img: ["https"] },
  transformTags: {
    // Externe Links werden abgesichert, egal was der Editor erzeugt hat.
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        ...(attribs.href?.startsWith("http")
          ? { target: "_blank", rel: "noreferrer noopener" }
          : {}),
      },
    }),
    img: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, loading: "lazy" },
    }),
  },
};

/**
 * Der Weg vom Editor in die Datenbank: erst Markdown zu HTML, dann bereinigen.
 *
 * Die Reihenfolge ist wichtig. Andersherum wäre der Konverter die letzte
 * Instanz vor dem Speichern — und der soll gerade nicht für Sicherheit
 * geradestehen müssen.
 */
export function renderRichText(source: string): string {
  return sanitizeHtml(markdownToHtml(source), RICH_TEXT_SANITIZE_OPTIONS);
}

/** Der Vorschlag, den der Editor einsetzt, solange niemand etwas tippt. */
const ALT_PLACEHOLDER = "Bildbeschreibung ergänzen";

/**
 * Findet Bilder, denen noch die Beschreibung fehlt.
 *
 * Vorher erzwang das ein Dialog mit Pflichtfeld. Der ist weg — Bilder landen
 * jetzt per Ziehen, Einfügen oder Knopfdruck direkt im Text. Der Zwang bleibt
 * trotzdem, nur an einer Stelle, die sich nicht umgehen lässt: Ein Beitrag mit
 * unbeschriebenem Bild wird nicht gespeichert.
 *
 * Erwartet den bereits erzeugten HTML-Text, damit auch Bilder erfasst werden,
 * die als rohes `<img>` im Beitrag stehen.
 */
export function findImageWithoutAlt(html: string): boolean {
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const alt = /\salt="([^"]*)"/.exec(match[0])?.[1]?.trim() ?? "";
    if (!alt || alt === ALT_PLACEHOLDER) return true;
  }
  return false;
}
