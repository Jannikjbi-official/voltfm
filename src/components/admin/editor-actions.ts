/**
 * The formatting vocabulary of the article editor.
 *
 * Kept as data rather than as buttons so the toolbar, the keyboard shortcuts
 * and the server-side sanitiser all describe the same set: whatever an action
 * can produce here is on the allow-list in `admin/news/actions.ts`, and the
 * `vfm-*` class names it emits are styled in `styles/editor-content.css`.
 */

export interface EditorAction {
  id: string;
  label: string;
  /** Wrapped around the selection. */
  before: string;
  after: string;
  /** Used when nothing is selected. */
  placeholder?: string;
  /** Applied to each selected line instead of the whole selection. */
  perLine?: boolean;
  /** Ctrl/Cmd + this key. */
  shortcut?: string;
  group: "text" | "block" | "layout";
}

export const EDITOR_ACTIONS: EditorAction[] = [
  /* --- Inline ------------------------------------------------------------ */
  { id: "bold", label: "Fett", before: "<strong>", after: "</strong>", placeholder: "fetter Text", shortcut: "b", group: "text" },
  { id: "italic", label: "Kursiv", before: "<em>", after: "</em>", placeholder: "kursiver Text", shortcut: "i", group: "text" },
  { id: "underline", label: "Unterstrichen", before: "<u>", after: "</u>", placeholder: "unterstrichen", shortcut: "u", group: "text" },
  { id: "strike", label: "Durchgestrichen", before: "<s>", after: "</s>", placeholder: "durchgestrichen", group: "text" },
  { id: "mark", label: "Hervorheben", before: "<mark>", after: "</mark>", placeholder: "hervorgehoben", group: "text" },
  { id: "code", label: "Code", before: "<code>", after: "</code>", placeholder: "code", group: "text" },
  { id: "sup", label: "Hochgestellt", before: "<sup>", after: "</sup>", placeholder: "1", group: "text" },
  { id: "sub", label: "Tiefgestellt", before: "<sub>", after: "</sub>", placeholder: "2", group: "text" },

  /* --- Blocks ------------------------------------------------------------ */
  { id: "p", label: "Absatz", before: "<p>", after: "</p>", placeholder: "Absatz", group: "block" },
  { id: "lead", label: "Vorspann", before: '<p class="vfm-lead">', after: "</p>", placeholder: "Der Einstieg in den Text.", group: "block" },
  { id: "h2", label: "Überschrift 2", before: "<h2>", after: "</h2>", placeholder: "Überschrift", group: "block" },
  { id: "h3", label: "Überschrift 3", before: "<h3>", after: "</h3>", placeholder: "Zwischentitel", group: "block" },
  { id: "h4", label: "Überschrift 4", before: "<h4>", after: "</h4>", placeholder: "Kleine Überschrift", group: "block" },
  { id: "quote", label: "Zitat", before: "<blockquote>\n  <p>", after: "</p>\n</blockquote>", placeholder: "Zitat", group: "block" },
  { id: "ul", label: "Liste", before: "<li>", after: "</li>", placeholder: "Punkt", perLine: true, group: "block" },
  { id: "pre", label: "Codeblock", before: "<pre><code>", after: "</code></pre>", placeholder: "code", group: "block" },
];

/** Bigger structures that are inserted whole rather than wrapped around text. */
export const EDITOR_SNIPPETS: { id: string; label: string; hint: string; html: string }[] = [
  {
    id: "list",
    label: "Aufzählung",
    hint: "Liste mit drei Punkten",
    html: "<ul>\n  <li>Erster Punkt</li>\n  <li>Zweiter Punkt</li>\n  <li>Dritter Punkt</li>\n</ul>",
  },
  {
    id: "ol",
    label: "Nummeriert",
    hint: "Nummerierte Liste",
    html: "<ol>\n  <li>Erster Schritt</li>\n  <li>Zweiter Schritt</li>\n</ol>",
  },
  {
    id: "callout",
    label: "Infobox",
    hint: "Hervorgehobener Kasten",
    html: '<aside class="vfm-callout">\n  <p><strong>Gut zu wissen:</strong> Dein Hinweis.</p>\n</aside>',
  },
  {
    id: "callout-warning",
    label: "Warnbox",
    hint: "Infobox in Warnfarbe",
    html: '<aside class="vfm-callout vfm-callout--warning">\n  <p><strong>Achtung:</strong> Dein Hinweis.</p>\n</aside>',
  },
  {
    id: "table",
    label: "Tabelle",
    hint: "Tabelle mit Kopfzeile",
    html:
      '<table class="vfm-table">\n  <thead>\n    <tr><th>Spalte</th><th>Spalte</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Wert</td><td>Wert</td></tr>\n    <tr><td>Wert</td><td>Wert</td></tr>\n  </tbody>\n</table>',
  },
  {
    id: "columns",
    label: "Zwei Spalten",
    hint: "Text zweispaltig setzen",
    html: '<div class="vfm-columns">\n  <p>Dein Text läuft ab hier über zwei Spalten.</p>\n</div>',
  },
  {
    id: "hr",
    label: "Trennlinie",
    hint: "Horizontale Linie",
    html: "<hr />",
  },
  {
    id: "clear",
    label: "Umfluss beenden",
    hint: "Nach einem umflossenen Bild",
    html: '<div class="vfm-clear"></div>',
  },
];

/** Figure layouts offered by the image dialog. */
export const FIGURE_LAYOUTS = [
  { value: "", label: "Normal (Textbreite)" },
  { value: "vfm-figure--wide", label: "Breit (über den Text hinaus)" },
  { value: "vfm-figure--left", label: "Links, Text fließt rechts" },
  { value: "vfm-figure--right", label: "Rechts, Text fließt links" },
] as const;

/** Escapes a value so it cannot break out of the attribute it lands in. */
export function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Escapes text that is placed between tags. */
export function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * The image wrapper.
 *
 * Every image an editor inserts goes through here, so they all come out as the
 * same `<figure>` structure — with alt text, an optional caption and one of the
 * known layout classes — instead of a bare `<img>` pasted into the text.
 */
export function buildFigure({
  url,
  alt,
  caption,
  credit,
  layout,
  link,
}: {
  url: string;
  alt: string;
  caption?: string;
  credit?: string;
  layout?: string;
  link?: string;
}): string {
  const className = ["vfm-figure", layout].filter(Boolean).join(" ");
  const img = `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(alt)}" loading="lazy" />`;
  const media = link
    ? `<a href="${escapeAttribute(link)}">${img}</a>`
    : img;

  const captionText = [caption?.trim() ?? "", credit?.trim() ? `Foto: ${credit.trim()}` : ""]
    .filter((part): part is string => Boolean(part))
    .map(escapeText)
    .join(" · ");

  const lines = [
    `<figure class="${className}">`,
    `  ${media}`,
    ...(captionText ? [`  <figcaption>${captionText}</figcaption>`] : []),
    "</figure>",
  ];

  // Blank lines around it keep the raw HTML readable in the textarea.
  return `\n${lines.join("\n")}\n\n`;
}
