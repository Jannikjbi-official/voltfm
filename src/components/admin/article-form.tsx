"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { CheckBox } from "@/components/ui/checkbox";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { Icon, LoadingIcon, CheckIcon } from "@/lib/icons";
import { ImageUpload } from "./image-upload";
import { RichTextEditor } from "./rich-text-editor";
import { useActionFeedback } from "./use-action-feedback";
import { saveArticle, type ArticleFormState } from "@/app/admin/news/actions";
import type { ArticleDTO, CategoryDTO } from "@/services/content";
import styles from "./admin-form.module.css";

const initial: ArticleFormState = { status: "idle" };

/**
 * The article editor.
 *
 * The body is authored as HTML through <RichTextEditor>. The server sanitises
 * whatever arrives against a strict allow-list, so the editor can be permissive
 * without the render path becoming an XSS surface.
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

  /* Bei Erfolg leitet die Action weiter, hier kommt also nur der Fehlerfall an
     — und genau der soll auch sichtbar sein, wenn man unten am Knopf steht. */
  useActionFeedback(state as { status: "idle" | "error" | "success"; message?: string });

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
            <FieldLabel>Inhalt (HTML)</FieldLabel>
            <RichTextEditor
              name="content"
              required
              rows={22}
              defaultValue={article?.content}
              placeholder="<p>Dein Text …</p>"
            />
            <FieldDescription>
              Erlaubt: Überschriften (h2–h4), Absätze, Fett/Kursiv/Unterstrichen,
              Markierungen, Listen, Zitate, Tabellen, Infoboxen, Links, Bilder und
              Code. Alles andere wird beim Speichern entfernt.
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

          {/* Kein Eingabefeld: Der Autor kommt aus der Anmeldung. Angezeigt
              wird er trotzdem, damit man vor dem Speichern sieht, unter
              welchem Namen der Beitrag erscheint. */}
          <div className={styles.field}>
            <span className={styles.label}>Autor</span>
            <p className={styles.readonly}>{article?.authorName ?? authorName}</p>
            <FieldDescription>
              {article
                ? "Bleibt beim ursprünglichen Autor, auch wenn jemand anderes bearbeitet."
                : "Wird automatisch von deinem Konto übernommen."}
            </FieldDescription>
          </div>

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
