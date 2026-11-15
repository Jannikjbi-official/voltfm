"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { FormMessage } from "@/components/common/form-field";
import { Icon, PasskeyIcon, PlusIcon, DeleteIcon } from "@/lib/icons";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";

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
    <div className="flex flex-col gap-4">
      {error && <FormMessage status="error">{error}</FormMessage>}

      {loading ? (
        <p className="text-sm text-muted">Passkeys werden geladen …</p>
      ) : passkeys.length === 0 ? (
        <p className="text-sm text-muted">Noch kein Passkey hinterlegt.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {passkeys.map((passkey) => (
            <li
              key={passkey.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-secondary text-foreground"
                >
                  <Icon icon={PasskeyIcon} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{passkey.name || "Passkey"}</p>
                  <p className="text-sm text-muted">Hinzugefügt am {formatDate(passkey.createdAt)}</p>
                </div>
              </div>
              <Button
                variant="danger-soft"
                size="sm"
                onPress={() => handleRemove(passkey.id)}
                isDisabled={busy}
                aria-label={`${passkey.name || "Passkey"} entfernen`}
              >
                <Icon icon={DeleteIcon} />
                Entfernen
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <Button variant="secondary" onPress={handleAdd} isPending={busy}>
          {!busy && <Icon icon={PlusIcon} />}
          Passkey hinzufügen
        </Button>
      </div>
    </div>
  );
}
