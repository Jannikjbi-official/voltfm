"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
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
import { AdminTable, DOT, StatusBadge, Td, Th, trClass } from "./admin-ui";
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
  /* Vorschaubilder nur, wenn die Sammlung ueberhaupt Bilder hat (Moderatoren,
     Sendungen, Events) — sonst bliebe vor jedem Titel ein leerer Platz. */
  const showImages = fields.some((field) => field.type === "image");

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
    <div className="flex flex-col gap-2">
      {/* Erfolg meldet der Toast; ein Fehler bleibt zusaetzlich stehen. */}
      {message && !formOpen && messageStatus === "error" && <FormMessage status="error">{message}</FormMessage>}

      {/* Bedienleiste: Suche links, Zaehler und "Anlegen" rechts. */}
      <div className="surface-card flex flex-col gap-2 rounded-[var(--radius)] p-2 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex items-center justify-between gap-3 pl-1 sm:justify-end">
          <span className="font-meta text-muted tabular-nums">
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
        <p className="well rounded-[var(--radius)] p-4 text-sm text-muted">{createBlockedText}</p>
      )}

      {rows.length === 0 ? (
        <div className="well rounded-[var(--radius)] px-6 py-12 text-center">
          <p className="font-wide text-lg font-bold text-foreground">{emptyText}</p>
        </div>
      ) : visible.length === 0 ? (
        <p className="well rounded-[var(--radius)] px-6 py-8 text-center text-sm text-muted">Nichts gefunden.</p>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <Th>{singular}</Th>
              {showBadges && <Th className="hidden w-0 sm:table-cell">Status</Th>}
              <Th className="w-0 text-right">
                <span className="sr-only">Aktionen</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className={cn(trClass, editing?.id === row.id && "bg-accent-soft")}>
                <Td className="w-full max-w-0">
                  <div className="flex items-center gap-3">
                    {showImages && <Thumb src={row.image} title={row.title} />}
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="block max-w-full text-left font-semibold text-foreground transition-colors hover:text-accent-text"
                      >
                        {row.title}
                      </button>
                      {row.meta && <span className="mt-0.5 block text-xs text-muted">{row.meta}</span>}
                      {row.badge && (
                        <StatusBadge color={row.tone} className="mt-1.5 sm:hidden">
                          {row.badge}
                        </StatusBadge>
                      )}
                    </div>
                  </div>
                </Td>
                {showBadges && (
                  <Td className="hidden sm:table-cell">
                    {row.badge && <StatusBadge color={row.tone}>{row.badge}</StatusBadge>}
                  </Td>
                )}
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
        <Drawer.Content placement="right">
          {/* Das Panel ist eine Platte, die von rechts ins Gehaeuse geschoben wird. */}
          <Drawer.Dialog
            aria-label={editing ? `${singular} bearbeiten` : addLabel}
            className="flex h-full w-[min(44rem,100vw)] max-w-[100vw] flex-col border-l border-border bg-surface p-0 sm:w-[min(44rem,100vw)]"
          >
            <Drawer.CloseTrigger aria-label="Schließen" className="top-4 right-4" />
            <Drawer.Header className="gap-0 border-b border-border px-5 pt-5 pb-4 sm:px-6">
              <p className="flex items-center gap-2 font-meta text-muted">
                <span aria-hidden="true" className={cn("size-[7px] rounded-full ring-2", editing ? DOT.success : DOT.accent)} />
                {editing ? "Bearbeiten" : "Neu"}
              </p>
              <Drawer.Heading className="mt-2 pr-10 font-display text-3xl break-words text-foreground">
                {editing ? editing.title : addLabel}
              </Drawer.Heading>
            </Drawer.Header>

            <Drawer.Body className="mt-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
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
                  <div className="well flex flex-col gap-5 rounded-[var(--radius)] p-4">
                    {sideFields.map((field) => (
                      <FormField key={field.name} field={field} row={editing} />
                    ))}
                  </div>
                )}
              </form>
            </Drawer.Body>

            <Drawer.Footer className="mt-0 flex justify-end gap-2 border-t border-border bg-surface-secondary px-5 pt-3 pb-4 sm:px-6">
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

/** Vorschaubild in der Tabelle; laedt es nicht, steht der Anfangsbuchstabe da. */
function Thumb({ src, title }: { src?: string | null; title: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const show = src && failed !== src;
  return (
    <span
      aria-hidden="true"
      className="well relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[var(--radius)] font-mono text-xs font-bold text-muted"
    >
      {show ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="40px"
          className="object-cover"
          unoptimized
          onError={() => setFailed(src)}
        />
      ) : (
        title.trim().slice(0, 1).toUpperCase()
      )}
    </span>
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
