"use client";

import { useActionState } from "react";
import { Button } from "@heroui/react";
import { FormMessage, TextField } from "@/components/common/form-field";
import type { EntityFormState } from "@/components/admin/entity-types";
import { directories, type DirectoryId } from "@/lib/listings";
import { Icon, CheckIcon, LoadingIcon } from "@/lib/icons";
import { saveDirectoryLinks } from "./actions";

const initialState: EntityFormState = { status: "idle" };

/** Ein Feld je Verzeichnis, ein Knopf fuer alle. */
export function ListingForm({ values }: { values: { id: DirectoryId; value: string }[] }) {
  const [state, formAction, pending] = useActionState(saveDirectoryLinks, initialState);
  const valueOf = (id: DirectoryId) => values.find((entry) => entry.id === id)?.value ?? "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {directories.map((directory) => (
        <TextField
          key={directory.id}
          name={`listing-${directory.id}`}
          type="url"
          inputMode="url"
          label={directory.name}
          description={directory.hint}
          placeholder={`https://${directory.hosts[0]}/…`}
          defaultValue={valueOf(directory.id)}
          autoComplete="off"
          spellCheck={false}
        />
      ))}

      {state.status !== "idle" && state.message && (
        <FormMessage status={state.status === "error" ? "error" : "success"}>{state.message}</FormMessage>
      )}

      <div>
        <Button type="submit" variant="primary" isDisabled={pending}>
          <Icon icon={pending ? LoadingIcon : CheckIcon} spin={pending} />
          {pending ? "Wird gespeichert …" : "Speichern"}
        </Button>
      </div>
    </form>
  );
}
