/** Figure layouts offered by the image dialog. */
export const FIGURE_LAYOUTS = [
  { value: "", label: "Normal (Textbreite)" },
  { value: "vfm-figure--wide", label: "Breit (über den Text hinaus)" },
  { value: "vfm-figure--left", label: "Links, Text fließt rechts" },
  { value: "vfm-figure--right", label: "Rechts, Text fließt links" },
] as const;

/** Escapes text so that markup in it shows up as characters, not as tags. */
export function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Escapes a value so it cannot break out of the attribute it lands in. */
export function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
