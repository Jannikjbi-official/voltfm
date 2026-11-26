import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin, username } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { dash } from "@better-auth/infra";
import { nextCookies } from "better-auth/next-js";
import { getDb, getMongoClient } from "@/db/client";
import { serverEnv, isProduction } from "@/lib/env";
import { site } from "@/lib/site";
import { ac, roles, ADMIN_ROLES, OWNER_USER_IDS, OWNER_DISCORD_IDS } from "@/lib/permissions";
import { ObjectId } from "mongodb";

/**
 * The single source of truth for identity in VoltFM.
 *
 * Better Auth owns accounts, sessions, credentials, OAuth links and passkeys.
 * VoltFM-specific profile data is added through `user.additionalFields` rather
 * than a second parallel users collection, so there is exactly one user record.
 */

const db = getDb();
const client = getMongoClient();

export const auth = betterAuth({
  appName: site.name,
  secret: serverEnv.authSecret,
  baseURL: serverEnv.authUrl,
  /* Eigener Server: MongoDB laeuft als Einzelinstanz ohne Replica Set und kann
     keine Transaktionen (Atlas auf Vercel konnte das). Ohne diesen Schalter
     scheitert jede Registrierung, auch per Discord. */
  database: mongodbAdapter(db, { client, transaction: false }),

  /* Inhaber per Discord: Die Benutzer-IDs in OWNER_ACCOUNTS stammen aus der
     alten Atlas-Datenbank. Auf dem eigenen Server entstehen neue IDs, deshalb
     bekommt ein Discord-Konto aus OWNER_DISCORD_IDS beim Verknuepfen die Rolle
     "owner" — beim ersten Discord-Login genauso wie beim spaeteren Verbinden. */
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          if (account.providerId !== "discord" || !OWNER_DISCORD_IDS.includes(account.accountId)) return;
          const id = String(account.userId);
          await db
            .collection("user")
            .updateOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : (id as never) }, { $set: { role: "owner" } });
        },
      },
    },
  },

  // Required by the username plugin: username sign-in resolves to a credential
  // account, so the email/password provider has to be enabled underneath it.
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    autoSignIn: true,
  },

  socialProviders: serverEnv.discordEnabled
    ? {
        discord: {
          clientId: serverEnv.discordClientId,
          clientSecret: serverEnv.discordClientSecret,
        },
      }
    : {},

  // Discord and credential sign-ups that share an email resolve to one account
  // instead of creating a duplicate user.
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["discord"],
      /**
       * Hardly anyone uses the same address on Discord as on VoltFM, and
       * without this Better Auth aborts the link with
       * `?error=email_does_not_match`. It only affects the *explicit* link flow
       * from /konto, where the user is already signed in and is deliberately
       * connecting their own Discord account. Automatic linking at sign-in
       * still requires a matching, verified email.
       */
      allowDifferentEmails: true,
    },
  },

  user: {
    additionalFields: {
      displayName: { type: "string", required: false, input: true },
      bio: { type: "string", required: false, input: true },
      // Never accept these from the client — they are set server-side only.
      isHost: { type: "boolean", required: false, defaultValue: false, input: false },
      hostSlug: { type: "string", required: false, input: false },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  advanced: {
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
    },
  },

  // Origin checking: only VoltFM's own origins may drive auth requests.
  trustedOrigins: [serverEnv.authUrl, site.url].filter(Boolean),

  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      // Credential endpoints get a much tighter budget than reads.
      "/sign-in/username": { window: 60, max: 8 },
      "/sign-in/email": { window: 60, max: 8 },
      "/sign-up/email": { window: 60 * 10, max: 5 },
      "/passkey/verify-authentication": { window: 60, max: 12 },
    },
  },

  plugins: [
    // 3. Admin — roles, permissions, user management, admin protection.
    admin({
      ac,
      roles,
      defaultRole: "user",
      adminRoles: [...ADMIN_ROLES],
      // Bootstraps the first admin before any admin UI exists to grant roles.
      /* Dieselbe Liste wie in lib/session.ts: sonst akzeptierte Better Auth
         die Person an den eigenen Endpunkten, waehrend /admin sie abweist. */
      adminUserIds: [
        ...OWNER_USER_IDS,
        ...(process.env.ADMIN_USER_IDS ?? "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
      ],
    }),

    // 4. Username — unique handles used for profiles and username sign-in.
    username({
      minUsernameLength: 3,
      maxUsernameLength: 24,
      usernameValidator: (value) => /^[a-z0-9_]+$/.test(value.toLowerCase()),
    }),

    // 5. Discord OAuth is configured above via socialProviders.
    // 6. Passkey — WebAuthn, passwordless, multiple credentials per user.
    passkey({
      rpID: new URL(serverEnv.authUrl).hostname,
      rpName: site.name,
      origin: serverEnv.authUrl,
    }),

    /* Better Auth Dash — Dashboard und Analytics.
       Liest den Schlüssel aus BETTER_AUTH_API_KEY. Das Dashboard verifiziert
       darüber die Eigentümerschaft an dieser Instanz, deshalb muss der
       Schlüssel auch in der Deployment-Umgebung gesetzt sein, nicht nur lokal. */
    dash(),

    // Must stay last: lets server actions set auth cookies.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];
