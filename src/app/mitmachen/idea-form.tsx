"use client";

import { useActionState } from "react";
import { Button } from "@heroui/react";
import {
  CheckboxField,
  FormMessage,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/common/form-field";
import { IDEA_KIND_LIST, IDEA_KINDS, IDEA_NAME_MAX, IDEA_TEXT_MAX, IDEA_TEXT_MIN } from "@/lib/ideas";
import { Icon, LoadingIcon, SendIcon } from "@/lib/icons";
import { submitIdea } from "./actions";
import type { IdeaState } from "./idea-state";

const initialState: IdeaState = { status: "idle" };

/**
 * Vorschlag oder Playlist-Idee einreichen. Geht über unseren Server als Karte
 * in den passenden Discord-Kanal; auf voltfm.xyz wird nichts gespeichert.
 */
export function IdeaForm() {
  const [state, formAction, pending] = useActionState(submitIdea, initialState);
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div role="status" className="surface-card flex flex-col gap-3 rounded-[var(--radius)] p-6 sm:p-8">
        <p className="text-lg font-bold text-foreground">{state.message}</p>
        <p className="text-sm text-muted">
          Ob und wann etwas hier auf der Seite auftaucht, entscheidet das Team.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="surface-card relative flex flex-col gap-5 rounded-[var(--radius)] p-6 sm:p-8">
      {state.status !== "idle" && state.message && (
        <FormMessage status={state.status === "info" ? "info" : "error"}>{state.message}</FormMessage>
      )}

      <SelectField
        label="Was ist es?"
        name="kind"
        required
        defaultValue="vorschlag"
        options={IDEA_KIND_LIST.map((kind) => ({ value: kind, label: IDEA_KINDS[kind].label }))}
        error={errors.kind}
      />

      <TextField
        label="Dein Name"
        name="name"
        type="text"
        required
        minLength={2}
        maxLength={IDEA_NAME_MAX}
        autoComplete="nickname"
        placeholder="So, wie wir dich nennen sollen"
        description="Steht dabei, wenn wir deinen Eintrag zeigen."
        error={errors.name}
      />

      <TextAreaField
        label="Deine Idee"
        name="text"
        required
        minLength={IDEA_TEXT_MIN}
        maxLength={IDEA_TEXT_MAX}
        rows={5}
        placeholder="Ein Song, eine Sendung, eine Playlist für den Herbst …"
        error={errors.text}
      />

      {/* Honigtopf. Für Menschen und Screenreader unsichtbar, für Bots nicht. */}
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="idea-website">Website (bitte leer lassen)</label>
        <input id="idea-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-1.5">
        <CheckboxField
          name="privacy"
          required
          label={
            <>
              Mein Name und mein Text gehen in den VoltFM-Discord und können dort und hier auf
              der Seite erscheinen. Mehr dazu in der{" "}
              <a href="/datenschutz#vorschlaege-und-playlist-ideen" className="underline underline-offset-4">
                Datenschutzerklärung
              </a>
              .
            </>
          }
        />
        {errors.privacy && <p className="pl-[1.875rem] text-xs font-medium text-danger">{errors.privacy}</p>}
      </div>

      <div>
        <Button type="submit" variant="primary" size="lg" isDisabled={pending}>
          <Icon icon={pending ? LoadingIcon : SendIcon} spin={pending} />
          {pending ? "Wird gesendet …" : "Abschicken"}
        </Button>
      </div>
    </form>
  );
}
