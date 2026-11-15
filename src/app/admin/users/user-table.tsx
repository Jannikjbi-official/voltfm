"use client";

import { useActionState, useEffect, useState } from "react";
import { Avatar, Button } from "@heroui/react";
import { FormMessage, TextField } from "@/components/common/form-field";
import { Icon, CheckIcon, LoadingIcon, LogoutIcon } from "@/lib/icons";
import type { EntityFormState } from "@/components/admin/entity-types";
import { useActionFeedback } from "@/components/admin/use-action-feedback";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { StatusBadge } from "@/components/admin/admin-ui";
import { formatDate } from "@/lib/format";

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

  useActionFeedback(roleState);
  useActionFeedback(banState);
  useActionFeedback(revokeState);

  /* Die Sperre ist beantwortet: Rueckfrage schliessen, die Meldung steht oben. */
  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => setBanForm(null), [banState]);

  const state = roleState.message ? roleState : banState.message ? banState : revokeState;
  const banUser = users.find((user) => user.id === banForm) ?? null;

  return (
    <div className="flex flex-col gap-6">
      {state.message && (
        <FormMessage status={state.status === "success" ? "success" : "error"}>
          {state.message}
        </FormMessage>
      )}

      <ul className="divide-y divide-separator rounded-2xl border border-border bg-surface">
        {users.map((user) => {
          const display = user.name || user.username || user.email;
          return (
            <li
              key={user.id}
              data-banned={user.banned || undefined}
              className="grid grid-cols-1 gap-4 px-5 py-5 data-[banned]:bg-danger-soft/40 sm:px-6 xl:grid-cols-[minmax(0,1fr)_auto_13rem] xl:items-center xl:gap-6"
            >
              <div className="flex min-w-0 items-start gap-3">
                <Avatar size="sm" className="size-9 shrink-0">
                  <Avatar.Fallback className="text-xs font-semibold">
                    {display.slice(0, 2).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="min-w-0 truncate">{display}</span>
                    {user.isSelf && <StatusBadge color="accent">du</StatusBadge>}
                    {user.banned && <StatusBadge color="danger">Gesperrt</StatusBadge>}
                  </p>
                  <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
                    <span className="break-all">{user.email}</span>
                    {user.username && <span>@{user.username}</span>}
                    {user.createdAt && <span>seit {formatDate(user.createdAt, "short")}</span>}
                  </p>
                  {user.banned && user.banReason && (
                    <p className="mt-1 text-xs text-danger">Grund: {user.banReason}</p>
                  )}
                  {user.bootstrapAdmin && (
                    <p className="mt-1 text-xs text-muted">
                      Admin über ADMIN_USER_IDS — eine andere Rolle hier ändert daran nichts.
                    </p>
                  )}
                </div>
              </div>

              <form action={setRole} className="flex items-center gap-2">
                <input type="hidden" name="userId" value={user.id} />
                <label className="sr-only" htmlFor={`role-${user.id}`}>
                  Rolle
                </label>
                <div className="relative min-w-0 flex-1 xl:w-40 xl:flex-none">
                  <select
                    id={`role-${user.id}`}
                    name="role"
                    defaultValue={roles.includes(user.role) ? user.role : "user"}
                    className="input w-full appearance-none pr-8"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role] ?? role}
                      </option>
                    ))}
                  </select>
                  <svg
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted"
                  >
                    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <Button type="submit" variant="tertiary" size="sm" isPending={savingRole}>
                  <Icon icon={savingRole ? LoadingIcon : CheckIcon} spin={savingRole} />
                  Übernehmen
                </Button>
              </form>

              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <form action={revoke}>
                  <input type="hidden" name="userId" value={user.id} />
                  <Button type="submit" variant="ghost" size="sm" isPending={revoking}>
                    <Icon icon={LogoutIcon} />
                    Abmelden
                  </Button>
                </form>

                {user.banned ? (
                  <form action={toggleBan}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="ban" value="0" />
                    <Button type="submit" variant="outline" size="sm" isPending={banning}>
                      Entsperren
                    </Button>
                  </form>
                ) : user.isSelf ? null : (
                  <Button variant="danger-soft" size="sm" onPress={() => setBanForm(user.id)}>
                    Sperren
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        isOpen={banUser !== null}
        onOpenChange={(open) => !open && !banning && setBanForm(null)}
        title="Wirklich sperren?"
        description={
          banUser ? (
            <p className="font-semibold">{banUser.name || banUser.username || banUser.email}</p>
          ) : null
        }
        action={toggleBan}
        fields={{ userId: banUser?.id ?? "", ban: "1" }}
        confirmLabel="Sperren"
        pending={banning}
      >
        <TextField name="reason" label="Grund der Sperre" placeholder="Grund (optional)" />
      </ConfirmDialog>
    </div>
  );
}
