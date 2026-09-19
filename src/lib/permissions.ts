import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc, userAc } from "better-auth/plugins/admin/access";

/**
 * VoltFM permission model.
 *
 * Better Auth's admin plugin ships statements for users and sessions; VoltFM
 * adds the editorial resources on top, so authorization can be checked per
 * action ("may this user delete an article?") rather than as a single
 * is-admin boolean.
 */
export const statement = {
  ...defaultStatements,
  article: ["create", "update", "delete", "publish"],
  category: ["create", "update", "delete"],
  event: ["create", "update", "delete"],
  host: ["create", "update", "delete"],
  show: ["create", "update", "delete"],
  media: ["upload", "delete"],
  timeline: ["create", "update", "delete"],
  settings: ["read", "update"],
} as const;

export const ac = createAccessControl(statement);

/** Registered listener: no admin capabilities at all. */
export const user = ac.newRole({
  ...userAc.statements,
});

/**
 * Editor: runs the newsroom, but cannot touch users, settings or the roster.
 * Not granted through the UI yet — defined here so the model is complete and
 * granting it later is a data change, not a code change.
 */
export const editor = ac.newRole({
  article: ["create", "update", "delete", "publish"],
  category: ["create", "update", "delete"],
  event: ["create", "update", "delete"],
  media: ["upload", "delete"],
  timeline: ["create", "update", "delete"],
});

/** Admin: everything editorial, plus user management. */
export const admin = ac.newRole({
  ...adminAc.statements,
  article: ["create", "update", "delete", "publish"],
  category: ["create", "update", "delete"],
  event: ["create", "update", "delete"],
  host: ["create", "update", "delete"],
  show: ["create", "update", "delete"],
  media: ["upload", "delete"],
  timeline: ["create", "update", "delete"],
  settings: ["read", "update"],
});

/** Owner: identical to admin today, but held separately so station ownership
 *  can diverge later (billing, destructive settings) without a migration. */
export const owner = ac.newRole({
  ...adminAc.statements,
  article: ["create", "update", "delete", "publish"],
  category: ["create", "update", "delete"],
  event: ["create", "update", "delete"],
  host: ["create", "update", "delete"],
  show: ["create", "update", "delete"],
  media: ["upload", "delete"],
  timeline: ["create", "update", "delete"],
  settings: ["read", "update"],
});

export const roles = { user, editor, admin, owner };

/** Roles that may reach /admin at all. */
export const ADMIN_ROLES = ["admin", "owner", "editor"] as const;

/**
 * Fest hinterlegte Betreiber.
 *
 * Diese Konten sind immer Inhaber, unabhaengig davon, was in der Datenbank
 * steht. Das ist der Notausgang: Wer sich versehentlich selbst die Rechte
 * entzieht oder eine kaputte Rollenzuweisung hat, kommt darueber wieder rein.
 *
 * Bewusst im Code und nicht in einer Umgebungsvariablen — eine Variable kann
 * in einer Umgebung fehlen, und dann stuende niemand mehr an der Tuer.
 * ADMIN_USER_IDS wird zusaetzlich weiter beruecksichtigt.
 */
export const OWNER_ACCOUNTS = [
  {
    label: "jannikjbi",
    /** Better-Auth-Benutzerkennung. */
    userId: "6aaef88102f08be2fb69d583",
    discordUserId: "810459620035657769",
  },
  {
    label: "mochikotv",
    userId: "6aaef88102f08be2fb69d583",
    discordUserId: "513032712240627733",
  },
] as const;

/** Alle fest hinterlegten Kennungen, aus denen sich Inhaberrechte ableiten. */
export const OWNER_USER_IDS: readonly string[] = [
  ...new Set(OWNER_ACCOUNTS.map((account) => account.userId)),
];

export const OWNER_DISCORD_IDS: readonly string[] = [
  ...new Set(OWNER_ACCOUNTS.map((account) => account.discordUserId)),
];
