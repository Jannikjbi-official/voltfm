"use client";

import { useActionState } from "react";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckBox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { Icon, SendIcon, CheckIcon, LoadingIcon } from "@/lib/icons";
import { submitContact, type ContactState } from "./actions";
import styles from "./page.module.css";

const initialState: ContactState = { status: "idle" };

/**
 * Contact form.
 *
 * Built on a server action, so it works before hydration and degrades to a
 * plain POST. Validation runs on the server (the only place it counts); the
 * browser's own constraint validation handles the first pass for free.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  if (state.status === "success") {
    return (
      <div className={styles.success} role="status">
        <Icon icon={CheckIcon} className={styles.successIcon} />
        <h2 className={styles.successTitle}>Nachricht gesendet</h2>
        <p className={styles.successText}>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className={styles.form} noValidate={false}>
      {state.status === "error" && state.message && (
        <Alert variant="lighter" status="error" role="alert">
          <AlertContent>
            <AlertDescription>{state.message}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <div className={styles.row}>
        <Field name="name" className={styles.field}>
          <FieldLabel>Name</FieldLabel>
          <Input
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            placeholder="Wie heißt du?"
            aria-invalid={state.fieldErrors?.name ? true : undefined}
          />
          {state.fieldErrors?.name && <p className={styles.error}>{state.fieldErrors.name}</p>}
        </Field>

        <Field name="email" className={styles.field}>
          <FieldLabel>E-Mail</FieldLabel>
          <Input
            name="email"
            type="email"
            required
            maxLength={160}
            autoComplete="email"
            placeholder="name@beispiel.de"
            aria-invalid={state.fieldErrors?.email ? true : undefined}
          />
          {state.fieldErrors?.email && <p className={styles.error}>{state.fieldErrors.email}</p>}
        </Field>
      </div>

      <Field name="subject" className={styles.field}>
        <FieldLabel>Betreff</FieldLabel>
        <Input
          name="subject"
          type="text"
          required
          minLength={3}
          maxLength={120}
          placeholder="Worum geht es?"
          aria-invalid={state.fieldErrors?.subject ? true : undefined}
        />
        {state.fieldErrors?.subject && (
          <p className={styles.error}>{state.fieldErrors.subject}</p>
        )}
      </Field>

      <Field name="message" className={styles.field}>
        <FieldLabel>Nachricht</FieldLabel>
        <Textarea
          name="message"
          required
          minLength={20}
          maxLength={4000}
          rows={7}
          placeholder="Erzähl uns, was du loswerden möchtest."
          aria-invalid={state.fieldErrors?.message ? true : undefined}
        />
        <FieldDescription>Mindestens 20 Zeichen.</FieldDescription>
        {state.fieldErrors?.message && (
          <p className={styles.error}>{state.fieldErrors.message}</p>
        )}
      </Field>

      {/* Honeypot. Hidden from people and from screen readers, visible to bots. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Website (bitte leer lassen)</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field name="privacy" className={styles.consent}>
        <label className={styles.consentLabel}>
          <CheckBox name="privacy" required />
          <span>
            Ich habe die <a href="/datenschutz">Datenschutzerklärung</a> gelesen und bin
            einverstanden, dass meine Angaben zur Bearbeitung der Anfrage gespeichert werden.
          </span>
        </label>
        {state.fieldErrors?.privacy && (
          <p className={styles.error}>{state.fieldErrors.privacy}</p>
        )}
      </Field>

      <Button type="submit" variant="primary" mode="filled" size="lg" disabled={pending}>
        <Icon icon={pending ? LoadingIcon : SendIcon} spin={pending} />
        {pending ? "Wird gesendet …" : "Nachricht senden"}
      </Button>
    </form>
  );
}
