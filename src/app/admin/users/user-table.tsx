"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { Icon, CheckIcon, LoadingIcon, DeleteIcon, CloseIcon } from "@/lib/icons";
import type { EntityFormState } from "@/components/admin/entity-types";
import { formatDate } from "@/lib/format";
import styles from "./users.module.css";
import formStyles from "@/components/admin/admin-form.module.css";

const initial: EntityFormState = { status: "idle" };

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  role: string;
  banned: boolean;
  banReason?: string | null;
  createdAt?: string | null;
  isSelf: boolean;
  /** Admin through ADMIN_USER_IDS rather than a stored role. */
  bootstrapAdmin: boolean;
}

type Action = (state: EntityFormState, formData: FormData) => Promise<EntityFormState>;

/**
 * User administration.
 *
 * Every mutation is a server action; the table only decides what to show. The
 * server re-checks the admin role and refuses self-demotion and self-ban, so a
 * crafted POST cannot do what the UI prevents.
 */
export function UserTable({
  users,
  roles,
  roleLabels,
  setRoleAction,
  banAction,
  revokeAction,
}: {
  users: AdminUser[];
  roles: readonly string[];
  roleLabels: Record<string, string>;
  setRoleAction: Action;
  banAction: Action;
  revokeAction: Action;
}) {
  const [roleState, setRole, savingRole] = useActionState(setRoleAction, initial);
  const [banState, toggleBan, banning] = useActionState(banAction, initial);
  const [revokeState, revoke, revoking] = useActionState(revokeAction, initial);
  const [banForm, setBanForm] = useState<string | null>(null);

  const state = roleState.message ? roleState : banState.message ? banState : revokeState;

  return (
    <div className={styles.wrap}>
      {state.message && (
        <Alert
          variant="lighter"
          status={state.status === "success" ? "success" : "error"}
          role="status"
        >
          <AlertContent>
            <AlertDescription>{state.message}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <ul className={styles.list} role="list">
        {users.map((user) => (
          <li key={user.id} className={styles.row} data-banned={user.banned || undefined}>
            <div className={styles.identity}>
              <span className={styles.name}>
                {user.name || user.username || user.email}
                {user.isSelf && <span className={styles.you}>du</span>}
              </span>
              <span className={styles.meta}>
                {user.email}
                {user.username ? ` · @${user.username}` : ""}
                {user.createdAt ? ` · seit ${formatDate(user.createdAt, "short")}` : ""}
              </span>
              {user.banned && (
                <span className={styles.banned}>
                  Gesperrt{user.banReason ? `: ${user.banReason}` : ""}
                </span>
              )}
              {user.bootstrapAdmin && (
                <span className={styles.meta}>
                  Admin über ADMIN_USER_IDS — eine andere Rolle hier ändert daran nichts.
                </span>
              )}
            </div>

            <form action={setRole} className={styles.roleForm}>
              <input type="hidden" name="userId" value={user.id} />
              <label className={styles.srOnly} htmlFor={`role-${user.id}`}>
                Rolle
              </label>
              <select
                id={`role-${user.id}`}
                name="role"
                defaultValue={roles.includes(user.role) ? user.role : "user"}
                className={formStyles.select}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role] ?? role}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="neutral" mode="stroke" size="sm" disabled={savingRole}>
                <Icon icon={savingRole ? LoadingIcon : CheckIcon} spin={savingRole} />
                Übernehmen
              </Button>
            </form>

            <div className={styles.actions}>
              <form action={revoke}>
                <input type="hidden" name="userId" value={user.id} />
                <Button type="submit" variant="neutral" mode="ghost" size="sm" disabled={revoking}>
                  Abmelden
                </Button>
              </form>

              {user.banned ? (
                <form action={toggleBan}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="ban" value="0" />
                  <Button type="submit" variant="neutral" mode="stroke" size="sm" disabled={banning}>
                    Entsperren
                  </Button>
                </form>
              ) : user.isSelf ? null : banForm === user.id ? (
                <form action={toggleBan} className={styles.banForm}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="ban" value="1" />
                  <Input name="reason" placeholder="Grund (optional)" aria-label="Grund der Sperre" />
                  <Button type="submit" variant="error" mode="filled" size="sm" disabled={banning}>
                    <Icon icon={banning ? LoadingIcon : DeleteIcon} spin={banning} />
                    Sperren
                  </Button>
                  <Button
                    type="button"
                    variant="neutral"
                    mode="ghost"
                    size="sm"
                    onClick={() => setBanForm(null)}
                  >
                    <Icon icon={CloseIcon} />
                  </Button>
                </form>
              ) : (
                <Button
                  type="button"
                  variant="error"
                  mode="ghost"
                  size="sm"
                  onClick={() => setBanForm(user.id)}
                >
                  Sperren
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
