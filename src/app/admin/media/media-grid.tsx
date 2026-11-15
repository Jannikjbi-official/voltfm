"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@heroui/react";
import { FormMessage } from "@/components/common/form-field";
import { Icon, DeleteIcon, LoadingIcon, CheckIcon } from "@/lib/icons";
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

  return (
    <div className="flex flex-col gap-6">
      {message && (
        <FormMessage status={status === "success" ? "success" : "error"}>{message}</FormMessage>
      )}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
          Noch nichts hochgeladen. Bilder landen hier automatisch, sobald sie im
          Artikel- oder Event-Editor hochgeladen werden.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="block bg-surface-secondary"
              >
                <Image
                  src={item.url}
                  alt={item.alt || ""}
                  width={320}
                  height={200}
                  className="aspect-[16/10] w-full object-cover"
                  unoptimized
                />
                <span className="sr-only"> (öffnet einen neuen Tab)</span>
              </a>

              <div className="flex flex-1 flex-col gap-3 p-3">
                <form action={saveAlt} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    name="alt"
                    defaultValue={item.alt}
                    placeholder="Bildbeschreibung (Alt-Text)"
                    aria-label="Bildbeschreibung"
                    className="input w-full min-w-0 flex-1"
                  />
                  <Button
                    type="submit"
                    variant="tertiary"
                    size="sm"
                    isIconOnly
                    isPending={savingAlt}
                    aria-label="Speichern"
                  >
                    <Icon icon={savingAlt ? LoadingIcon : CheckIcon} spin={savingAlt} />
                  </Button>
                </form>

                <div className="mt-auto flex items-center justify-between gap-2">
                  <p className="flex gap-3 text-xs text-muted">
                    <span>{formatDate(item.createdAt, "short")}</span>
                    <span>{item.mimeType.replace("image/", "")}</span>
                  </p>
                  <Button variant="danger-soft" size="sm" onPress={() => setConfirmId(item.id)}>
                    <Icon icon={DeleteIcon} />
                    Löschen
                  </Button>
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
