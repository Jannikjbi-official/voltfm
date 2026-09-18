"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { Icon, DiscordIcon, LoadingIcon, CheckIcon, LinkIcon } from "@/lib/icons";
import { authClient } from "@/lib/auth-client";
import styles from "./page.module.css";

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
      <p className={styles.empty}>
        Discord-Login ist auf diesem Server nicht konfiguriert.
      </p>
    );
  }

  return (
    <>
      {notice === "linked" && !error && (
        <Alert variant="lighter" status="success" role="status">
          <AlertContent>
            <AlertDescription>Discord ist jetzt mit deinem Konto verknüpft.</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      {notice === "failed" && !error && (
        <Alert variant="lighter" status="error" role="alert">
          <AlertContent>
            <AlertDescription>
              Die Verknüpfung mit Discord wurde abgebrochen. Falls du sie selbst
              abgebrochen hast, ist alles in Ordnung — sonst versuch es einfach
              noch einmal.
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}

      {error && (
        <Alert variant="lighter" status="error" role="alert">
          <AlertContent>
            <AlertDescription>{error}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      {loading ? (
        <p className={styles.empty}>Verknüpfungen werden geladen …</p>
      ) : (
        <div className={styles.provider}>
          <div className={styles.providerName}>
            <span className={styles.providerLabel}>
              <Icon icon={DiscordIcon} /> Discord
            </span>
            <span className={styles.providerMeta}>
              {discord ? (
                <>
                  <Icon icon={CheckIcon} className={styles.connectedIcon} /> Verknüpft
                </>
              ) : (
                "Nicht verknüpft"
              )}
            </span>
          </div>

          {discord ? (
            <Button
              variant="error"
              mode="ghost"
              size="sm"
              onClick={handleUnlink}
              disabled={busy || !hasOtherLogin}
              title={
                hasOtherLogin
                  ? undefined
                  : "Du brauchst erst eine andere Anmeldemethode, sonst kommst du nicht mehr rein."
              }
            >
              <Icon icon={busy ? LoadingIcon : LinkIcon} spin={busy} />
              Trennen
            </Button>
          ) : (
            <Button
              variant="primary"
              mode="stroke"
              size="sm"
              onClick={handleLink}
              disabled={busy}
            >
              <Icon icon={busy ? LoadingIcon : DiscordIcon} spin={busy} />
              Discord verknüpfen
            </Button>
          )}
        </div>
      )}

      {discord && !hasOtherLogin && (
        <p className={styles.hint}>
          Discord ist gerade deine einzige Anmeldemethode. Lege zuerst einen
          Passkey an, bevor du die Verknüpfung löst.
        </p>
      )}
    </>
  );
}
