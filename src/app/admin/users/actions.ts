"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { assertAdmin, AuthorizationError } from "@/lib/session";
import { ADMIN_ROLES } from "@/lib/permissions";
import type { EntityFormState } from "@/components/admin/entity-types";
import { ASSIGNABLE_ROLES, ROLE_LABELS, type AssignableRole } from "./roles";

async function guard(): Promise<{ id: string } | EntityFormState> {
  try {
    return await assertAdmin();
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    throw error;
  }
}

function isState(value: unknown): value is EntityFormState {
  return typeof value === "object" && value !== null && "status" in value;
}

export async function setUserRole(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const me = await guard();
  if (isState(me)) return me;

  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!userId) return { status: "error", message: "Unbekannter Benutzer." };
  if (!ASSIGNABLE_ROLES.includes(role as AssignableRole)) {
    return { status: "error", message: "Unbekannte Rolle." };
  }

  /* Demoting yourself would lock you out of this very page, and the only way
     back would be ADMIN_USER_IDS in the environment. */
  if (userId === me.id && !ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
    return { status: "error", message: "Die eigene Admin-Rolle kann hier nicht entzogen werden." };
  }

  try {
    await auth.api.setRole({
      headers: await headers(),
      body: { userId, role: role as AssignableRole },
    });
  } catch (error) {
    console.error("[admin] setRole failed", error);
    return { status: "error", message: "Rolle konnte nicht geändert werden." };
  }

  /*
   * Die neue Rolle allein reicht nicht.
   *
   * Better Auth liefert die Sitzung samt `role` bis zu fuenf Minuten lang aus
   * einem signierten Cookie aus (session.cookieCache), ohne die Datenbank zu
   * fragen. Wer gerade angemeldet ist, behaelt in dieser Zeit seine alte Rolle
   * und kaeme trotz Beförderung nicht ins Admin — genau der Fehler, der sich
   * wie "hat nicht wirklich Admin" anfuehlt.
   *
   * Deshalb werden die Sitzungen beendet: Nach dem naechsten Anmelden gilt die
   * neue Rolle sofort. Das ist bei einer Rechteaenderung ohnehin das richtige
   * Verhalten — auch beim Entzug soll eine offene Sitzung nicht weiterlaufen.
   */
  let sessionsEnded = false;
  if (userId !== me.id) {
    try {
      await auth.api.revokeUserSessions({ headers: await headers(), body: { userId } });
      sessionsEnded = true;
    } catch (error) {
      console.error("[admin] revokeUserSessions after setRole failed", error);
    }
  }

  revalidatePath("/admin/users");
  return {
    status: "success",
    message: sessionsEnded
      ? `Rolle auf „${ROLE_LABELS[role] ?? role}" gesetzt. Die Person muss sich einmal neu anmelden, dann greift sie.`
      : `Rolle auf „${ROLE_LABELS[role] ?? role}" gesetzt. Für dich selbst greift sie nach dem nächsten Anmelden.`,
  };
}

export async function setUserBanned(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const me = await guard();
  if (isState(me)) return me;

  const userId = String(formData.get("userId") ?? "").trim();
  const ban = formData.get("ban") === "1";

  if (!userId) return { status: "error", message: "Unbekannter Benutzer." };
  if (userId === me.id) return { status: "error", message: "Man kann sich nicht selbst sperren." };

  try {
    if (ban) {
      const reason = String(formData.get("reason") ?? "").trim().slice(0, 200);
      await auth.api.banUser({
        headers: await headers(),
        body: { userId, banReason: reason || "Verstoß gegen die Community-Regeln" },
      });
    } else {
      await auth.api.unbanUser({ headers: await headers(), body: { userId } });
    }
  } catch (error) {
    console.error("[admin] ban toggle failed", error);
    return { status: "error", message: "Sperre konnte nicht geändert werden." };
  }

  revalidatePath("/admin/users");
  return { status: "success", message: ban ? "Benutzer gesperrt." : "Sperre aufgehoben." };
}

/** Forces a re-login everywhere — used after a role change or a suspicion. */
export async function revokeUserSessions(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const me = await guard();
  if (isState(me)) return me;

  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) return { status: "error", message: "Unbekannter Benutzer." };

  try {
    await auth.api.revokeUserSessions({ headers: await headers(), body: { userId } });
  } catch (error) {
    console.error("[admin] revokeUserSessions failed", error);
    return { status: "error", message: "Sitzungen konnten nicht beendet werden." };
  }

  revalidatePath("/admin/users");
  return { status: "success", message: "Alle Sitzungen beendet." };
}
