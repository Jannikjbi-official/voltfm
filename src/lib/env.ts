/**
 * Server-side environment access.
 *
 * Reads are lazy on purpose: `next build` must not fail on a machine that has
 * no database configured, but anything that actually touches Mongo or Better
 * Auth at request time should fail loudly rather than silently misbehave.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Environment variable ${name} is missing. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export const serverEnv = {
  get mongodbUri() {
    return required("MONGODB_URI");
  },
  get mongodbDb() {
    return process.env.MONGODB_DB ?? "voltfm";
  },
  get authSecret() {
    return required("BETTER_AUTH_SECRET");
  },
  get authUrl() {
    return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  },
  get discordClientId() {
    return process.env.DISCORD_CLIENT_ID ?? "";
  },
  get discordClientSecret() {
    return process.env.DISCORD_CLIENT_SECRET ?? "";
  },
  /** Discord login is only advertised in the UI when it is actually wired up. */
  get discordEnabled() {
    return Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
  },
} as const;

export const isProduction = process.env.NODE_ENV === "production";
