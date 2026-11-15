"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { FormMessage } from "@/components/common/form-field";
import { Icon, DiscordIcon, CheckIcon, LinkIcon } from "@/lib/icons";
import { authClient } from "@/lib/auth-client";

interface LinkedAccount {
  id: string;
  providerId: string;
  /** The provider's own user id — what the unlink endpoint expects. */
  accountId: string;
  createdAt?: string | Date;
}

/**
 * Connect or disconnect Discord.
 *
 * Linking runs through Better Auth's `linkSocial`, which sends the user through
 * the normal OAuth flow and attaches the result to the *existing* account
 * rather than creating a second one.
 */
export function ConnectedAccounts({
  discordEnabled,
  notice = null,
}: {
  discordEnabled: boolean;
  /** Outcome of the OAuth round-trip, read from the query string on the server. */
  notice?: "linked" | "failed" | null;
}) {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await authClient.listAccounts();
    setAccounts((data as LinkedAccount[] | null) ?? []);
    setLoading(false);
  }, []);

  /* One-shot read of server state on mount. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void load();
  }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const discord = accounts.find((account) => account.providerId === "discord");
  // A credential account means there is a password to fall back on; without one,
  // unlinking Discord could lock the user out entirely.
  const hasOtherLogin = accounts.some((account) => account.providerId !== "discord");

  async function handleLink() {
    setError(null);
    setBusy(true);
    const { error: linkError } = await authClient.linkSocial({
      provider: "discord",
      callbackURL: "/konto?verknuepft=discord",
      // Without this an aborted link drops the user on the start page with a
      // bare `?error=...` in the URL and no explanation.
      errorCallbackURL: "/konto?fehler=discord",
    });
    if (linkError) {
      setError("Discord konnte nicht verknüpft werden. Bitte versuch es erneut.");
      setBusy(false);
    }
    // On success the browser is redirected to Discord, so nothing to reset here.
  }

  async function handleUnlink() {
    if (!discord?.accountId) return;
    setError(null);
    setBusy(true);

    const { error: unlinkError } = await authClient.unlinkAccount({
      accountId: discord.accountId,
    });

    if (unlinkError) {
      setError("Die Verknüpfung konnte nicht gelöst werden.");
    } else {
      await load();
    }
    setBusy(false);
  }

  if (!discordEnabled) {
    return (
      <p className="text-sm text-muted">Discord-Login ist auf diesem Server nicht konfiguriert.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {notice === "linked" && !error && (
        <FormMessage status="success">Discord ist jetzt mit deinem Konto verknüpft.</FormMessage>
      )}

      {notice === "failed" && !error && (
        <FormMessage status="error">
          Die Verknüpfung mit Discord wurde abgebrochen. Falls du sie selbst
          abgebrochen hast, ist alles in Ordnung — sonst versuch es einfach
          noch einmal.
        </FormMessage>
      )}

      {error && <FormMessage status="error">{error}</FormMessage>}

      {loading ? (
        <p className="text-sm text-muted">Verknüpfungen werden geladen …</p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-full bg-surface-secondary text-foreground"
            >
              <Icon icon={DiscordIcon} />
            </span>
            <div>
              <p className="font-semibold text-foreground">Discord</p>
              <p className="flex items-center gap-1.5 text-sm text-muted">
                {discord ? (
                  <>
                    <Icon icon={CheckIcon} className="text-success" /> Verknüpft
                  </>
                ) : (
                  "Nicht verknüpft"
                )}
              </p>
            </div>
          </div>

          {discord ? (
            <Button
              variant="danger-soft"
              size="sm"
              onPress={handleUnlink}
              isDisabled={!hasOtherLogin}
              isPending={busy}
            >
              {!busy && <Icon icon={LinkIcon} />}
              Trennen
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onPress={handleLink} isPending={busy}>
              {!busy && <Icon icon={DiscordIcon} />}
              Discord verknüpfen
            </Button>
          )}
        </div>
      )}

      {discord && !hasOtherLogin && (
        <p className="text-sm text-muted">
          Discord ist gerade deine einzige Anmeldemethode. Lege zuerst einen
          Passkey an, bevor du die Verknüpfung löst.
        </p>
      )}
    </div>
  );
}
