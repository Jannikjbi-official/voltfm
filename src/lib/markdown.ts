/**
 * Markdown → HTML, in der Teilmenge, die der Artikeleditor anbietet.
 *
 * Warum selbst geschrieben und keine Bibliothek: Es geht um ein knappes
 * Dutzend Konstrukte, und die Sicherheitsgrenze liegt ohnehin woanders —
 * `sanitizeHtml` in `admin/news/actions.ts` räumt hinterher auf, egal was
 * hier herauskommt (siehe Leitfaden 2.2). Eine weitere Abhängigkeit im
 * Bündel wäre für ## und **fett** nicht zu rechtfertigen.
 *
 * Bewusst großzügig an einer Stelle: Ein Block, der mit `<` beginnt, wird
 * unverändert durchgereicht. Nur deshalb lassen sich die Artikel, die noch
 * als reines HTML in der Datenbank stehen, weiter bearbeiten und speichern,
 * ohne dass sie vorher umgeschrieben werden müssen — und nur deshalb kann der
 * Bild-Dialog für eine Ausrichtung weiter ein <figure> setzen.
 */

/** Alles, was in HTML eine Bedeutung hätte, wird zu Text. */
function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Inline-Auszeichnungen innerhalb einer Zeile.
 *
 * Code-Spans kommen zuerst und werden gegen die übrigen Regeln geparkt —
 * sonst würde `**` in einem Codebeispiel zu Fettschrift.
 */
function inline(text: string): string {
  const codes: string[] = [];
  let out = text.replace(/`([^`]+)`/g, (_match, code: string) => {
    codes.push(`<code>${escape(code)}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });

  out = escape(out);

  // Bild vor Link, sonst schluckt die Link-Regel das führende "!".
  out = out.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (_match, alt: string, url: string) =>
      `<img src="${url}" alt="${alt}" loading="lazy" />`,
  );

  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_match, label: string, url: string) => `<a href="${url}">${label}</a>`,
  );

  out = out
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
    .replace(/==([^=]+)==/g, "<mark>$1</mark>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/(^|\s)_([^_\n]+)_/g, "$1<em>$2</em>");

  return out.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => codes[Number(index)]);
}

/** Ein Bild, das allein in seinem Absatz steht, wird zur Abbildung. */
function figureOf(block: string): string | null {
  const match = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/.exec(block.trim());
  if (!match) return null;

  const [, alt, url, caption] = match;
  const image = `<img src="${escape(url)}" alt="${escape(alt)}" loading="lazy" />`;
  const text = caption ? `\n  <figcaption>${inline(caption)}</figcaption>` : "";
  return `<figure class="vfm-figure">\n  ${image}${text}\n</figure>`;
}

/** Zerlegt eine Tabellenzeile in ihre Zellen. */
function cellsOf(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

/** Erkennt die Trennzeile unter der Kopfzeile: | --- | --- | */
function isTableDivider(line: string): boolean {
  return /^\s*\|?[\s:-]*-[\s:|-]*\|?\s*$/.test(line) && line.includes("-");
}

/**
 * Eine Folge von Listenzeilen zu <ul>/<ol>.
 *
 * Ein Punkt darf ueber mehrere Zeilen gehen: Was eingerueckt unter einem Punkt
 * steht, gehoert dazu. Ohne das zerfaellt jede Liste, deren Punkte laenger als
 * eine Zeile sind — und genau so tippt man sie.
 */
function listOf(lines: string[], ordered: boolean): string {
  const tag = ordered ? "ol" : "ul";
  const pattern = ordered ? /^\d+[.)]\s+/ : /^[-*+]\s+/;

  const items: string[] = [];
  for (const line of lines) {
    if (pattern.test(line)) {
      items.push(line.replace(pattern, "").trim());
    } else if (items.length > 0) {
      items[items.length - 1] += ` ${line.trim()}`;
    }
  }

  const body = items.map((item) => `  <li>${inline(item)}</li>`).join("\n");
  return `<${tag}>\n${body}\n</${tag}>`;
}

export function markdownToHtml(source: string): string {
  const text = source.replace(/\r\n/g, "\n").trim();
  if (!text) return "";

  const out: string[] = [];
  const lines = text.split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    // Codeblock — bis zum schließenden Zaun wird nichts gedeutet.
    if (/^```/.test(line.trim())) {
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        body.push(lines[index]);
        index += 1;
      }
      index += 1;
      out.push(`<pre><code>${escape(body.join("\n"))}</code></pre>`);
      continue;
    }

    // Roher HTML-Block: unverändert bis zur nächsten Leerzeile.
    if (line.trimStart().startsWith("<")) {
      const body: string[] = [];
      while (index < lines.length && lines[index].trim()) {
        body.push(lines[index]);
        index += 1;
      }
      out.push(body.join("\n"));
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      // h1 gehört dem Artikeltitel, der Rest wird auf h2–h4 begrenzt.
      const level = Math.min(4, Math.max(2, heading[1].length));
      out.push(`<h${level}>${inline(heading[2].trim())}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      out.push("<hr />");
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const body: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        body.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      out.push(`<blockquote>\n  <p>${inline(body.join(" ").trim())}</p>\n</blockquote>`);
      continue;
    }

    // Hinweis- und Warnbox: ::: hinweis … :::
    const callout = /^:::\s*(hinweis|warnung|erfolg)\s*$/i.exec(line.trim());
    if (callout) {
      const body: string[] = [];
      index += 1;
      while (index < lines.length && lines[index].trim() !== ":::") {
        body.push(lines[index]);
        index += 1;
      }
      index += 1;
      const kind = callout[1].toLowerCase();
      const className =
        kind === "warnung"
          ? "vfm-callout vfm-callout--warning"
          : kind === "erfolg"
            ? "vfm-callout vfm-callout--success"
            : "vfm-callout";
      // Der Inhalt darf selbst wieder Markdown sein.
      const inner = markdownToHtml(body.join("\n"));
      out.push(`<aside class="${className}">\n${inner}\n</aside>`);
      continue;
    }

    // Tabelle: Kopfzeile, Trennzeile, dann die Daten.
    if (line.includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const head = cellsOf(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(cellsOf(lines[index]));
        index += 1;
      }

      const headCells = head.map((cell) => `    <th scope="col">${inline(cell)}</th>`).join("\n");
      const bodyRows = rows
        .map((row) => {
          const cells = row.map((cell) => `    <td>${inline(cell)}</td>`).join("\n");
          return `  <tr>\n${cells}\n  </tr>`;
        })
        .join("\n");

      out.push(
        [
          `<table class="vfm-table">`,
          "  <thead>",
          "  <tr>",
          headCells,
          "  </tr>",
          "  </thead>",
          "  <tbody>",
          bodyRows,
          "  </tbody>",
          "</table>",
        ].join("\n"),
      );
      continue;
    }

    const ordered = /^\d+[.)]\s+/.test(line);
    if (ordered || /^[-*+]\s+/.test(line)) {
      const body: string[] = [];
      const pattern = ordered ? /^\d+[.)]\s+/ : /^[-*+]\s+/;
      // Eine eingerueckte Zeile setzt den Punkt darueber fort.
      while (
        index < lines.length &&
        lines[index].trim() &&
        (pattern.test(lines[index]) || /^\s{2,}\S/.test(lines[index]))
      ) {
        body.push(lines[index]);
        index += 1;
      }
      out.push(listOf(body, ordered));
      continue;
    }

    // Absatz: alles bis zur nächsten Leerzeile.
    const body: string[] = [];
    while (index < lines.length && lines[index].trim() && !lines[index].trimStart().startsWith("<")) {
      body.push(lines[index]);
      index += 1;
    }

    const block = body.join("\n");
    const figure = figureOf(block);
    // Einfache Zeilenumbrüche bleiben Umbrüche — beim Schreiben eines
    // Beitrags ist das die naheliegendere Erwartung.
    out.push(figure ?? `<p>${inline(block).replace(/\n/g, "<br />\n")}</p>`);
  }

  return out.join("\n\n");
}
