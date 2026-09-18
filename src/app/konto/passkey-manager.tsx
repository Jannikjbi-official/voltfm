"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { Icon, PasskeyIcon, PlusIcon, DeleteIcon, LoadingIcon } from "@/lib/icons";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";
import styles from "./page.module.css";

interface Passkey {
  id: string;
  name?: string | null;
  createdAt: string | Date;
  deviceType?: string | null;
}

/**
 * Passkey management: list, add and remove WebAuthn credentials.
 *
 * All of it runs through Better Auth's passkey plugin, which performs the
 * actual WebAuthn ceremony in the browser and verifies it on the server.
 */
export function PasskeyManager() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await authClient.passkey.listUserPasskeys();
    setPasskeys((data as Passkey[] | null) ?? []);
    setLoading(false);
  }, []);

  /* Fetching the credential list on mount is exactly what an effect is for:
     it talks to the server, which cannot happen during render. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void load();
  }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleAdd() {
    setError(null);
    setBusy(true);
    const result = await authClient.passkey.addPasskey({
      // Gives the credential a recognisable label in the account list.
      name: `VoltFM · ${new Date().toLocaleDateString("de-DE")}`,
    });
    if (result?.error) {
      setError("Passkey konnte nicht hinzugefügt werden. Unterstützt dein Gerät WebAuthn?");
    } else {
      await load();
    }
    setBusy(false);
  }

  async function handleRemove(id: string) {
    setError(null);
    setBusy(true);
    const { error: removeError } = await authClient.passkey.deletePasskey({ id });
    if (removeError) {
      setError("Passkey konnte nicht entfernt werden.");
    } else {
      await load();
    }
    setBusy(false);
  }

  return (
    <>
      {error && (
        <Alert variant="lighter" status="error" role="alert">
          <AlertContent>
            <AlertDescription>{error}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      {loading ? (
        <p className={styles.empty}>Passkeys werden geladen …</p>
      ) : passkeys.length === 0 ? (
        <p className={styles.empty}>Noch kein Passkey hinterlegt.</p>
      ) : (
        <ul className={styles.passkeyList} role="list">
          {passkeys.map((passkey) => (
            <li key={passkey.id} className={styles.passkey}>
              <div className={styles.passkeyName}>
                <span className={styles.passkeyLabel}>
                  <Icon icon={PasskeyIcon} /> {passkey.name || "Passkey"}
                </span>
                <span className={styles.passkeyMeta}>
                  Hinzugefügt am {formatDate(passkey.createdAt)}
                </span>
              </div>
              <Button
                variant="error"
                mode="ghost"
                size="sm"
                onClick={() => handleRemove(passkey.id)}
                disabled={busy}
                aria-label={`${passkey.name || "Passkey"} entfernen`}
              >
                <Icon icon={DeleteIcon} />
                Entfernen
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button variant="primary" mode="stroke" size="md" onClick={handleAdd} disabled={busy}>
        <Icon icon={busy ? LoadingIcon : PlusIcon} spin={busy} />
        Passkey hinzufügen
      </Button>
    </>
  );
}
