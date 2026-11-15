"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import {
  CheckboxField,
  FormMessage,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/common/form-field";
import { Icon, PlusIcon, CheckIcon, LoadingIcon, EditIcon, DeleteIcon, CloseIcon } from "@/lib/icons";
import { ImageUpload } from "./image-upload";
import { RichTextEditor } from "./rich-text-editor";
import { SocialLinksField } from "./social-links-field";
import { AccentColorField } from "./accent-color-field";
import { ConfirmDialog } from "./confirm-dialog";
import { StatusBadge } from "./admin-ui";
import type { EntityFormState, EntityRow, FieldDef } from "./entity-types";
import { useActionFeedback } from "./use-action-feedback";

const initial: EntityFormState = { status: "idle" };

/**
 * Generic create / edit / delete screen.
 *
 * Categories, hosts, shows and events differ only in their fields, so they
 * share this one component rather than four near-identical forms. Selecting a
 * row loads it into the form; "Neu" clears it.
 */
export function EntityManager({
  rows,
  fields,
  saveAction,
  deleteAction,
  singular,
  addLabel,
  emptyText,
  canCreate = true,
  createBlockedText,
}: {
  rows: EntityRow[];
  fields: FieldDef[];
  saveAction: (state: EntityFormState, formData: FormData) => Promise<EntityFormState>;
  deleteAction: (state: EntityFormState, formData: FormData) => Promise<EntityFormState>;
  singular: string;
  addLabel: string;
  emptyText: string;
  /** False blendet das Formular aus, solange nichts bearbeitet wird. */
  canCreate?: boolean;
  /** Warum gerade nichts angelegt werden kann. */
  createBlockedText?: string;
}) {
  const [saveState, save, saving] = useActionState(saveAction, initial);
  const [deleteState, remove, deleting] = useActionState(deleteAction, initial);
  const [editing, setEditing] = useState<EntityRow | null>(null);
  /* Das Formular ist lang. Stuende es immer offen, waere die Liste der
     vorhandenen Eintraege bei jedem Aufruf nach unten geschoben — dabei
     schaut man meistens genau dort nach. */
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // After a successful save the server data is refreshed, so drop the editing
  // selection and reset the form back to "new".
  const lastHandled = useRef<string>("");
  useEffect(() => {
    const token = `${saveState.status}:${saveState.message ?? ""}`;
    if (saveState.status === "success" && token !== lastHandled.current) {
      lastHandled.current = token;
      setEditing(null);
      setCreating(false);
      formRef.current?.reset();
    }
  }, [saveState]);

  /* Saving and deleting each keep their own state, so "the message to show" is
     whichever of them answered last — otherwise a delete confirmation is
     hidden behind the save message still sitting in the other state. */
  const [feedback, setFeedback] = useState<EntityFormState | null>(null);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (saveState.message) setFeedback(saveState);
  }, [saveState]);
  useEffect(() => {
    if (deleteState.message) setFeedback(deleteState);
    // Die Antwort ist da: Rueckfrage schliessen, die Meldung steht oben.
    setConfirmId(null);
  }, [deleteState]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useActionFeedback(saveState);
  useActionFeedback(deleteState);

  const message = feedback?.message;
  const messageStatus = feedback?.status;

  const mainFields = fields.filter((field) => !field.side);
  const sideFields = fields.filter((field) => field.side);

  const formOpen = creating || editing !== null;

  /** Schliesst das Formular, egal ob angelegt oder bearbeitet wurde. */
  function closeForm() {
    setEditing(null);
    setCreating(false);
  }

  const confirmRow = rows.find((row) => row.id === confirmId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      {message && (
        <FormMessage status={messageStatus === "success" ? "success" : "error"}>{message}</FormMessage>
      )}

      {/* Geschlossen steht hier nur der Knopf — oder die Erklaerung, warum
          gerade nichts angelegt werden kann. */}
      {!formOpen &&
        (canCreate ? (
          <div>
            <Button variant="primary" onPress={() => setCreating(true)}>
              <Icon icon={PlusIcon} />
              {addLabel}
            </Button>
          </div>
        ) : (
          createBlockedText && (
            <p className="max-w-2xl rounded-2xl border border-dashed border-border p-4 text-sm text-muted">
              {createBlockedText}
            </p>
          )
        ))}

      {formOpen && (
        <form
          ref={formRef}
          action={save}
          key={editing?.id ?? "new"}
          className="rounded-2xl border border-border bg-surface"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <div className="flex items-center justify-between gap-4 border-b border-separator px-5 py-4 sm:px-6">
            <h2 className="min-w-0 font-wide text-lg leading-tight font-bold text-pretty text-foreground">
              {editing ? `${singular} bearbeiten` : addLabel}
            </h2>
            <Button type="button" variant="ghost" size="sm" onPress={closeForm}>
              <Icon icon={CloseIcon} />
              Abbrechen
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="flex min-w-0 flex-col gap-5">
              {mainFields.map((field) => (
                <FormField key={field.name} field={field} row={editing} />
              ))}
            </div>

            <aside className="flex min-w-0 flex-col gap-5 rounded-2xl bg-surface-secondary p-4 sm:p-5 lg:self-start">
              {sideFields.map((field) => (
                <FormField key={field.name} field={field} row={editing} />
              ))}

              <Button type="submit" variant="primary" size="lg" fullWidth isPending={saving}>
                <Icon icon={saving ? LoadingIcon : editing ? CheckIcon : PlusIcon} spin={saving} />
                {saving ? "Wird gespeichert …" : editing ? "Speichern" : addLabel}
              </Button>
            </aside>
          </div>
        </form>
      )}

      <section aria-labelledby="entity-list-title" className="rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-3 border-b border-separator px-5 py-4 sm:px-6">
          <h2 id="entity-list-title" className="font-wide text-base font-bold text-foreground">
            Vorhanden
          </h2>
          <StatusBadge>{rows.length}</StatusBadge>
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted sm:px-6">{emptyText}</p>
        ) : (
          <ul className="divide-y divide-separator">
            {rows.map((row) => (
              <li
                key={row.id}
                data-active={editing?.id === row.id || undefined}
                className="flex flex-col gap-3 px-5 py-4 transition-colors data-[active]:bg-accent-soft sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{row.title}</p>
                  {row.meta && <p className="mt-0.5 truncate text-sm text-muted">{row.meta}</p>}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {row.badge && <StatusBadge>{row.badge}</StatusBadge>}
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => {
                      setEditing(row);
                      setCreating(false);
                      setConfirmId(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <Icon icon={EditIcon} />
                    Bearbeiten
                  </Button>
                  <Button variant="danger-soft" size="sm" onPress={() => setConfirmId(row.id)}>
                    <Icon icon={DeleteIcon} />
                    Löschen
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        isOpen={confirmRow !== null}
        onOpenChange={(open) => !open && !deleting && setConfirmId(null)}
        title="Wirklich löschen?"
        description={confirmRow ? <p className="font-semibold">{confirmRow.title}</p> : null}
        action={remove}
        fields={{ id: confirmRow?.id ?? "" }}
        confirmLabel="Löschen"
        pending={deleting}
      />
    </div>
  );
}

function FormField({ field, row }: { field: FieldDef; row: EntityRow | null }) {
  const raw = row ? row.values[field.name] : field.defaultValue;
  const value = raw === null || raw === undefined ? "" : String(raw);

  if (field.type === "image") {
    return <ImageUpload name={field.name} value={value || undefined} label={field.label} />;
  }

  if (field.type === "socials") {
    return <SocialLinksField name={field.name} defaultValue={value} />;
  }

  if (field.type === "hue") {
    return (
      <AccentColorField
        name={field.name}
        defaultValue={value}
        label={field.label}
        hint={field.hint}
      />
    );
  }

  if (field.type === "rich") {
    /* Beim Bearbeiten soll wieder der getippte Text erscheinen, nicht das
       daraus erzeugte HTML. Aeltere Datensaetze haben kein "<feld>Source" —
       dann bleibt es beim HTML, das der Konverter unveraendert durchreicht. */
    const source = row?.values[`${field.name}Source`];
    return (
      <RichTextEditor
        name={field.name}
        label={field.label}
        description={field.hint}
        required={field.required}
        rows={field.rows ?? 12}
        defaultValue={typeof source === "string" && source ? source : value}
        placeholder={field.placeholder}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <CheckboxField
        name={field.name}
        label={field.label}
        description={field.hint}
        defaultChecked={raw === true || raw === "true"}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <TextAreaField
        name={field.name}
        label={field.label}
        description={field.hint}
        required={field.required}
        rows={field.rows ?? 5}
        defaultValue={value}
        placeholder={field.placeholder}
      />
    );
  }

  if (field.type === "select") {
    return (
      <SelectField
        name={field.name}
        label={field.label}
        description={field.hint}
        required={field.required}
        defaultValue={value || field.options?.[0]?.value}
        options={field.options ?? []}
      />
    );
  }

  return (
    <TextField
      name={field.name}
      label={field.label}
      description={field.hint}
      type={
        field.type === "number"
          ? "number"
          : field.type === "time"
            ? "time"
            : field.type === "date"
              ? "date"
              : field.type === "datetime"
                ? "datetime-local"
                : "text"
      }
      required={field.required}
      defaultValue={value}
      placeholder={field.placeholder}
      min={field.min}
      max={field.max}
    />
  );
}
