"use client";

import { useCallback, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Icon, ImageIcon, LinkIcon, EditIcon } from "@/lib/icons";
import {
  EDITOR_ACTIONS,
  EDITOR_SNIPPETS,
  escapeAttribute,
  buildFigure,
  type EditorAction,
} from "./editor-actions";
import { useUploadThing } from "@/lib/uploadthing";
import { ImageDialog } from "./image-dialog";
import styles from "./rich-text-editor.module.css";

/** Steht im eingefuegten Bild, bis jemand die Beschreibung tippt. */
const ALT_PLACEHOLDER = "Bildbeschreibung ergänzen";

const GROUP_LABELS: Record<EditorAction["group"], string> = {
  text: "Text",
  block: "Absatz",
  layout: "Layout",
};

/**
 * HTML body editor with a formatting toolbar.
 *
 * The body is authored as HTML rather than in a WYSIWYG surface: the server
 * sanitises against a strict allow-list on save, so what is stored is always
 * exactly what the render path can handle. The toolbar exists so that authoring
 * that HTML does not mean typing tags by hand.
 */
export function RichTextEditor({
  name,
  defaultValue,
  rows = 22,
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

  /** Replaces the current selection and restores a sensible caret afterwards. */
  const replaceSelection = useCallback(
    (build: (selected: string) => { text: string; selectFrom?: number; selectTo?: number }) => {
      const textarea = ref.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.slice(start, end);
      const { text, selectFrom, selectTo } = build(selected);

      textarea.value = textarea.value.slice(0, start) + text + textarea.value.slice(end);
      textarea.focus();
      textarea.selectionStart = start + (selectFrom ?? text.length);
      textarea.selectionEnd = start + (selectTo ?? selectFrom ?? text.length);

      // A direct value assignment bypasses React's own input tracking; the form
      // reads the DOM value on submit, but anything listening for input needs
      // this event.
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    },
    [],
  );

  const applyAction = useCallback(
    (action: EditorAction) => {
      replaceSelection((selected) => {
        if (action.perLine) {
          const lines = (selected || action.placeholder || "").split("\n");
          const wrapper = action.id === "ul" ? "ul" : "ol";
          const body = lines
            .map((line) => `  ${action.before}${line.trim()}${action.after}`)
            .join("\n");
          return { text: `\n<${wrapper}>\n${body}\n</${wrapper}>\n` };
        }

        const inner = selected || action.placeholder || "";
        const text = `${action.before}${inner}${action.after}`;
        // With nothing selected, leave the placeholder selected so typing
        // replaces it straight away.
        return selected
          ? { text }
          : { text, selectFrom: action.before.length, selectTo: action.before.length + inner.length };
      });
    },
    [replaceSelection],
  );

  /**
   * Bild direkt im Textfeld: ziehen oder einfuegen.
   *
   * Der Dialog bleibt fuer alles, was Bildunterschrift oder Ausrichtung
   * braucht. Hier geht es um den haeufigen Fall — Bildschirmfoto in die
   * Zwischenablage, ab ins Textfeld. Der Alt-Text bleibt leer und muss
   * nachgetragen werden; das ist ehrlicher als ein erfundener.
   */
  const { startUpload, isUploading } = useUploadThing("articleImage", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.serverData?.url ?? res?.[0]?.ufsUrl;
      if (!url) return;
      setUploadError(null);
      /* Der Alt-Text wird vorbelegt und gleich markiert: So steht nie ein
         Bild ohne Beschreibung im Text, und der erste Tastendruck
         ueberschreibt den Platzhalter. */
      const figure = `
${buildFigure({ url, alt: ALT_PLACEHOLDER })}
`;
      const altAt = figure.indexOf(ALT_PLACEHOLDER);
      replaceSelection(() => ({
        text: figure,
        selectFrom: altAt,
        selectTo: altAt + ALT_PLACEHOLDER.length,
      }));
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

  const insertSnippet = useCallback(
    (html: string) => replaceSelection(() => ({ text: `\n${html}\n` })),
    [replaceSelection],
  );

  const insertLink = useCallback(() => {
    const href = window.prompt("Wohin soll der Link führen?", "https://");
    if (!href) return;
    replaceSelection((selected) => ({
      text: `<a href="${escapeAttribute(href)}">${selected || "Linktext"}</a>`,
    }));
  }, [replaceSelection]);

  /** Ctrl/Cmd shortcuts for the inline actions that have one. */
  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    const action = EDITOR_ACTIONS.find((item) => item.shortcut === event.key.toLowerCase());
    if (!action) return;
    event.preventDefault();
    applyAction(action);
  }

  const groups: EditorAction["group"][] = ["text", "block"];

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar} role="toolbar" aria-label="Formatierung">
        {groups.map((group) => (
          <div key={group} className={styles.group} aria-label={GROUP_LABELS[group]}>
            {EDITOR_ACTIONS.filter((action) => action.group === group).map((action) => (
              <button
                key={action.id}
                type="button"
                className={styles.tool}
                onClick={() => applyAction(action)}
                title={
                  action.shortcut
                    ? `${action.label} (Strg+${action.shortcut.toUpperCase()})`
                    : action.label
                }
              >
                {action.label}
              </button>
            ))}
          </div>
        ))}

        <div className={styles.group} aria-label="Einfügen">
          <button type="button" className={styles.tool} onClick={insertLink} title="Link einfügen">
            <Icon icon={LinkIcon} />
            Link
          </button>
          <button
            type="button"
            className={styles.tool}
            onClick={() => setImageOpen(true)}
            title="Bild als Figure einfügen"
          >
            <Icon icon={ImageIcon} />
            Bild
          </button>
        </div>

        <div className={styles.group} aria-label="Bausteine">
          {EDITOR_SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              type="button"
              className={styles.tool}
              onClick={() => insertSnippet(snippet.html)}
              title={snippet.hint}
            >
              {snippet.label}
            </button>
          ))}
        </div>

        <span className={styles.dropHint}>
          {isUploading
            ? "Bild wird hochgeladen …"
            : "oder Bild ins Textfeld ziehen bzw. einfügen"}
        </span>

        <div className={styles.spacer} />

        <Button
          type="button"
          variant="neutral"
          mode={preview ? "filled" : "ghost"}
          size="sm"
          onClick={() => {
            setPreviewHtml(ref.current?.value ?? "");
            setPreview((open) => !open);
          }}
        >
          <Icon icon={EditIcon} />
          {preview ? "Weiter schreiben" : "Vorschau"}
        </Button>
      </div>

      {/* The textarea stays mounted while previewing so its value — the thing
          the form submits — is never lost. */}
      <div hidden={preview}>
        <Textarea
          ref={ref}
          name={name}
          required={required}
          rows={rows}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          className={styles.area}
          data-dragover={dragOver || undefined}
          onPaste={(event) => {
            // Nur abfangen, wenn wirklich ein Bild dabei ist — sonst bliebe
            // normales Textkopieren auf der Strecke.
            if (uploadFirstImage(event.clipboardData?.files)) event.preventDefault();
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
            Ungefähre Vorschau. Beim Speichern wird nicht erlaubtes HTML entfernt.
          </p>
          {/* Admin-authored content, shown only to its own author inside the
              admin area, and sanitised again on the server before it is ever
              rendered publicly. */}
          <div className={styles.previewBody} dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      )}

      {uploadError && <p className={styles.uploadError}>{uploadError}</p>}

      <ImageDialog
        open={imageOpen}
        onOpenChange={setImageOpen}
        onInsert={(html) => replaceSelection(() => ({ text: html }))}
      />
    </div>
  );
}
