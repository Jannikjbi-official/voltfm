"use client";

import { useActionState, useCallback, useId, useRef, useState } from "react";
import { Button, buttonVariants, cn } from "@heroui/react";
import {
  CheckboxField,
  FormMessage,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/common/form-field";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, LoadingIcon, CheckIcon, ChevronLeftIcon, EditIcon, ExternalLinkIcon } from "@/lib/icons";
import { formatDate, formatRelative, toStationTimeInput } from "@/lib/format";
import { ImageUpload } from "./image-upload";
import { RichTextEditor, type RichTextEditorControls } from "./rich-text-editor";
import { useActionFeedback } from "./use-action-feedback";
import { ARTICLE_STATUS, DOT } from "./admin-ui";
import { saveArticle, type ArticleFormState } from "@/app/admin/news/actions";
import type { ArticleDTO, CategoryDTO } from "@/services/content";
import type { ArticleStatus } from "@/types/content";

const initial: ArticleFormState = { status: "idle" };

const STATUS_ORDER: ArticleStatus[] = ["draft", "scheduled", "published", "archived"];

/** Eine Karte in der Einstellungs-Spalte. */
function SettingsCard({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="surface-card flex flex-col gap-4 rounded-2xl p-5">
      <h2 id={id} className="text-sm font-bold text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Die Artikelmaske.
 *
 * Oben eine feste Aktionsleiste (Status, Vorschau, Löschen, Speichern), links
 * das Schreiben, rechts die Einstellungen. Die Leiste steht ausserhalb des
 * <form>: Status-Auswahl und Speichern-Knopf haengen ueber das `form`-Attribut
 * trotzdem daran, und der Loeschen-Dialog bringt sein eigenes Formular mit,
 * ohne verschachtelt zu sein.
 *
 * Der Text wird als Markdown geschrieben; die Server Action macht daraus HTML
 * und bereinigt es gegen eine feste Liste erlaubter Tags. Der Editor darf
 * deshalb grosszuegig sein, ohne dass die Ausgabe zur XSS-Flaeche wird.
 */
export function ArticleForm({
  article,
  categories,
  authorName,
  deleteSlot,
}: {
  article?: ArticleDTO;
  categories: CategoryDTO[];
  authorName: string;
  /** Der Loeschen-Knopf (mit eigener Rueckfrage), nur beim Bearbeiten. */
  deleteSlot?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(saveArticle, initial);
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? "draft");
  const [preview, setPreview] = useState({ preview: false, rendering: false });
  const editor = useRef<RichTextEditorControls>(null);
  const formId = useId();
  const statusId = useId();
  const titleId = useId();

  /* Bei Erfolg leitet die Action weiter, hier kommt also nur der Fehlerfall an
     — und genau der soll auch sichtbar sein, wenn man unten im Text steht. */
  useActionFeedback(state as { status: "idle" | "error" | "success"; message?: string });

  const onPreviewChange = useCallback(
    (next: { preview: boolean; rendering: boolean }) => setPreview(next),
    [],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="sticky top-20 z-20 flex items-center gap-2 rounded-2xl border border-border bg-[color-mix(in_oklab,var(--surface)_88%,transparent)] p-2 shadow-surface backdrop-blur-xl">
        <ButtonLink
          href="/admin/news"
          variant="ghost"
          size="sm"
          isIconOnly
          aria-label="Zurück zu News"
          className="max-sm:hidden"
        >
          <Icon icon={ChevronLeftIcon} />
        </ButtonLink>

        <label htmlFor={statusId} className="sr-only">
          Status
        </label>
        <div className="relative">
          <span
            aria-hidden="true"
            className={cn("absolute top-1/2 left-3 size-2 -translate-y-1/2 rounded-full", DOT[ARTICLE_STATUS[status].color])}
          />
          <select
            id={statusId}
            name="status"
            form={formId}
            value={status}
            onChange={(event) => setStatus(event.target.value as ArticleStatus)}
            className="h-9 cursor-pointer appearance-none rounded-full bg-default pr-8 pl-7 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {STATUS_ORDER.map((value) => (
              <option key={value} value={value}>
                {ARTICLE_STATUS[value].label}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted"
          >
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        <p className="hidden min-w-0 flex-1 truncate px-2 text-xs text-muted md:block" suppressHydrationWarning>
          {article ? `Zuletzt gespeichert ${formatRelative(article.updatedAt)}` : "Noch nicht gespeichert"}
        </p>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant={preview.preview ? "secondary" : "tertiary"}
            size="sm"
            isDisabled={preview.rendering}
            aria-pressed={preview.preview}
            aria-label={preview.preview ? "Weiter schreiben" : "Vorschau"}
            className="max-sm:w-9 max-sm:px-0"
            onPress={() => editor.current?.togglePreview()}
          >
            <Icon icon={preview.rendering ? LoadingIcon : EditIcon} spin={preview.rendering} />
            <span className="max-sm:hidden">{preview.preview ? "Weiter schreiben" : "Vorschau"}</span>
          </Button>

          {article?.status === "published" && (
            <ButtonLink
              href={`/news/${article.slug}`}
              external
              variant="tertiary"
              size="sm"
              className="max-md:hidden"
            >
              <Icon icon={ExternalLinkIcon} />
              Ansehen
            </ButtonLink>
          )}

          {deleteSlot}

          {/* Nativer Knopf mit form-Attribut: Er sitzt ausserhalb des
              Formulars und schickt es trotzdem ab. */}
          <button
            type="submit"
            form={formId}
            disabled={pending}
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            <Icon icon={pending ? LoadingIcon : CheckIcon} spin={pending} />
            {pending ? "Speichert …" : "Speichern"}
          </button>
        </div>
      </div>

      {state.status === "error" && state.message && <FormMessage status="error">{state.message}</FormMessage>}

      <form
        id={formId}
        action={formAction}
        className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_21rem]"
      >
        {article && <input type="hidden" name="id" value={article.id} />}

        <div className="surface-card flex min-w-0 flex-col gap-6 rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={titleId} className="label label--required">
              Titel
            </label>
            {/* Gross wie eine Ueberschrift — man schreibt hier ja eine. */}
            <input
              id={titleId}
              name="title"
              required
              minLength={4}
              maxLength={160}
              defaultValue={article?.title}
              placeholder="Worum geht es?"
              className="input h-auto w-full py-3 text-xl font-bold tracking-tight sm:text-2xl"
            />
          </div>

          <TextAreaField
            name="excerpt"
            label="Teaser"
            required
            minLength={20}
            maxLength={400}
            rows={3}
            defaultValue={article?.excerpt}
            description="Zwei, drei Sätze für die Übersicht und die Vorschau beim Teilen."
          />

          {/* Beim Bearbeiten erscheint wieder der getippte Text. Bei
              Beiträgen aus der HTML-Zeit gibt es den nicht — dann steht das
              HTML da, und der Konverter reicht es unverändert durch. */}
          <RichTextEditor
            name="content"
            label="Text"
            required
            rows={22}
            defaultValue={article?.contentSource ?? article?.content}
            placeholder="Schreib deinen Beitrag …"
            controls={editor}
            onPreviewChange={onPreviewChange}
          />
        </div>

        <aside aria-label="Einstellungen" className="flex min-w-0 flex-col gap-4">
          <SettingsCard title="Veröffentlichung" id={`${formId}-publish`}>
            <SelectField
              name="categorySlug"
              label="Kategorie"
              required
              defaultValue={article?.categorySlug ?? categories[0]?.slug}
              options={categories.map((category) => ({ value: category.slug, label: category.name }))}
            />

            <TextField
              name="publishedAt"
              label="Datum und Uhrzeit"
              type="datetime-local"
              /* Senderzeit (Berlin), nicht UTC: Wer 20:00 sieht, meint 20:00 in
                 Hamburg. Der Server liest das Feld mit parseStationTime. */
              defaultValue={toStationTimeInput(article?.publishedAt) || undefined}
              description={<>Für &bdquo;Geplant&ldquo; ein Datum in der Zukunft setzen.</>}
            />

            <div className="flex flex-col gap-3 rounded-xl bg-surface-secondary p-3.5">
              <CheckboxField name="featured" label="Als Aufmacher hervorheben" defaultChecked={article?.featured} />

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
            </div>
          </SettingsCard>

          <section aria-label="Titelbild" className="surface-card flex flex-col gap-4 rounded-2xl p-5">
            {/* Die Ueberschrift kommt von <ImageUpload> selbst — zweimal
                "Titelbild" untereinander waere nur Laerm. */}
            <ImageUpload name="coverImage" value={article?.coverImage} label="Titelbild" endpoint="articleImage" />

            <TextField
              name="coverAlt"
              label="Bildbeschreibung"
              defaultValue={article?.coverAlt}
              maxLength={200}
              description="Für Screenreader und wenn das Bild nicht lädt."
            />
          </section>

          <SettingsCard title="Adresse und Schlagwörter" id={`${formId}-meta`}>
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
          </SettingsCard>

          <SettingsCard title="Autor" id={`${formId}-author`}>
            {/* Kein Eingabefeld: Der Autor kommt aus der Anmeldung. Angezeigt
                wird er trotzdem, damit man vor dem Speichern sieht, unter
                welchem Namen der Beitrag erscheint. */}
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-volt text-sm font-bold text-ink"
              >
                {(article?.authorName ?? authorName).trim().charAt(0).toUpperCase() || "V"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{article?.authorName ?? authorName}</p>
                <p className="description">
                  {article
                    ? "Bleibt beim ursprünglichen Autor, auch wenn jemand anderes bearbeitet."
                    : "Wird automatisch von deinem Konto übernommen."}
                </p>
              </div>
            </div>
          </SettingsCard>
        </aside>
      </form>
    </div>
  );
}
