"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { Icon, LoadingIcon, PlusIcon } from "@/lib/icons";
import { authClient } from "@/lib/auth-client";
import styles from "../login/page.module.css";

/**
 * Account creation.
 *
 * Better Auth's username plugin sits on top of the email/password provider, so
 * a sign-up supplies both. The username is what the rest of VoltFM shows.
 */
export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);

    const username = String(formData.get("username") ?? "").trim().toLowerCase();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();

    // Mirrors the server-side validator configured on the username plugin.
    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      setError("Der Username darf nur Kleinbuchstaben, Zahlen und _ enthalten (3–24 Zeichen).");
      return;
    }
    if (password.length < 10) {
      setError("Das Passwort muss mindestens 10 Zeichen lang sein.");
      return;
    }

    setPending(true);
    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name: name || username,
      username,
    });

    if (signUpError) {
      setError(
        signUpError.message ??
          "Registrierung fehlgeschlagen. Username oder E-Mail sind eventuell schon vergeben.",
      );
      setPending(false);
      return;
    }

    router.push("/konto");
    router.refresh();
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Konto erstellen</h1>
      <p className={styles.subtitle}>
        Für Profil, Favoriten und Community. Zum Hören brauchst du kein Konto.
      </p>

      {error && (
        <Alert variant="lighter" status="error" role="alert">
          <AlertContent>
            <AlertDescription>{error}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <form action={handleSubmit} className={styles.form}>
        <Field name="username" className={styles.field}>
          <FieldLabel>Username</FieldLabel>
          <Input
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={24}
            pattern="[a-zA-Z0-9_]+"
            autoComplete="username"
            placeholder="dein_username"
          />
          <FieldDescription>Kleinbuchstaben, Zahlen und _ — 3 bis 24 Zeichen.</FieldDescription>
        </Field>

        <Field name="name" className={styles.field}>
          <FieldLabel>Anzeigename</FieldLabel>
          <Input
            name="name"
            type="text"
            maxLength={60}
            autoComplete="nickname"
            placeholder="Wie sollen wir dich nennen?"
          />
        </Field>

        <Field name="email" className={styles.field}>
          <FieldLabel>E-Mail</FieldLabel>
          <Input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="name@beispiel.de"
          />
        </Field>

        <Field name="password" className={styles.field}>
          <FieldLabel>Passwort</FieldLabel>
          <Input
            name="password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            placeholder="Mindestens 10 Zeichen"
          />
        </Field>

        <Button type="submit" variant="primary" mode="filled" size="lg" disabled={pending}>
          <Icon icon={pending ? LoadingIcon : PlusIcon} spin={pending} />
          {pending ? "Konto wird erstellt …" : "Konto erstellen"}
        </Button>
      </form>

      <p className={styles.footer}>
        Schon ein Konto? <Link href="/login">Anmelden</Link>
      </p>
    </div>
  );
}
