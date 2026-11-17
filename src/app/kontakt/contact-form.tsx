"use client";

import { useActionState } from "react";
import { Button } from "@heroui/react";
import {
  CheckboxField,
  FormMessage,
  TextAreaField,
  TextField,
} from "@/components/common/form-field";
import { Icon, SendIcon, CheckIcon, LoadingIcon } from "@/lib/icons";
import { submitContact, type ContactState } from "./actions";

const initialState: ContactState = { status: "idle" };

/**
 * Kontaktformular.
 *
 * Laeuft ueber eine Server Action: Es funktioniert vor dem Hydrieren und
 * faellt auf einen normalen POST zurueck. Geprueft wird auf dem Server (nur
 * dort zaehlt es); die Browser-Pruefung uebernimmt den ersten Durchgang.
 * Die Felder sind native Eingaben, also landet alles im FormData.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="surface-card flex flex-col items-start gap-3 rounded-[2rem] p-7 sm:p-12"
      >
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-2xl bg-success-soft text-lg text-success"
        >
          <Icon icon={CheckIcon} />
        </span>
        <h2 className="font-display text-[2rem] text-foreground sm:text-4xl">Nachricht gesendet</h2>
        <p className="leading-relaxed text-muted">{state.message}</p>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="surface-card relative flex flex-col gap-5 rounded-[2rem] p-6 sm:p-10"
    >
      {state.status === "error" && state.message && (
        <FormMessage status="error">{state.message}</FormMessage>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          placeholder="Wie heißt du?"
          error={errors.name}
        />
        <TextField
          label="E-Mail"
          name="email"
          type="email"
          required
          maxLength={160}
          autoComplete="email"
          placeholder="name@beispiel.de"
          error={errors.email}
        />
      </div>

      <TextField
        label="Betreff"
        name="subject"
        type="text"
        required
        minLength={3}
        maxLength={120}
        placeholder="Worum geht es?"
        error={errors.subject}
      />

      <TextAreaField
        label="Nachricht"
        name="message"
        required
        minLength={20}
        maxLength={4000}
        rows={7}
        placeholder="Erzähl uns, was du loswerden möchtest."
        description="Mindestens 20 Zeichen."
        error={errors.message}
      />

      {/* Honigtopf. Fuer Menschen und Screenreader unsichtbar, fuer Bots nicht. */}
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website (bitte leer lassen)</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-1.5">
        <CheckboxField
          name="privacy"
          required
          label={
            <>
              Ich habe die{" "}
              <a href="/datenschutz" className="underline underline-offset-4">
                Datenschutzerklärung
              </a>{" "}
              gelesen und bin einverstanden, dass meine Angaben zur Bearbeitung der
              Anfrage gespeichert werden.
            </>
          }
        />
        {errors.privacy && (
          <p className="pl-[1.875rem] text-xs font-medium text-danger">{errors.privacy}</p>
        )}
      </div>

      <div>
        <Button type="submit" variant="primary" size="lg" isDisabled={pending}>
          <Icon icon={pending ? LoadingIcon : SendIcon} spin={pending} />
          {pending ? "Wird gesendet …" : "Nachricht senden"}
        </Button>
      </div>
    </form>
  );
}
