"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { Icon, DiscordIcon, PasskeyIcon, LoadingIcon, UserIcon } from "@/lib/icons";
import { authClient } from "@/lib/auth-client";
import styles from "./page.module.css";

type Pending = "none" | "discord" | "passkey" | "username";

/**
 * Sign-in.
 *
 * Three routes into the same Better Auth account: Discord OAuth, a passkey, or
 * a username and password. Passkeys are offered first where the browser
 * supports them, because they are both the safest and the fastest.
 */
export function LoginForm({ discordEnabled }: { discordEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState<Pending>("none");
  const [error, setError] = useState<string | null>(null);

  // Only ever redirect to a path on this site — never to an absolute URL a
  // visitor put in the query string.
  const rawRedirect = searchParams.get("redirect") ?? "/";
  const redirectTo = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
    ? rawRedirect
    : "/";

  function done() {
    router.push(redirectTo);
    router.refresh();
  }

  async function handleDiscord() {
    setError(null);
    setPending("discord");
    try {
      await authClient.signIn.social({ provider: "discord", callbackURL: redirectTo });
    } catch {
      setError("Die Anmeldung über Discord hat nicht geklappt. Bitte versuch es erneut.");
      setPending("none");
    }
  }

  async function handlePasskey() {
    setError(null);
    setPending("passkey");
    const { error: passkeyError } = await authClient.signIn.passkey();
    if (passkeyError) {
      setError("Anmeldung mit Passkey fehlgeschlagen. Vielleicht ist auf diesem Gerät keiner hinterlegt.");
      setPending("none");
      return;
    }
    done();
  }

  async function handleUsername(formData: FormData) {
    setError(null);
    setPending("username");

    const { error: signInError } = await authClient.signIn.username({
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (signInError) {
      setError("Username oder Passwort stimmen nicht.");
      setPending("none");
      return;
    }
    done();
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Bei VoltFM anmelden</h1>
      <p className={styles.subtitle}>
        Dein Konto ist für Profil, Favoriten und die Redaktion. Zum Hören
        brauchst du es nicht — der Stream läuft immer ohne Anmeldung.
      </p>

      {error && (
        <Alert variant="lighter" status="error" role="alert">
          <AlertContent>
            <AlertDescription>{error}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <div className={styles.methods}>
        {discordEnabled && (
          <Button
            variant="primary"
            mode="filled"
            size="lg"
            onClick={handleDiscord}
            disabled={pending !== "none"}
          >
            <Icon icon={pending === "discord" ? LoadingIcon : DiscordIcon} spin={pending === "discord"} />
            Mit Discord anmelden
          </Button>
        )}

        <Button
          variant="neutral"
          mode="stroke"
          size="lg"
          onClick={handlePasskey}
          disabled={pending !== "none"}
        >
          <Icon icon={pending === "passkey" ? LoadingIcon : PasskeyIcon} spin={pending === "passkey"} />
          Mit Passkey anmelden
        </Button>
      </div>

      <div className={styles.divider}>
        <Separator />
        <span>oder mit Username</span>
        <Separator />
      </div>

      <form action={handleUsername} className={styles.form}>
        <Field name="username" className={styles.field}>
          <FieldLabel>Username</FieldLabel>
          <Input
            name="username"
            type="text"
            required
            autoComplete="username"
            placeholder="dein_username"
          />
        </Field>

        <Field name="password" className={styles.field}>
          <FieldLabel>Passwort</FieldLabel>
          <Input
            name="password"
            type="password"
            required
            minLength={10}
            autoComplete="current-password"
            placeholder="••••••••••"
          />
        </Field>

        <Button
          type="submit"
          variant="neutral"
          mode="filled"
          size="lg"
          disabled={pending !== "none"}
        >
          <Icon icon={pending === "username" ? LoadingIcon : UserIcon} spin={pending === "username"} />
          Anmelden
        </Button>
      </form>

      <p className={styles.footer}>
        Noch kein Konto? <Link href="/registrieren">Jetzt registrieren</Link>
      </p>
    </div>
  );
}
