"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Icon, ImageIcon, EditIcon, LoadingIcon } from "@/lib/icons";
import { useUploadThing } from "@/lib/uploadthing";
import { previewRichText } from "@/app/admin/preview-actions";
import styles from "./rich-text-editor.module.css";

/** Steht im eingefuegten Bild, wenn der Dateiname nichts hergibt. */
export const ALT_PLACEHOLDER = "Bildbeschreibung ergänzen";

/**
 * Macht aus einem Dateinamen einen Vorschlag für die Bildbeschreibung.
 *
 * "studio-umbau-2026.jpg" wird zu "studio umbau 2026" — kein guter Alt-Text,
 * aber ein Anfang, der sich überschreiben lässt. Bei "IMG_2843" kommt nichts
 * Brauchbares heraus, dann bleibt es beim Platzhalter.
 */
function altFromFileName(name: string): string {
  const text = name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return /[a-zäöüß]{3}/i.test(text) && !/^(img|dsc|foto|image|screenshot|bild)[\s\d]*$/i.test(text)
    ? text
    : ALT_PLACEHOLDER;
}

/**
 * Das Textfeld für Artikel und Veranstaltungen.
 *
 * Geschrieben wird Markdown, gespeichert wird HTML: Die Server Action lässt den
 * Text durch `markdownToHtml` und danach durch `sanitizeHtml` laufen. Die
 * Sicherheitsgrenze liegt also weiterhin beim Speichern (Leitfaden 2.2), aber
 * beim Schreiben muss niemand mehr Tags tippen.
 *
 * Vorher stand hier eine Werkzeugleiste mit gut zwanzig Knöpfen über einem
 * Feld voller spitzer Klammern, und „Bild einfügen" öffnete einen Dialog mit
 * sechs Feldern. Zwei Knöpfe genügen: alles Übrige ist mit `##`, `**` und `-`
 * schneller getippt als geklickt, und die Bildunterschrift steht als
 * `![Beschreibung](…  "Unterschrift")` dort, wo man ohnehin schreibt.
 */
export function RichTextEditor({
  name,
  defaultValue,
  rows = 20,
  placeholder,
  required,
}: {
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [rendering, startRendering] = useTransition();

  /** Setzt Text an der Schreibmarke ein und lässt die Marke sinnvoll stehen. */
  const insertAtCaret = useCallback(
    (text: string, selectFrom?: number, selectTo?: number) => {
      const textarea = ref.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      textarea.value = textarea.value.slice(0, start) + text + textarea.value.slice(end);
      textarea.focus();
      textarea.selectionStart = start + (selectFrom ?? text.length);
      textarea.selectionEnd = start + (selectTo ?? selectFrom ?? text.length);

      // Die direkte Zuweisung geht an Reacts Eingabeverfolgung vorbei. Das
      // Formular liest beim Absenden den DOM-Wert, aber alles, was auf
      // Eingaben lauscht, braucht dieses Ereignis.
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    },
    [],
  );

  /* Was beim naechsten fertigen Upload als Beschreibung eingesetzt wird. Ein
     Ref und kein State: Es wird zwischen zwei Ereignissen gemerkt, nicht
     angezeigt, und soll kein erneutes Rendern ausloesen. */
  const pendingAlt = useRef(ALT_PLACEHOLDER);

  const { startUpload, isUploading } = useUploadThing("articleImage", {
    onClientUploadComplete: (res) => {
      // Kein Rueckfall auf die Anbieter-Adresse — siehe lib/images.ts.
      const url = res?.[0]?.serverData?.url;
      if (!url) return;
      setUploadError(null);
      /* Die Beschreibung wird vorbelegt und gleich markiert: Der erste
         Tastendruck ueberschreibt sie. Stehen bleiben darf sie nicht — die
         Server Action weist einen Beitrag mit unbeschriebenem Bild zurueck. */
      const alt = pendingAlt.current;
      const snippet = `

![${alt}](${url})

`;
      const altAt = snippet.indexOf(alt);
      insertAtCaret(snippet, altAt, altAt + alt.length);
    },
    onUploadError: () =>
      setUploadError("Das Bild konnte nicht hochgeladen werden. Ist UPLOADTHING_TOKEN gesetzt?"),
  });

  /** Nimmt die erste Bilddatei aus einer Dateiübergabe. */
  const uploadFirstImage = useCallback(
    (files: FileList | File[] | null | undefined) => {
      const image = Array.from(files ?? []).find((file) => file.type.startsWith("image/"));
      if (!image) return false;
      setUploadError(null);
      pendingAlt.current = altFromFileName(image.name);
      void startUpload([image]);
      return true;
    },
    [startUpload],
  );

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar} role="toolbar" aria-label="Werkzeuge">
        {/* Direkt die Dateiauswahl statt eines Zwischendialogs: Bildunterschrift
            und Beschreibung stehen danach im Text und lassen sich dort
            tippen, wo man ohnehin schreibt. */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            uploadFirstImage(event.target.files);
            // Damit dieselbe Datei ein zweites Mal ausgewählt werden kann.
            event.target.value = "";
          }}
        />

        <Button
          type="button"
          variant="neutral"
          mode="stroke"
          size="sm"
          disabled={isUploading}
          onClick={() => fileRef.current?.click()}
        >
          <Icon icon={isUploading ? LoadingIcon : ImageIcon} spin={isUploading} />
          {isUploading ? "Bild wird hochgeladen …" : "Bild einfügen"}
        </Button>

        <Button
          type="button"
          variant="neutral"
          mode={preview ? "filled" : "stroke"}
          size="sm"
          disabled={rendering}
          onClick={() => {
            if (preview) {
              setPreview(false);
              return;
            }
            /* Gerendert wird auf dem Server, mit demselben Weg wie beim
               Speichern — so zeigt die Vorschau wirklich das Ergebnis und
               nicht etwas Ähnliches. */
            const source = ref.current?.value ?? "";
            startRendering(async () => {
              setPreviewHtml(await previewRichText(source));
              setPreview(true);
            });
          }}
        >
          <Icon icon={rendering ? LoadingIcon : EditIcon} spin={rendering} />
          {rendering ? "Moment …" : preview ? "Weiter schreiben" : "Vorschau"}
        </Button>

        <span className={styles.dropHint}>oder Bild in das Textfeld ziehen bzw. einfügen</span>
      </div>

      {/* Das Feld bleibt während der Vorschau eingehängt — sein Wert ist das,
          was abgeschickt wird, und darf nicht verlorengehen. */}
      <div hidden={preview}>
        <Textarea
          ref={ref}
          name={name}
          required={required}
          rows={rows}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={styles.area}
          data-dragover={dragOver || undefined}
          onPaste={(event) => {
            // Manche Browser legen ein eingefügtes Bild nur unter `items` ab,
            // nicht unter `files`. Nur abfangen, wenn wirklich eines dabei ist
            // — sonst bliebe normales Textkopieren auf der Strecke.
            const fromItems = Array.from(event.clipboardData?.items ?? [])
              .filter((item) => item.type.startsWith("image/"))
              .map((item) => item.getAsFile())
              .filter((file): file is File => file !== null);
            const files = event.clipboardData?.files;
            if (uploadFirstImage(files?.length ? files : fromItems)) event.preventDefault();
          }}
          onDragOver={(event) => {
            if (!event.dataTransfer?.types.includes("Files")) return;
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            if (!event.dataTransfer?.files?.length) return;
            event.preventDefault();
            setDragOver(false);
            uploadFirstImage(event.dataTransfer.files);
          }}
        />
      </div>

      {preview && (
        <div className={styles.preview}>
          <p className={styles.previewHint}>
            So sieht der Beitrag aus. Was hier fehlt, wird auch beim Speichern
            entfernt.
          </p>
          {/* Kommt aus previewRichText() und ist dort schon bereinigt. */}
          <div className={styles.previewBody} dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      )}

      {uploadError && <p className={styles.uploadError}>{uploadError}</p>}

      <p className={styles.syntax}>
        <code>## Überschrift</code>, <code>**fett**</code>,{" "}
        <code>[Link](https://…)</code>, <code>- Liste</code>, <code>&gt; Zitat</code> —{" "}
        <Link href="/admin/markdown" className={styles.syntaxLink} target="_blank">
          alles Weitere
        </Link>
      </p>

    </div>
  );
}
