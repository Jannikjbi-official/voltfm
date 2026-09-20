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
 * Die Artikelmaske.
 *
 * Der Text wird als Markdown geschrieben; die Server Action macht daraus HTML
 * und bereinigt es gegen eine feste Liste erlaubter Tags. Der Editor darf
 * deshalb grosszuegig sein, ohne dass die Ausgabe zur XSS-Flaeche wird.
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

          <Field name="excerpt" className={styles.field}>
            <FieldLabel>Teaser</FieldLabel>
            <Textarea name="excerpt" required minLength={20} maxLength={400} rows={3} defaultValue={article?.excerpt} />
          </Field>

          <Field name="content" className={styles.field}>
            <FieldLabel>Text</FieldLabel>
            {/* Beim Bearbeiten erscheint wieder der getippte Text. Bei
                Beiträgen aus der HTML-Zeit gibt es den nicht — dann steht das
                HTML da, und der Konverter reicht es unverändert durch. */}
            <RichTextEditor
              name="content"
              required
              rows={20}
              defaultValue={article?.contentSource ?? article?.content}
              placeholder="Schreib deinen Beitrag …"
            />
          </Field>
        </div>

        <aside className={styles.side}>
          {/* Die Seitenspalte in drei Abschnitte geteilt: wo der Beitrag
              erscheint, wie er aussieht, und wer ihn geschrieben hat. */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Einordnung</h2>

            <Field name="status" className={styles.field}>
              <FieldLabel>Status</FieldLabel>
              <select name="status" defaultValue={article?.status ?? "draft"} className={styles.select}>
                <option value="draft">Entwurf (nicht öffentlich)</option>
                <option value="scheduled">Geplant</option>
                <option value="published">Veröffentlicht</option>
                <option value="archived">Archiviert</option>
              </select>
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

            <Field name="slug" className={styles.field}>
              <FieldLabel>Slug (URL)</FieldLabel>
              <Input name="slug" maxLength={120} defaultValue={article?.slug} placeholder="mein-beitrag" />
              <FieldDescription>Leer lassen = aus dem Titel.</FieldDescription>
            </Field>

            <Field name="tags" className={styles.field}>
              <FieldLabel>Schlagwörter</FieldLabel>
              <Input name="tags" defaultValue={article?.tags.join(", ")} placeholder="Radio, Community" />
              <FieldDescription>Komma-getrennt.</FieldDescription>
            </Field>

            <label className={styles.checkboxRow}>
              <CheckBox name="featured" defaultChecked={article?.featured} />
              <span>Als Aufmacher hervorheben</span>
            </label>
          </section>

          <section className={styles.section}>
            {/* Die Ueberschrift kommt von <ImageUpload> selbst — zweimal
                "Titelbild" untereinander waere nur Laerm. */}
            <ImageUpload
              name="coverImage"
              value={article?.coverImage}
              label="Titelbild"
              endpoint="articleImage"
            />

            <Field name="coverAlt" className={styles.field}>
              <FieldLabel>Bildbeschreibung</FieldLabel>
              <Input name="coverAlt" defaultValue={article?.coverAlt} maxLength={200} />
              <FieldDescription>
                Für Screenreader und wenn das Bild nicht lädt.
              </FieldDescription>
            </Field>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Autor</h2>

            {/* Kein Eingabefeld: Der Autor kommt aus der Anmeldung. Angezeigt
                wird er trotzdem, damit man vor dem Speichern sieht, unter
                welchem Namen der Beitrag erscheint. */}
            <div className={styles.field}>
              <p className={styles.readonly}>{article?.authorName ?? authorName}</p>
              {/* Bewusst kein <FieldDescription>: Das ist ein Base-UI-Bauteil
                  und verlangt ein <Field> darum herum. Hier gibt es kein
                  Eingabefeld, also auch kein Field — sonst wirft es beim
                  Rendern. */}
              <p className={styles.hint}>
                {article
                  ? "Bleibt beim ursprünglichen Autor, auch wenn jemand anderes bearbeitet."
                  : "Wird automatisch von deinem Konto übernommen."}
              </p>
            </div>
          </section>

          <Button type="submit" variant="primary" mode="filled" size="lg" disabled={pending}>
            <Icon icon={pending ? LoadingIcon : CheckIcon} spin={pending} />
            {pending ? "Wird gespeichert …" : "Speichern"}
          </Button>
        </aside>
      </div>
    </form>
  );
}
