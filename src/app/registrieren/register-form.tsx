"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@heroui/react";
import { FormMessage, TextField } from "@/components/common/form-field";
import { Icon, PlusIcon } from "@/lib/icons";
import { authClient } from "@/lib/auth-client";
import { AuthCard } from "../login/auth-card";

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
    <AuthCard
      title="Konto erstellen"
      description="Für Profil, Favoriten und Community. Zum Hören brauchst du kein Konto."
      footer={
        <>
          Schon ein Konto?{" "}
          <Link
            href="/login"
            className="rounded-sm font-semibold text-foreground underline decoration-accent-text decoration-2 underline-offset-4"
          >
            Anmelden
          </Link>
        </>
      }
    >
      {error && <FormMessage status="error">{error}</FormMessage>}

      <form action={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Username"
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={24}
          pattern="[a-zA-Z0-9_]+"
          autoComplete="username"
          placeholder="dein_username"
          description="Kleinbuchstaben, Zahlen und _ — 3 bis 24 Zeichen."
        />

        <TextField
          label="Anzeigename"
          name="name"
          type="text"
          maxLength={60}
          autoComplete="nickname"
          placeholder="Wie sollen wir dich nennen?"
        />

        <TextField
          label="E-Mail"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@beispiel.de"
        />

        <TextField
          label="Passwort"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          placeholder="Mindestens 10 Zeichen"
        />

        <Button type="submit" variant="primary" size="lg" fullWidth isPending={pending}>
          {!pending && <Icon icon={PlusIcon} />}
          {pending ? "Konto wird erstellt …" : "Konto erstellen"}
        </Button>
      </form>
    </AuthCard>
  );
}
