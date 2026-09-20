/**
 * Alles, was im Textfeld funktioniert — als Quelle für die Spickzettel-Seite.
 *
 * Die Beispiele werden auf der Seite tatsächlich durch `renderRichText`
 * geschickt. Damit kann der Spickzettel nicht veralten: Was hier steht und
 * nicht mehr funktioniert, sieht man sofort, weil rechts nichts ankommt.
 */
export interface MarkdownExample {
  title: string;
  hint?: string;
  source: string;
}

export interface MarkdownGroup {
  title: string;
  intro?: string;
  examples: MarkdownExample[];
}

export const MARKDOWN_GROUPS: MarkdownGroup[] = [
  {
    title: "Text",
    intro: "Das Meiste braucht keine Erklärung — eintippen und weiterschreiben.",
    examples: [
      {
        title: "Absätze",
        hint: "Eine Leerzeile beginnt einen neuen Absatz. Ein einfacher Umbruch bleibt ein Umbruch.",
        source: "Der erste Absatz.\n\nDer zweite Absatz.\nEine Zeile darunter, im selben Absatz.",
      },
      {
        title: "Auszeichnungen",
        source:
          "**fett**, *kursiv*, ~~durchgestrichen~~, ==hervorgehoben== und `Code im Text`.",
      },
      {
        title: "Überschriften",
        hint: "Zwei bis vier Rauten. Eine einzelne Raute gibt es nicht — die ist der Titel des Beitrags.",
        source: "## Große Überschrift\n\n### Mittlere Überschrift\n\n#### Kleine Überschrift",
      },
      {
        title: "Vorspann",
        hint: "Der erste Absatz größer gesetzt. Dafür gibt es keine Markdown-Schreibweise, aber dieses HTML ist erlaubt.",
        source: '<p class="vfm-lead">Kurz und deutlich vorweg: Es geht weiter.</p>',
      },
    ],
  },
  {
    title: "Listen und Zitate",
    examples: [
      {
        title: "Aufzählung",
        source: "- Erster Punkt\n- Zweiter Punkt\n- Dritter Punkt",
      },
      {
        title: "Nummeriert",
        source: "1. Erster Schritt\n2. Zweiter Schritt\n3. Dritter Schritt",
      },
      {
        title: "Zitat",
        source: "> Radio ist der einzige Ort, an dem noch jemand zuhört.",
      },
      {
        title: "Trennlinie",
        hint: "Drei Bindestriche in einer eigenen Zeile.",
        source: "Davor.\n\n---\n\nDanach.",
      },
    ],
  },
  {
    title: "Links und Bilder",
    examples: [
      {
        title: "Link",
        hint: "Externe Links öffnen automatisch in einem neuen Tab.",
        source: "Mehr dazu auf [laut.fm](https://laut.fm/jannikjbi).",
      },
      {
        title: "Bild",
        hint: "Am einfachsten: Bild ins Textfeld ziehen. In den eckigen Klammern steht die Bildbeschreibung — die ist Pflicht, sonst lässt sich der Beitrag nicht speichern.",
        source: "![Das Studio bei Nacht](/api/bilder/beispiel)",
      },
      {
        title: "Bild mit Unterschrift",
        hint: "Der Text in Anführungszeichen erscheint sichtbar unter dem Bild.",
        source: '![Das Studio bei Nacht](/api/bilder/beispiel "Unser Studio, kurz vor der Sendung")',
      },
    ],
  },
  {
    title: "Hervorgehobene Kästen",
    intro: "Für alles, was nicht im Fließtext untergehen soll.",
    examples: [
      {
        title: "Hinweis",
        source: "::: hinweis\nDie Sendung beginnt um 20 Uhr.\n:::",
      },
      {
        title: "Warnung",
        source: "::: warnung\nDer Stream ist während des Umbaus zeitweise offline.\n:::",
      },
      {
        title: "Erfolg",
        source: "::: erfolg\nGeschafft — wir sind wieder auf Sendung.\n:::",
      },
    ],
  },
  {
    title: "Tabellen und Code",
    examples: [
      {
        title: "Tabelle",
        hint: "Die zweite Zeile mit den Bindestrichen macht daraus eine Tabelle.",
        source:
          "| Sendung | Zeit | Wer |\n| --- | --- | --- |\n| VoltFM NOW | 20:00 | jannikjbi |\n| Nachtschicht | 23:00 | mochikotv |",
      },
      {
        title: "Codeblock",
        hint: "Drei Gravis-Zeichen (```) darüber und darunter.",
        source: "```\nnpm run dev\n```",
      },
    ],
  },
];
