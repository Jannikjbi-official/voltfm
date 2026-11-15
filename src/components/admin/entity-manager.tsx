"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Drawer, buttonVariants, cn } from "@heroui/react";
import {
  CheckboxField,
  FormMessage,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/common/form-field";
import { Icon, PlusIcon, CheckIcon, EditIcon, DeleteIcon, SearchIcon } from "@/lib/icons";
import { ImageUpload } from "./image-upload";
import { RichTextEditor } from "./rich-text-editor";
import { SocialLinksField } from "./social-links-field";
import { AccentColorField } from "./accent-color-field";
import { ConfirmDialog } from "./confirm-dialog";
import { AdminTable, StatusBadge, Td, Th, trClass } from "./admin-ui";
import type { EntityFormState, EntityRow, FieldDef } from "./entity-types";
import { useActionFeedback } from "./use-action-feedback";

const initial: EntityFormState = { status: "idle" };

/** Fuer die Suche: klein, ohne Umlaut-Unterschiede. */
function fold(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Anlegen, Bearbeiten und Loeschen fuer Kategorien, Moderatoren, Sendungen,
 * Events und die Zeitleiste — sie unterscheiden sich nur in ihren Feldern.
 *
 * Die vorhandenen Eintraege stehen als Tabelle mit Suche. Bearbeiten und
 * Anlegen oeffnen ein Panel von rechts (HeroUI-Drawer) mit fester
 * Speichern-Leiste unten; das Formular schickt echtes FormData an die Server
 * Action. Mit `?neu=1` in der Adresse (Schnellaktion "Neu") oeffnet das Panel
 * direkt zum Anlegen.
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
  /** False: Es kann gerade nichts angelegt werden (nur Bearbeiten). */
  canCreate?: boolean;
  /** Warum gerade nichts angelegt werden kann. */
  createBlockedText?: string;
}) {
  const [saveState, save, saving] = useActionState(saveAction, initial);
  const [deleteState, remove, deleting] = useActionState(deleteAction, initial);
  const [editing, setEditing] = useState<EntityRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const formId = useId();

  /* Schnellaktion "Neu" aus der Kopfleiste oder der Befehlspalette: Das Panel
     oeffnet sich, und der Parameter verschwindet wieder aus der Adresse.
     Im Rendern statt in einem Effekt — React empfiehlt das fuer "auf eine
     geaenderte Eingabe reagieren". */
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const wantsNew = canCreate && params.has("neu");
  const [handledNew, setHandledNew] = useState(false);
  if (wantsNew && !handledNew) {
    setHandledNew(true);
    setEditing(null);
    setCreating(true);
  }
  if (!wantsNew && handledNew) setHandledNew(false);
  useEffect(() => {
    if (wantsNew) router.replace(pathname, { scroll: false });
  }, [wantsNew, router, pathname]);

  // Nach erfolgreichem Speichern ist die Liste neu geladen: Panel schliessen.
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

  /* Speichern und Loeschen haben je einen eigenen Zustand. Angezeigt wird,
     wer zuletzt geantwortet hat. */
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

  const mainFields = fields.filter((field) => !field.side);
  const sideFields = fields.filter((field) => field.side);
  const formOpen = creating || editing !== null;
  const showBadges = rows.some((row) => row.badge);

  const needle = fold(query.trim());
  const visible = needle
    ? rows.filter((row) => fold(`${row.title} ${row.meta ?? ""} ${row.badge ?? ""}`).includes(needle))
    : rows;

  function openEdit(row: EntityRow) {
    setCreating(false);
    setEditing(row);
  }

  function closeForm() {
    setEditing(null);
    setCreating(false);
  }

  const confirmRow = rows.find((row) => row.id === confirmId) ?? null;
  /* Die Rueckmeldung zum Speichern steht im Panel, solange es offen ist. */
  const message = feedback?.message;
  const messageStatus = feedback?.status === "success" ? "success" : "error";

  return (
    <div className="flex flex-col gap-5">
      {message && !formOpen && <FormMessage status={messageStatus}>{message}</FormMessage>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Icon
            icon={SearchIcon}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Durchsuchen"
            aria-label={`${singular} suchen`}
            className="input w-full pl-8"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted">
            {visible.length === rows.length ? `${rows.length} vorhanden` : `${visible.length} von ${rows.length}`}
          </span>
          {canCreate && (
            <Button
              variant="primary"
              onPress={() => {
                setEditing(null);
                setCreating(true);
              }}
            >
              <Icon icon={PlusIcon} />
              {addLabel}
            </Button>
          )}
        </div>
      </div>

      {!canCreate && createBlockedText && (
        <p className="border-2 border-dashed border-border p-4 text-sm text-muted">{createBlockedText}</p>
      )}

      {rows.length === 0 ? (
        <div className="border-2 border-dashed border-border px-6 py-12">
          <p className="font-display text-3xl text-foreground">{emptyText}</p>
        </div>
      ) : visible.length === 0 ? (
        <p className="border-2 border-dashed border-border px-6 py-8 text-sm text-muted">Nichts gefunden.</p>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <Th>{singular}</Th>
              {showBadges && <Th className="w-0">Status</Th>}
              <Th className="w-0 text-right">
                <span className="sr-only">Aktionen</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className={cn(trClass, editing?.id === row.id && "bg-volt/25")}>
                <Td>
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="block max-w-full text-left font-wide font-bold text-foreground hover:underline hover:decoration-2 hover:underline-offset-4"
                  >
                    {row.title}
                  </button>
                  {row.meta && <span className="mt-0.5 block font-mono text-xs text-muted">{row.meta}</span>}
                </Td>
                {showBadges && <Td>{row.badge && <StatusBadge>{row.badge}</StatusBadge>}</Td>}
                <Td className="text-right whitespace-nowrap">
                  <div className="inline-flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      isIconOnly
                      aria-label={`${row.title} bearbeiten`}
                      onPress={() => openEdit(row)}
                    >
                      <Icon icon={EditIcon} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      isIconOnly
                      aria-label={`${row.title} löschen`}
                      className="text-danger"
                      onPress={() => setConfirmId(row.id)}
                    >
                      <Icon icon={DeleteIcon} />
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      <Drawer.Backdrop isOpen={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <Drawer.Content placement="right" className="w-[min(44rem,100vw)]">
          <Drawer.Dialog aria-label={editing ? `${singular} bearbeiten` : addLabel} className="flex h-full flex-col p-0">
            <Drawer.CloseTrigger aria-label="Schließen" className="top-4 right-4" />
            <Drawer.Header className="border-b-2 border-border px-6 pt-5 pb-4">
              <p className="font-mono text-xs text-muted">{editing ? "Bearbeiten" : "Neu"}</p>
              <Drawer.Heading className="mt-1 pr-10 font-display text-4xl">
                {editing ? editing.title : addLabel}
              </Drawer.Heading>
            </Drawer.Header>

            <Drawer.Body className="flex-1 overflow-y-auto px-6 py-6">
              {message && formOpen && messageStatus === "error" && (
                <FormMessage status="error" className="mb-5">
                  {message}
                </FormMessage>
              )}
              <form
                id={formId}
                ref={formRef}
                action={save}
                key={editing?.id ?? "new"}
                className="flex flex-col gap-5"
              >
                {editing && <input type="hidden" name="id" value={editing.id} />}
                {mainFields.map((field) => (
                  <FormField key={field.name} field={field} row={editing} />
                ))}
                {sideFields.length > 0 && (
                  <div className="flex flex-col gap-5 border-t-2 border-border pt-5">
                    {sideFields.map((field) => (
                      <FormField key={field.name} field={field} row={editing} />
                    ))}
                  </div>
                )}
              </form>
            </Drawer.Body>

            <Drawer.Footer className="flex justify-end gap-2 border-t-2 border-border px-6 py-4">
              <Button variant="tertiary" onPress={closeForm}>
                Abbrechen
              </Button>
              {/* Ein nativer Knopf mit form-Attribut: Er sitzt ausserhalb des
                  Formulars in der festen Leiste und schickt es trotzdem ab. */}
              <button
                type="submit"
                form={formId}
                disabled={saving}
                className={buttonVariants({ variant: "primary" })}
              >
                <Icon icon={saving ? CheckIcon : editing ? CheckIcon : PlusIcon} />
                {saving ? "Wird gespeichert …" : editing ? "Speichern" : addLabel}
              </button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>

      <ConfirmDialog
        isOpen={confirmId !== null}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Wirklich löschen?"
        description={confirmRow?.title}
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
