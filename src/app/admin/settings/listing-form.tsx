"use client";

import { useActionState } from "react";
import { Button } from "@heroui/react";
import { FormMessage, TextField } from "@/components/common/form-field";
import type { EntityFormState } from "@/components/admin/entity-types";
import { Icon, CheckIcon, LoadingIcon } from "@/lib/icons";
import { saveListenOnlineRadioUrl } from "./actions";

const initialState: EntityFormState = { status: "idle" };

/** Ein Feld, ein Knopf: Link zu VoltFM bei ListenOnlineRadio. */
export function ListingForm({ current }: { current: string | null }) {
  const [state, formAction, pending] = useActionState(saveListenOnlineRadioUrl, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        name="listenOnlineRadioUrl"
        type="url"
        inputMode="url"
        label="Link zu VoltFM bei ListenOnlineRadio"
        description="Erst eintragen, wenn der Eintrag dort freigegeben ist. Leer lassen heißt: kein Link auf der Seite."
        placeholder="https://listenonlineradio.com/…"
        defaultValue={current ?? ""}
        autoComplete="off"
        spellCheck={false}
      />

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
