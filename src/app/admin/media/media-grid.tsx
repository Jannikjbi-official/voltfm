"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { Icon, DeleteIcon, LoadingIcon, CheckIcon, CloseIcon } from "@/lib/icons";
import type { EntityFormState } from "@/components/admin/entity-types";
import { useActionFeedback } from "@/components/admin/use-action-feedback";
import { formatDate } from "@/lib/format";
import styles from "./media.module.css";

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

  return (
    <div className={styles.wrap}>
      {message && (
        <Alert variant="lighter" status={status === "success" ? "success" : "error"} role="status">
          <AlertContent>
            <AlertDescription>{message}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      {items.length === 0 ? (
        <p className={styles.empty}>
          Noch nichts hochgeladen. Bilder landen hier automatisch, sobald sie im
          Artikel- oder Event-Editor hochgeladen werden.
        </p>
      ) : (
        <ul className={styles.grid} role="list">
          {items.map((item) => (
            <li key={item.id} className={styles.card}>
              <a href={item.url} target="_blank" rel="noreferrer noopener" className={styles.thumb}>
                <Image
                  src={item.url}
                  alt={item.alt || ""}
                  width={320}
                  height={200}
                  className={styles.image}
                  unoptimized
                />
              </a>

              <div className={styles.body}>
                <form action={saveAlt} className={styles.altForm}>
                  <input type="hidden" name="id" value={item.id} />
                  <Input
                    name="alt"
                    defaultValue={item.alt}
                    placeholder="Bildbeschreibung (Alt-Text)"
                    aria-label="Bildbeschreibung"
                  />
                  <Button type="submit" variant="neutral" mode="stroke" size="sm" disabled={savingAlt}>
                    <Icon icon={savingAlt ? LoadingIcon : CheckIcon} spin={savingAlt} />
                    <span className={styles.srOnly}>Speichern</span>
                  </Button>
                </form>

                <p className={styles.meta}>
                  {formatDate(item.createdAt, "short")} · {item.mimeType.replace("image/", "")}
                </p>

                {confirmId === item.id ? (
                  <form action={remove} className={styles.confirm}>
                    <input type="hidden" name="id" value={item.id} />
                    {blocked && <input type="hidden" name="force" value="1" />}
                    <Button type="submit" variant="error" mode="filled" size="sm" disabled={deleting}>
                      <Icon icon={deleting ? LoadingIcon : DeleteIcon} spin={deleting} />
                      {blocked ? "Trotzdem löschen" : "Wirklich löschen"}
                    </Button>
                    <Button
                      type="button"
                      variant="neutral"
                      mode="ghost"
                      size="sm"
                      onClick={() => setConfirmId(null)}
                    >
                      <Icon icon={CloseIcon} />
                      Abbrechen
                    </Button>
                  </form>
                ) : (
                  <Button
                    type="button"
                    variant="error"
                    mode="ghost"
                    size="sm"
                    onClick={() => setConfirmId(item.id)}
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
    </div>
  );
}
