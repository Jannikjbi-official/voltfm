"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { Avatar, Button, Dropdown, Label, cn } from "@heroui/react";
import { FormMessage, SelectField, TextField } from "@/components/common/form-field";
import { Icon, LogoutIcon, MoreIcon, SearchIcon, UserIcon, WarningIcon, CheckIcon } from "@/lib/icons";
import type { EntityFormState } from "@/components/admin/entity-types";
import { useActionFeedback } from "@/components/admin/use-action-feedback";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { AdminTable, PillCount, StatusBadge, Td, Th, filterPillClass, trClass } from "@/components/admin/admin-ui";
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

/** Fuer die Suche: klein, ohne Umlaut-Unterschiede. */
function fold(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function roleTone(user: AdminUser): "accent" | "default" {
  return user.role === "admin" || user.role === "owner" || user.bootstrapAdmin ? "accent" : "default";
}

function displayName(user: AdminUser): string {
  return user.name || user.username || user.email;
}

/**
 * User administration.
 *
 * Every mutation is a server action; the table only decides what to show. The
 * server re-checks the admin role and refuses self-demotion and self-ban, so a
 * crafted POST cannot do what the UI prevents.
 *
 * Eine Tabelle mit Suche und Rollen-Filter. Rolle aendern und Sperren laufen
 * ueber einen Dialog mit eigenem Formular; "Abmelden" und "Entsperren" aus
 * dem Zeilenmenue schicken dasselbe FormData wie vorher die kleinen Formulare.
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
  const [revokeState, revoke] = useActionState(revokeAction, initial);
  const [banId, setBanId] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useActionFeedback(roleState);
  useActionFeedback(banState);
  useActionFeedback(revokeState);

  /* Beantwortet: Rueckfrage schliessen, die Meldung steht oben. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => setBanId(null), [banState]);
  useEffect(() => setRoleId(null), [roleState]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const state = roleState.message ? roleState : banState.message ? banState : revokeState;
  const banUser = users.find((user) => user.id === banId) ?? null;
  const roleUser = users.find((user) => user.id === roleId) ?? null;

  /** Dasselbe FormData wie ein Formular mit versteckten Feldern. */
  function send(action: (formData: FormData) => void, fields: Record<string, string>) {
    const formData = new FormData();
    for (const [name, value] of Object.entries(fields)) formData.set(name, value);
    startTransition(() => action(formData));
  }

  const filters = [
    { id: "all", label: "Alle", count: users.length },
    ...roles.map((role) => ({
      id: role,
      label: roleLabels[role] ?? role,
      count: users.filter((user) => user.role === role).length,
    })),
    { id: "banned", label: "Gesperrt", count: users.filter((user) => user.banned).length },
  ].filter((entry) => entry.id === "all" || entry.count > 0);

  const needle = fold(query.trim());
  const visible = users.filter((user) => {
    if (filter === "banned" && !user.banned) return false;
    if (filter !== "all" && filter !== "banned" && user.role !== filter) return false;
    return !needle || fold(`${user.name} ${user.email} ${user.username ?? ""}`).includes(needle);
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Erfolg meldet der Toast; ein Fehler bleibt zusaetzlich stehen. */}
      {state.status === "error" && state.message && <FormMessage status="error">{state.message}</FormMessage>}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Icon
            icon={SearchIcon}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, E-Mail oder Username"
            aria-label="Benutzer suchen"
            className="input w-full pl-8"
          />
        </div>

        <div role="group" aria-label="Nach Rolle filtern" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1">
          {filters.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={filter === entry.id}
              onClick={() => setFilter(entry.id)}
              className={filterPillClass(filter === entry.id)}
            >
              {entry.label}
              <PillCount active={filter === entry.id}>{entry.count}</PillCount>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
          Niemand passt dazu.
        </p>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <Th>Person</Th>
              <Th className="hidden w-0 sm:table-cell">Rolle</Th>
              <Th className="hidden w-0 sm:table-cell">Status</Th>
              <Th className="hidden w-0 md:table-cell">Dabei seit</Th>
              <Th className="w-0 text-right">
                <span className="sr-only">Aktionen</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {visible.map((user) => {
              const name = displayName(user);
              return (
                <tr key={user.id} className={trClass}>
                  <Td className="w-full max-w-0">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm" className="size-9 shrink-0">
                        <Avatar.Fallback className={cn("text-xs font-semibold", user.isSelf && "bg-volt text-ink")}>
                          {name.slice(0, 2).toUpperCase()}
                        </Avatar.Fallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-semibold text-foreground">
                          <span className="truncate">{name}</span>
                          {user.isSelf && <span className="shrink-0 text-xs font-medium text-muted">(du)</span>}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {user.email}
                          {user.username && `, @${user.username}`}
                        </p>
                        {/* Am Handy stehen Rolle und Status hier statt in eigenen Spalten. */}
                        <p className="mt-1.5 flex flex-wrap gap-1.5 sm:hidden">
                          <StatusBadge color={roleTone(user)}>{roleLabels[user.role] ?? user.role}</StatusBadge>
                          {user.banned && <StatusBadge color="danger">Gesperrt</StatusBadge>}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td className="hidden sm:table-cell">
                    <StatusBadge color={roleTone(user)}>
                      {roleLabels[user.role] ?? user.role}
                      {user.bootstrapAdmin && user.role !== "admin" && ", fest Admin"}
                    </StatusBadge>
                  </Td>
                  <Td className="hidden sm:table-cell">
                    {user.banned ? (
                      <StatusBadge color="danger" className="max-w-48">
                        <span className="truncate" title={user.banReason ?? undefined}>
                          Gesperrt{user.banReason ? `: ${user.banReason}` : ""}
                        </span>
                      </StatusBadge>
                    ) : (
                      <StatusBadge color="success">Aktiv</StatusBadge>
                    )}
                  </Td>
                  <Td className="hidden font-mono text-xs whitespace-nowrap text-muted md:table-cell">
                    {user.createdAt ? formatDate(user.createdAt, "short") : "—"}
                  </Td>
                  <Td className="text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Rolle von ${name} ändern`}
                        className="max-sm:w-9 max-sm:px-0"
                        onPress={() => setRoleId(user.id)}
                      >
                        <Icon icon={UserIcon} />
                        <span className="max-sm:hidden">Rolle</span>
                      </Button>
                      <Dropdown>
                        <Button variant="ghost" size="sm" isIconOnly aria-label={`Weitere Aktionen für ${name}`}>
                          <Icon icon={MoreIcon} />
                        </Button>
                        <Dropdown.Popover placement="bottom end" className="min-w-56">
                          <Dropdown.Menu
                            aria-label={`Aktionen für ${name}`}
                            onAction={(key) => {
                              if (key === "revoke") send(revoke, { userId: user.id });
                              if (key === "unban") send(toggleBan, { userId: user.id, ban: "0" });
                              if (key === "ban") setBanId(user.id);
                            }}
                          >
                            <Dropdown.Item id="revoke" textValue="Überall abmelden">
                              <Icon icon={LogoutIcon} className="w-4 text-xs text-muted" />
                              <Label>Überall abmelden</Label>
                            </Dropdown.Item>
                            {user.banned ? (
                              <Dropdown.Item id="unban" textValue="Entsperren">
                                <Icon icon={CheckIcon} className="w-4 text-xs text-muted" />
                                <Label>Entsperren</Label>
                              </Dropdown.Item>
                            ) : user.isSelf ? null : (
                              <Dropdown.Item id="ban" textValue="Sperren" variant="danger">
                                <Icon icon={WarningIcon} className="w-4 text-xs text-danger" />
                                <Label>Sperren</Label>
                              </Dropdown.Item>
                            )}
                          </Dropdown.Menu>
                        </Dropdown.Popover>
                      </Dropdown>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      )}

      <ConfirmDialog
        isOpen={roleUser !== null}
        onOpenChange={(open) => !open && !savingRole && setRoleId(null)}
        title="Rolle ändern"
        description={roleUser ? <p className="font-semibold">{displayName(roleUser)}</p> : null}
        action={setRole}
        fields={{ userId: roleUser?.id ?? "" }}
        confirmLabel="Übernehmen"
        pending={savingRole}
        status="accent"
      >
        {roleUser && (
          <>
            <SelectField
              name="role"
              label="Rolle"
              defaultValue={roles.includes(roleUser.role) ? roleUser.role : "user"}
              options={roles.map((role) => ({ value: role, label: roleLabels[role] ?? role }))}
              description="Die Person wird abgemeldet, damit die neue Rolle sofort gilt."
            />
            {roleUser.bootstrapAdmin && (
              <p className="rounded-xl bg-surface-secondary px-3 py-2 text-xs text-muted">
                Admin über ADMIN_USER_IDS — eine andere Rolle hier ändert daran nichts.
              </p>
            )}
          </>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={banUser !== null}
        onOpenChange={(open) => !open && !banning && setBanId(null)}
        title="Wirklich sperren?"
        description={banUser ? <p className="font-semibold">{displayName(banUser)}</p> : null}
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
