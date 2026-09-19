"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { CheckBox } from "@/components/ui/checkbox";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { Icon, PlusIcon, CheckIcon, LoadingIcon, EditIcon, DeleteIcon, CloseIcon } from "@/lib/icons";
import { ImageUpload } from "./image-upload";
import { RichTextEditor } from "./rich-text-editor";
import type { EntityFormState, EntityRow, FieldDef } from "./entity-types";
import { useActionFeedback } from "./use-action-feedback";
import styles from "./entity-manager.module.css";
import formStyles from "./admin-form.module.css";

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

  return (
    <div className={styles.wrap}>
      {message && (
        <Alert
          variant="lighter"
          status={messageStatus === "success" ? "success" : "error"}
          role="status"
        >
          <AlertContent>
            <AlertDescription>{message}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      {/* Geschlossen steht hier nur der Knopf — oder die Erklaerung, warum
          gerade nichts angelegt werden kann. */}
      {!formOpen &&
        (canCreate ? (
          <div className={styles.addRow}>
            <Button
              type="button"
              variant="primary"
              mode="filled"
              size="md"
              onClick={() => setCreating(true)}
            >
              <Icon icon={PlusIcon} />
              {addLabel}
            </Button>
          </div>
        ) : (
          createBlockedText && <p className={styles.blocked}>{createBlockedText}</p>
        ))}

      {formOpen && (
      <form ref={formRef} action={save} className={formStyles.form} key={editing?.id ?? "new"}>
        {editing && <input type="hidden" name="id" value={editing.id} />}

        <div className={styles.formHead}>
          <h2 className={styles.formTitle}>
            {editing ? `${singular} bearbeiten` : addLabel}
          </h2>
          <Button type="button" variant="neutral" mode="ghost" size="sm" onClick={closeForm}>
            <Icon icon={CloseIcon} />
            Abbrechen
          </Button>
        </div>

        <div className={formStyles.grid}>
          <div className={formStyles.main}>
            {mainFields.map((field) => (
              <FormField key={field.name} field={field} row={editing} />
            ))}
          </div>

          <aside className={formStyles.side}>
            {sideFields.map((field) => (
              <FormField key={field.name} field={field} row={editing} />
            ))}

            <Button type="submit" variant="primary" mode="filled" size="lg" disabled={saving}>
              <Icon icon={saving ? LoadingIcon : editing ? CheckIcon : PlusIcon} spin={saving} />
              {saving ? "Wird gespeichert …" : editing ? "Speichern" : addLabel}
            </Button>
          </aside>
        </div>
      </form>
      )}

      <section className={styles.listSection} aria-label={`Vorhandene Einträge`}>
        <h2 className={styles.listTitle}>
          Vorhanden <span className={styles.count}>{rows.length}</span>
        </h2>

        {rows.length === 0 ? (
          <p className={styles.empty}>{emptyText}</p>
        ) : (
          <ul className={styles.list} role="list">
            {rows.map((row) => (
              <li key={row.id} className={styles.row} data-active={editing?.id === row.id}>
                <div className={styles.rowMain}>
                  <span className={styles.rowTitle}>{row.title}</span>
                  {row.meta && <span className={styles.rowMeta}>{row.meta}</span>}
                </div>

                {row.badge && <span className={styles.rowBadge}>{row.badge}</span>}

                <div className={styles.rowActions}>
                  <Button
                    type="button"
                    variant="neutral"
                    mode="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(row);
                      setCreating(false);
                      setConfirmId(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <Icon icon={EditIcon} />
                    Bearbeiten
                  </Button>

                  {confirmId === row.id ? (
                    /* Its own form — a delete nested in the edit form would be
                       invalid HTML and would submit the wrong fields. */
                    <form action={remove} className={styles.confirm}>
                      <input type="hidden" name="id" value={row.id} />
                      <span className={styles.confirmText}>Wirklich löschen?</span>
                      <Button type="submit" variant="error" mode="filled" size="sm" disabled={deleting}>
                        <Icon icon={deleting ? LoadingIcon : DeleteIcon} spin={deleting} />
                        Ja
                      </Button>
                      <Button
                        type="button"
                        variant="neutral"
                        mode="ghost"
                        size="sm"
                        onClick={() => setConfirmId(null)}
                      >
                        Nein
                      </Button>
                    </form>
                  ) : (
                    <Button
                      type="button"
                      variant="error"
                      mode="ghost"
                      size="sm"
                      onClick={() => setConfirmId(row.id)}
                    >
                      <Icon icon={DeleteIcon} />
                      Löschen
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function FormField({ field, row }: { field: FieldDef; row: EntityRow | null }) {
  const raw = row ? row.values[field.name] : field.defaultValue;
  const value = raw === null || raw === undefined ? "" : String(raw);

  if (field.type === "image") {
    return <ImageUpload name={field.name} value={value || undefined} label={field.label} />;
  }

  if (field.type === "rich") {
    return (
      <Field name={field.name} className={formStyles.field}>
        <FieldLabel>{field.label}</FieldLabel>
        <RichTextEditor
          name={field.name}
          required={field.required}
          rows={field.rows ?? 12}
          defaultValue={value}
          placeholder={field.placeholder}
        />
        {field.hint && <FieldDescription>{field.hint}</FieldDescription>}
      </Field>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className={formStyles.checkboxRow}>
        <CheckBox name={field.name} defaultChecked={raw === true || raw === "true"} />
        <span>{field.label}</span>
      </label>
    );
  }

  return (
    <Field name={field.name} className={formStyles.field}>
      <FieldLabel>{field.label}</FieldLabel>

      {field.type === "textarea" ? (
        <Textarea
          name={field.name}
          required={field.required}
          rows={field.rows ?? 5}
          defaultValue={value}
          placeholder={field.placeholder}
        />
      ) : field.type === "select" ? (
        <select
          name={field.name}
          defaultValue={value || field.options?.[0]?.value}
          className={formStyles.select}
          required={field.required}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          name={field.name}
          type={
            field.type === "number"
              ? "number"
              : field.type === "time"
                ? "time"
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
      )}

      {field.hint && <FieldDescription>{field.hint}</FieldDescription>}
    </Field>
  );
}
