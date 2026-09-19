/**
 * Roles the user admin may hand out. Kept out of `actions.ts`, because a
 * "use server" module may only export async functions.
 */
export const ASSIGNABLE_ROLES = ["user", "editor", "admin", "owner"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

/* Die Bezeichnungen stehen bei den Rollen selbst — zwei Listen waeren
   frueher oder spaeter verschieden. */
export { ROLE_LABELS } from "@/lib/permissions";
