"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@heroui/react";
import { FormMessage, TextField } from "@/components/common/form-field";
import { Icon, DiscordIcon, PasskeyIcon, UserIcon } from "@/lib/icons";
import { authClient } from "@/lib/auth-client";
import { AuthCard, AuthDivider } from "./auth-card";

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

  const busy = pending !== "none";

  return (
    <AuthCard
      title="Bei VoltFM anmelden"
      description={
        <>
          Dein Konto ist für Profil, Favoriten und die Redaktion. Zum Hören
          brauchst du es nicht — der Stream läuft immer ohne Anmeldung.
        </>
      }
      footer={
        <>
          Noch kein Konto?{" "}
          <Link
            href="/registrieren"
            className="rounded-sm font-semibold text-foreground underline decoration-accent-text decoration-2 underline-offset-4"
          >
            Jetzt registrieren
          </Link>
        </>
      }
    >
      {error && <FormMessage status="error">{error}</FormMessage>}

      <div className="flex flex-col gap-3">
        {discordEnabled && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleDiscord}
            isDisabled={busy && pending !== "discord"}
            isPending={pending === "discord"}
          >
            {pending !== "discord" && <Icon icon={DiscordIcon} />}
            Mit Discord anmelden
          </Button>
        )}

        <Button
          variant="tertiary"
          size="lg"
          fullWidth
          onPress={handlePasskey}
          isDisabled={busy && pending !== "passkey"}
          isPending={pending === "passkey"}
        >
          {pending !== "passkey" && <Icon icon={PasskeyIcon} />}
          Mit Passkey anmelden
        </Button>
      </div>

      <AuthDivider>oder mit Username</AuthDivider>

      <form action={handleUsername} className="flex flex-col gap-4">
        <TextField
          label="Username"
          name="username"
          type="text"
          required
          autoComplete="username"
          placeholder="dein_username"
        />

        <TextField
          label="Passwort"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="current-password"
          placeholder="••••••••••"
        />

        <Button
          type="submit"
          variant="tertiary"
          size="lg"
          fullWidth
          isDisabled={busy && pending !== "username"}
          isPending={pending === "username"}
        >
          {pending !== "username" && <Icon icon={UserIcon} />}
          Anmelden
        </Button>
      </form>
    </AuthCard>
  );
}
