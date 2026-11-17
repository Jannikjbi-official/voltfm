"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@heroui/react";
import { FormMessage } from "@/components/common/form-field";
import { Icon, DeleteIcon, LoadingIcon, CheckIcon, ImageIcon, SearchIcon } from "@/lib/icons";
import { PillCount, StatusBadge, filterPillClass } from "@/components/admin/admin-ui";
import type { EntityFormState } from "@/components/admin/entity-types";
import { useActionFeedback } from "@/components/admin/use-action-feedback";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { formatDate } from "@/lib/format";

const initial: EntityFormState = { status: "idle" };

export interface MediaItem {
  id: string;
  url: string;
  alt: string;
  mimeType: string;
  createdAt: string;
}

/**
 * Media library.
 *
 * Deleting is destructive and the file may still be referenced by an article
 * or a profile, so the first attempt only ever asks — the server reports where
 * the image is used and "Trotzdem löschen" repeats the call with `force`.
 */
export function MediaGrid({
  items,
  deleteAction,
  altAction,
}: {
  items: MediaItem[];
  deleteAction: (state: EntityFormState, formData: FormData) => Promise<EntityFormState>;
  altAction: (state: EntityFormState, formData: FormData) => Promise<EntityFormState>;
}) {
  const [deleteState, remove, deleting] = useActionState(deleteAction, initial);
  const [altState, saveAlt, savingAlt] = useActionState(altAction, initial);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);

  useActionFeedback(deleteState);
  useActionFeedback(altState);

  const message = deleteState.message ?? altState.message;
  const status = deleteState.message ? deleteState.status : altState.status;
  // The server answers "still in use" as an error; the retry then has to force.
  const blocked = deleteState.status === "error" && deleteState.message?.includes("Wird noch verwendet");

  /* Erfolgreich geloescht: Rueckfrage schliessen. Bei "Wird noch verwendet"
     bleibt sie offen und bietet "Trotzdem löschen" an. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (deleteState.status === "success") setConfirmId(null);
  }, [deleteState]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const confirmItem = items.find((item) => item.id === confirmId) ?? null;
  /* "Trotzdem löschen" gilt nur fuer das Bild, bei dem der Server gerade
     "Wird noch verwendet" gemeldet hat. */
  const [attemptedId, setAttemptedId] = useState<string | null>(null);
  const forceThis = blocked && attemptedId !== null && attemptedId === confirmId;

  const missingAlt = items.filter((item) => !item.alt.trim()).length;
  const needle = query.trim().toLowerCase();
  const visible = items.filter(
    (item) =>
      (!onlyMissing || !item.alt.trim()) && (!needle || item.alt.toLowerCase().includes(needle)),
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Erfolg meldet der Toast; ein Fehler bleibt zusaetzlich stehen. */}
      {message && status === "error" && <FormMessage status="error">{message}</FormMessage>}

      {items.length > 0 && (
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
              placeholder="In Beschreibungen suchen"
              aria-label="Bilder suchen"
              className="input w-full pl-8"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { id: false, label: "Alle", count: items.length },
              { id: true, label: "Ohne Beschreibung", count: missingAlt },
            ].map((entry) => (
              <button
                key={entry.label}
                type="button"
                aria-pressed={onlyMissing === entry.id}
                onClick={() => setOnlyMissing(entry.id)}
                className={filterPillClass(onlyMissing === entry.id)}
              >
                {entry.label}
                <PillCount active={onlyMissing === entry.id}>{entry.count}</PillCount>
              </button>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <span aria-hidden="true" className="grid size-12 place-items-center rounded-2xl bg-surface-secondary text-muted">
            <Icon icon={ImageIcon} />
          </span>
          <p className="font-bold text-foreground">Noch nichts hochgeladen.</p>
          <p className="max-w-sm text-sm text-muted">
            Bilder landen hier automatisch, sobald sie im Artikel- oder Event-Editor hochgeladen werden.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
          Nichts gefunden.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {visible.map((item) => (
            <li
              key={item.id}
              className="group surface-card hover-lift relative flex flex-col overflow-hidden rounded-2xl motion-reduce:transition-none"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="relative block overflow-hidden bg-surface-secondary"
              >
                <Image
                  src={item.url}
                  alt={item.alt || ""}
                  width={480}
                  height={360}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  unoptimized
                />
                <span className="sr-only"> (öffnet einen neuen Tab)</span>
              </a>

              <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-ink/75 px-2.5 py-0.5 font-mono text-[0.7rem] text-paper uppercase backdrop-blur">
                {item.mimeType.replace("image/", "")}
              </span>

              {/* Am Handy immer da, mit Maus erst beim Ueberfahren — und
                  sobald etwas in der Karte den Fokus hat. */}
              <Button
                variant="secondary"
                size="sm"
                isIconOnly
                aria-label="Bild löschen"
                className="absolute top-3 right-3 bg-ink/75 text-paper backdrop-blur hover:bg-danger hover:text-danger-foreground sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
                onPress={() => setConfirmId(item.id)}
              >
                <Icon icon={DeleteIcon} />
              </Button>

              <div className="flex flex-1 flex-col gap-2 p-3.5">
                <form action={saveAlt} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    name="alt"
                    defaultValue={item.alt}
                    placeholder="Was ist zu sehen?"
                    aria-label="Bildbeschreibung"
                    className="input w-full min-w-0 flex-1"
                  />
                  <Button
                    type="submit"
                    variant="tertiary"
                    size="sm"
                    isIconOnly
                    isPending={savingAlt}
                    aria-label="Beschreibung speichern"
                  >
                    <Icon icon={savingAlt ? LoadingIcon : CheckIcon} spin={savingAlt} />
                  </Button>
                </form>

                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <span className="font-mono text-xs text-muted">{formatDate(item.createdAt, "short")}</span>
                  {!item.alt.trim() && <StatusBadge color="warning">Ohne Beschreibung</StatusBadge>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        isOpen={confirmItem !== null}
        onOpenChange={(open) => !open && !deleting && setConfirmId(null)}
        title={forceThis ? "Trotzdem löschen?" : "Wirklich löschen?"}
        description={
          confirmItem ? (
            <div className="flex flex-col gap-3">
              <Image
                src={confirmItem.url}
                alt=""
                width={320}
                height={200}
                className="aspect-[16/10] w-full rounded-xl object-cover"
                unoptimized
              />
              {forceThis && deleteState.message && (
                <FormMessage status="error">{deleteState.message}</FormMessage>
              )}
            </div>
          ) : null
        }
        action={(formData) => {
          setAttemptedId(String(formData.get("id") ?? ""));
          remove(formData);
        }}
        fields={{ id: confirmItem?.id ?? "", ...(forceThis ? { force: "1" } : {}) }}
        confirmLabel={forceThis ? "Trotzdem löschen" : "Wirklich löschen"}
        pending={deleting}
      />
    </div>
  );
}
