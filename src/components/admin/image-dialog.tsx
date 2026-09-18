"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Icon, ImageIcon, LoadingIcon, CheckIcon } from "@/lib/icons";
import { useUploadThing } from "@/lib/uploadthing";
import { buildFigure, FIGURE_LAYOUTS } from "./editor-actions";
import styles from "./image-dialog.module.css";
import formStyles from "./admin-form.module.css";

/**
 * The image wrapper dialog.
 *
 * Inserting an image used to drop a bare `<figure>` skeleton into the HTML that
 * the author then had to fill in by hand — which meant alt text was usually
 * left empty. Here the picture, its alt text, caption, credit and layout are
 * collected first, and `buildFigure` emits one consistent, escaped block.
 */
export function ImageDialog({
  open,
  onOpenChange,
  onInsert,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (html: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [credit, setCredit] = useState("");
  const [layout, setLayout] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Reset when the dialog closes, so the next image does not inherit the last
     one's caption. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) return;
    setUrl("");
    setAlt("");
    setCaption("");
    setCredit("");
    setLayout("");
    setLink("");
    setError(null);
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const { startUpload, isUploading } = useUploadThing("articleImage", {
    onClientUploadComplete: (res) => {
      const uploaded = res?.[0]?.serverData?.url ?? res?.[0]?.ufsUrl;
      if (uploaded) setUrl(uploaded);
      setError(null);
    },
    onUploadError: () => setError("Upload fehlgeschlagen. Ist UPLOADTHING_TOKEN gesetzt?"),
  });

  const ready = url.trim().length > 0 && alt.trim().length > 0;

  function insert() {
    if (!ready) {
      setError(
        url.trim().length === 0
          ? "Bitte zuerst ein Bild hochladen oder eine URL angeben."
          : "Ohne Bildbeschreibung geht es nicht — sie ist für Screenreader Pflicht.",
      );
      return;
    }
    onInsert(buildFigure({ url: url.trim(), alt: alt.trim(), caption, credit, layout, link: link.trim() }));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.popup}>
        <DialogHeader>
          <DialogTitle>Bild einfügen</DialogTitle>
          <DialogDescription>
            Das Bild wird als <code>&lt;figure&gt;</code> mit Bildunterschrift eingefügt.
          </DialogDescription>
        </DialogHeader>

        <div className={styles.body}>
          <div className={styles.previewBox}>
            {url ? (
              <Image
                src={url}
                alt=""
                width={480}
                height={270}
                className={styles.preview}
                unoptimized
              />
            ) : (
              <div className={styles.placeholder}>
                <Icon icon={ImageIcon} />
                <span>Noch kein Bild</span>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void startUpload([file]);
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
              {isUploading ? "Wird hochgeladen …" : url ? "Anderes Bild" : "Bild hochladen"}
            </Button>
          </div>

          <div className={styles.fields}>
            <Field name="figure-url" className={formStyles.field}>
              <FieldLabel>Bild-URL</FieldLabel>
              <Input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://…"
              />
              <FieldDescription>Wird beim Hochladen automatisch gefüllt.</FieldDescription>
            </Field>

            <Field name="figure-alt" className={formStyles.field}>
              <FieldLabel>Bildbeschreibung (Pflicht)</FieldLabel>
              <Input
                value={alt}
                onChange={(event) => setAlt(event.target.value)}
                maxLength={200}
                placeholder="Was ist auf dem Bild zu sehen?"
              />
              <FieldDescription>
                Für Screenreader und wenn das Bild nicht lädt. Nicht dasselbe wie die
                Bildunterschrift.
              </FieldDescription>
            </Field>

            <Field name="figure-caption" className={formStyles.field}>
              <FieldLabel>Bildunterschrift</FieldLabel>
              <Input
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                maxLength={300}
                placeholder="Steht sichtbar unter dem Bild"
              />
            </Field>

            <Field name="figure-credit" className={formStyles.field}>
              <FieldLabel>Bildnachweis</FieldLabel>
              <Input
                value={credit}
                onChange={(event) => setCredit(event.target.value)}
                maxLength={120}
                placeholder="z. B. Jannik Bolting"
              />
              <FieldDescription>Wird als &bdquo;Foto: …&ldquo; an die Unterschrift gehängt.</FieldDescription>
            </Field>

            <Field name="figure-layout" className={formStyles.field}>
              <FieldLabel>Darstellung</FieldLabel>
              <select
                value={layout}
                onChange={(event) => setLayout(event.target.value)}
                className={formStyles.select}
              >
                {FIGURE_LAYOUTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field name="figure-link" className={formStyles.field}>
              <FieldLabel>Verlinken auf</FieldLabel>
              <Input
                value={link}
                onChange={(event) => setLink(event.target.value)}
                placeholder="https://… (optional)"
              />
            </Field>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button type="button" variant="primary" mode="filled" onClick={insert} disabled={!ready}>
            <Icon icon={CheckIcon} />
            Einfügen
          </Button>
          <Button type="button" variant="neutral" mode="stroke" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
