/**
 * Roles the user admin may hand out. Kept out of `actions.ts`, because a
 * "use server" module may only export async functions.
 */
export const ASSIGNABLE_ROLES = ["user", "editor", "admin", "owner"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export const ROLE_LABELS: Record<string, string> = {
  user: "Hörer",
  editor: "Redaktion",
  admin: "Admin",
  owner: "Inhaber",
};
