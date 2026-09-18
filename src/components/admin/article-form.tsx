"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { CheckBox } from "@/components/ui/checkbox";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { Icon, ImageIcon, LoadingIcon, CheckIcon } from "@/lib/icons";
import { ImageUpload } from "./image-upload";
import { useUploadThing } from "@/lib/uploadthing";
import { saveArticle, type ArticleFormState } from "@/app/admin/news/actions";
import type { ArticleDTO, CategoryDTO } from "@/services/content";
import styles from "./admin-form.module.css";

const initial: ArticleFormState = { status: "idle" };

/**
 * The article editor.
 *
 * The body is authored as HTML in a textarea with an image-insert helper. The
 * server sanitises whatever arrives against a strict allow-list, so the editor
 * can be permissive without the render path becoming an XSS surface.
 */
export function ArticleForm({
  article,
  categories,
  authorName,
}: {
  article?: ArticleDTO;
  categories: CategoryDTO[];
  authorName: string;
}) {
  const [state, formAction, pending] = useActionState(saveArticle, initial);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [inserted, setInserted] = useState(false);

  const { startUpload, isUploading } = useUploadThing("articleImage", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.serverData?.url ?? res?.[0]?.ufsUrl;
      if (url) insertImage(url);
    },
  });

  /** Inserts a <figure> at the caret, so images land where the author is typing. */
  function insertImage(url: string) {
    const textarea = contentRef.current;
    if (!textarea) return;

    const snippet = `\n<figure>\n  <img src="${url}" alt="" />\n  <figcaption></figcaption>\n</figure>\n`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    textarea.value = textarea.value.slice(0, start) + snippet + textarea.value.slice(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + snippet.length;

    setInserted(true);
    window.setTimeout(() => setInserted(false), 2000);
  }

  return (
    <form action={formAction} className={styles.form}>
      {article && <input type="hidden" name="id" value={article.id} />}

      {state.status === "error" && state.message && (
        <Alert variant="lighter" status="error" role="alert">
          <AlertContent>
            <AlertDescription>{state.message}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <div className={styles.grid}>
        <div className={styles.main}>
          <Field name="title" className={styles.field}>
            <FieldLabel>Titel</FieldLabel>
            <Input name="title" required minLength={4} maxLength={160} defaultValue={article?.title} />
          </Field>

          <Field name="slug" className={styles.field}>
            <FieldLabel>Slug</FieldLabel>
            <Input name="slug" maxLength={120} defaultValue={article?.slug} placeholder="wird aus dem Titel erzeugt" />
            <FieldDescription>Leer lassen, um ihn aus dem Titel zu erzeugen.</FieldDescription>
          </Field>

          <Field name="excerpt" className={styles.field}>
            <FieldLabel>Teaser</FieldLabel>
            <Textarea name="excerpt" required minLength={20} maxLength={400} rows={3} defaultValue={article?.excerpt} />
          </Field>

          <Field name="content" className={styles.field}>
            <div className={styles.contentHead}>
              <FieldLabel>Inhalt (HTML)</FieldLabel>
              <div className={styles.contentTools}>
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
                  <Icon
                    icon={isUploading ? LoadingIcon : inserted ? CheckIcon : ImageIcon}
                    spin={isUploading}
                  />
                  {isUploading ? "Lädt …" : inserted ? "Eingefügt" : "Bild einfügen"}
                </Button>
              </div>
            </div>
            <Textarea
              ref={contentRef}
              name="content"
              required
              rows={22}
              defaultValue={article?.content}
              className={styles.contentArea}
              placeholder="<p>Dein Text …</p>"
            />
            <FieldDescription>
              Erlaubt: Überschriften (h2–h4), Absätze, Fett/Kursiv, Listen, Zitate,
              Links, Bilder, Code. Alles andere wird beim Speichern entfernt.
            </FieldDescription>
          </Field>
        </div>

        <aside className={styles.side}>
          <Field name="status" className={styles.field}>
            <FieldLabel>Status</FieldLabel>
            <select name="status" defaultValue={article?.status ?? "draft"} className={styles.select}>
              <option value="draft">Entwurf</option>
              <option value="scheduled">Geplant</option>
              <option value="published">Veröffentlicht</option>
              <option value="archived">Archiviert</option>
            </select>
          </Field>

          <Field name="publishedAt" className={styles.field}>
            <FieldLabel>Veröffentlichung</FieldLabel>
            <Input
              name="publishedAt"
              type="datetime-local"
              defaultValue={
                article?.publishedAt
                  ? new Date(article.publishedAt).toISOString().slice(0, 16)
                  : undefined
              }
            />
            <FieldDescription>Für &bdquo;Geplant&ldquo; ein Datum in der Zukunft setzen.</FieldDescription>
          </Field>

          <Field name="categorySlug" className={styles.field}>
            <FieldLabel>Kategorie</FieldLabel>
            <select
              name="categorySlug"
              defaultValue={article?.categorySlug ?? categories[0]?.slug}
              className={styles.select}
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field name="tags" className={styles.field}>
            <FieldLabel>Tags</FieldLabel>
            <Input name="tags" defaultValue={article?.tags.join(", ")} placeholder="Radio, Community" />
            <FieldDescription>Kommagetrennt.</FieldDescription>
          </Field>

          <Field name="authorName" className={styles.field}>
            <FieldLabel>Autor</FieldLabel>
            <Input name="authorName" required defaultValue={article?.authorName ?? authorName} />
          </Field>

          <ImageUpload
            name="coverImage"
            value={article?.coverImage}
            label="Titelbild"
            endpoint="articleImage"
          />

          <Field name="coverAlt" className={styles.field}>
            <FieldLabel>Bildbeschreibung</FieldLabel>
            <Input name="coverAlt" defaultValue={article?.coverAlt} maxLength={200} />
            <FieldDescription>Für Screenreader und wenn das Bild nicht lädt.</FieldDescription>
          </Field>

          <label className={styles.checkboxRow}>
            <CheckBox name="featured" defaultChecked={article?.featured} />
            <span>Als Aufmacher hervorheben</span>
          </label>

          <details className={styles.seo}>
            <summary>SEO</summary>
            <Field name="seoTitle" className={styles.field}>
              <FieldLabel>SEO-Titel</FieldLabel>
              <Input name="seoTitle" maxLength={160} defaultValue={article?.seoTitle} />
            </Field>
            <Field name="seoDescription" className={styles.field}>
              <FieldLabel>SEO-Beschreibung</FieldLabel>
              <Textarea name="seoDescription" rows={3} maxLength={300} defaultValue={article?.seoDescription} />
            </Field>
          </details>

          <Button type="submit" variant="primary" mode="filled" size="lg" disabled={pending}>
            <Icon icon={pending ? LoadingIcon : CheckIcon} spin={pending} />
            {pending ? "Wird gespeichert …" : "Speichern"}
          </Button>
        </aside>
      </div>
    </form>
  );
}
