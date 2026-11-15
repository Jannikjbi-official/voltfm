"use client";

import { useActionState } from "react";
import { Button } from "@heroui/react";
import {
  CheckboxField,
  FormMessage,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/common/form-field";
import { Icon, LoadingIcon, CheckIcon } from "@/lib/icons";
import { formatDate, toStationTimeInput } from "@/lib/format";
import { ImageUpload } from "./image-upload";
import { RichTextEditor } from "./rich-text-editor";
import { useActionFeedback } from "./use-action-feedback";
import { saveArticle, type ArticleFormState } from "@/app/admin/news/actions";
import type { ArticleDTO, CategoryDTO } from "@/services/content";

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
    <form action={formAction} className="flex flex-col gap-6">
      {article && <input type="hidden" name="id" value={article.id} />}

      {state.status === "error" && state.message && (
        <FormMessage status="error">{state.message}</FormMessage>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <TextField
            name="title"
            label="Titel"
            required
            minLength={4}
            maxLength={160}
            defaultValue={article?.title}
          />

          <TextAreaField
            name="excerpt"
            label="Teaser"
            required
            minLength={20}
            maxLength={400}
            rows={3}
            defaultValue={article?.excerpt}
          />

          {/* Beim Bearbeiten erscheint wieder der getippte Text. Bei
              Beiträgen aus der HTML-Zeit gibt es den nicht — dann steht das
              HTML da, und der Konverter reicht es unverändert durch. */}
          <RichTextEditor
            name="content"
            label="Text"
            required
            rows={20}
            defaultValue={article?.contentSource ?? article?.content}
            placeholder="Schreib deinen Beitrag …"
          />
        </div>

        <aside className="flex min-w-0 flex-col gap-4 lg:self-start">
          {/* Die Seitenspalte in drei Abschnitte geteilt: wo der Beitrag
              erscheint, wie er aussieht, und wer ihn geschrieben hat. */}
          <section
            aria-labelledby="article-placement"
            className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5"
          >
            <h2 id="article-placement" className="font-wide text-base font-bold text-foreground">
              Einordnung
            </h2>

            <SelectField
              name="status"
              label="Status"
              defaultValue={article?.status ?? "draft"}
              options={[
                { value: "draft", label: "Entwurf (nicht öffentlich)" },
                { value: "scheduled", label: "Geplant" },
                { value: "published", label: "Veröffentlicht" },
                { value: "archived", label: "Archiviert" },
              ]}
            />

            <SelectField
              name="categorySlug"
              label="Kategorie"
              required
              defaultValue={article?.categorySlug ?? categories[0]?.slug}
              options={categories.map((category) => ({ value: category.slug, label: category.name }))}
            />

            <TextField
              name="publishedAt"
              label="Veröffentlichung"
              type="datetime-local"
              /* Senderzeit (Berlin), nicht UTC: Wer 20:00 sieht, meint 20:00 in
                 Hamburg. Der Server liest das Feld mit parseStationTime. */
              defaultValue={toStationTimeInput(article?.publishedAt) || undefined}
              description={<>Für &bdquo;Geplant&ldquo; ein Datum in der Zukunft setzen.</>}
            />

            <TextField
              name="slug"
              label="Slug (URL)"
              maxLength={120}
              defaultValue={article?.slug}
              placeholder="mein-beitrag"
              description="Leer lassen = aus dem Titel."
            />

            <TextField
              name="tags"
              label="Schlagwörter"
              defaultValue={article?.tags.join(", ")}
              placeholder="Radio, Community"
              description="Komma-getrennt."
            />

            <CheckboxField
              name="featured"
              label="Als Aufmacher hervorheben"
              defaultChecked={article?.featured}
            />

            {/* Fehlt der Wert (neuer Beitrag), ist der Haken gesetzt. */}
            <CheckboxField
              name="announceOnDiscord"
              label="Im Discord ankündigen, sobald er online ist"
              defaultChecked={article?.announceOnDiscord !== false}
              description={
                article?.discordAnnouncedAt
                  ? `Schon angekündigt am ${formatDate(article.discordAnnouncedAt)}. Ein zweites Mal geht er nicht raus.`
                  : undefined
              }
            />
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
            {/* Die Ueberschrift kommt von <ImageUpload> selbst — zweimal
                "Titelbild" untereinander waere nur Laerm. */}
            <ImageUpload
              name="coverImage"
              value={article?.coverImage}
              label="Titelbild"
              endpoint="articleImage"
            />

            <TextField
              name="coverAlt"
              label="Bildbeschreibung"
              defaultValue={article?.coverAlt}
              maxLength={200}
              description="Für Screenreader und wenn das Bild nicht lädt."
            />
          </section>

          <section
            aria-labelledby="article-author"
            className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5"
          >
            <h2 id="article-author" className="font-wide text-base font-bold text-foreground">
              Autor
            </h2>
            {/* Kein Eingabefeld: Der Autor kommt aus der Anmeldung. Angezeigt
                wird er trotzdem, damit man vor dem Speichern sieht, unter
                welchem Namen der Beitrag erscheint. */}
            <p className="text-sm font-semibold text-foreground">
              {article?.authorName ?? authorName}
            </p>
            <p className="description">
              {article
                ? "Bleibt beim ursprünglichen Autor, auch wenn jemand anderes bearbeitet."
                : "Wird automatisch von deinem Konto übernommen."}
            </p>
          </section>

          <Button type="submit" variant="primary" size="lg" fullWidth isPending={pending}>
            <Icon icon={pending ? LoadingIcon : CheckIcon} spin={pending} />
            {pending ? "Wird gespeichert …" : "Speichern"}
          </Button>
        </aside>
      </div>
    </form>
  );
}
