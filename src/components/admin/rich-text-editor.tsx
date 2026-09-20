"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Icon, ImageIcon, EditIcon, LoadingIcon } from "@/lib/icons";
import { useUploadThing } from "@/lib/uploadthing";
import { previewRichText } from "@/app/admin/preview-actions";
import { ImageDialog } from "./image-dialog";
import styles from "./rich-text-editor.module.css";

/** Steht im eingefuegten Bild, bis jemand die Beschreibung tippt. */
const ALT_PLACEHOLDER = "Bildbeschreibung ergänzen";

/**
 * Das Textfeld für Artikel und Veranstaltungen.
 *
 * Geschrieben wird Markdown, gespeichert wird HTML: Die Server Action lässt den
 * Text durch `markdownToHtml` und danach durch `sanitizeHtml` laufen. Die
 * Sicherheitsgrenze liegt also weiterhin beim Speichern (Leitfaden 2.2), aber
 * beim Schreiben muss niemand mehr Tags tippen.
 *
 * Vorher stand hier eine Werkzeugleiste mit gut zwanzig Knöpfen über einem
 * Feld voller spitzer Klammern. Zwei Knöpfe genügen: alles Übrige ist mit
 * `##`, `**` und `-` schneller getippt als geklickt.
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
  const [imageOpen, setImageOpen] = useState(false);
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

  const { startUpload, isUploading } = useUploadThing("articleImage", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.serverData?.url ?? res?.[0]?.ufsUrl;
      if (!url) return;
      setUploadError(null);
      /* Der Alt-Text wird vorbelegt und gleich markiert: So steht nie ein Bild
         ohne Beschreibung im Text, und der erste Tastendruck überschreibt den
         Platzhalter. */
      const snippet = `\n\n![${ALT_PLACEHOLDER}](${url})\n\n`;
      const altAt = snippet.indexOf(ALT_PLACEHOLDER);
      insertAtCaret(snippet, altAt, altAt + ALT_PLACEHOLDER.length);
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
      void startUpload([image]);
      return true;
    },
    [startUpload],
  );

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar} role="toolbar" aria-label="Werkzeuge">
        <Button
          type="button"
          variant="neutral"
          mode="stroke"
          size="sm"
          onClick={() => setImageOpen(true)}
        >
          <Icon icon={isUploading ? LoadingIcon : ImageIcon} spin={isUploading} />
          Bild einfügen
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

        <span className={styles.dropHint}>
          {isUploading
            ? "Bild wird hochgeladen …"
            : "oder Bild in das Textfeld ziehen bzw. einfügen"}
        </span>
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
        Markdown: <code>## Überschrift</code>, <code>**fett**</code>,{" "}
        <code>[Link](https://…)</code>, <code>- Liste</code>, <code>&gt; Zitat</code>
      </p>

      <ImageDialog
        open={imageOpen}
        onOpenChange={setImageOpen}
        onInsert={(html) => insertAtCaret(`\n\n${html}\n\n`)}
      />
    </div>
  );
}
