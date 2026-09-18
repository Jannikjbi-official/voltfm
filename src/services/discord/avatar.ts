import "server-only";

/**
 * Discord avatars.
 *
 * Two independent sources, in order of preference:
 *
 *  1. The avatar Better Auth already stored when a user signed in with Discord.
 *     Free, always current, no extra request.
 *  2. The Discord API, looked up by user ID. This needs a bot token — Discord
 *     does not expose arbitrary users anonymously — so it is optional and the
 *     site works without it.
 *
 * Everything degrades to null, and the UI falls back to initials.
 */

const DISCORD_API = "https://discord.com/api/v10";
const CDN = "https://cdn.discordapp.com";

interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  global_name: string | null;
}

/**
 * Builds the CDN URL for an avatar hash. Hashes starting with `a_` are
 * animated and are only served as .gif.
 */
export function buildAvatarUrl(userId: string, hash: string, size = 256): string {
  const extension = hash.startsWith("a_") ? "gif" : "png";
  return `${CDN}/avatars/${userId}/${hash}.${extension}?size=${size}`;
}

/** The default avatar Discord serves for users with no custom one. */
export function defaultAvatarUrl(userId: string): string {
  // Discord's formula for the new username system: (id >> 22) % 6.
  // Snowflakes exceed Number.MAX_SAFE_INTEGER, so shift via BigInt built from
  // a string (BigInt literals need an ES2020 target, which this project is not).
  const index = Number((BigInt(userId) / BigInt(4194304)) % BigInt(6));
  return `${CDN}/embed/avatars/${index}.png`;
}

export async function fetchDiscordAvatar(
  userId: string,
  size = 256,
): Promise<string | null> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token || !/^\d{5,25}$/.test(userId)) return null;

  try {
    const res = await fetch(`${DISCORD_API}/users/${userId}`, {
      headers: { Authorization: `Bot ${token}` },
      // Avatars change rarely; a day of caching keeps us well inside the
      // Discord rate limit.
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;

    const user = (await res.json()) as DiscordUser;
    return user.avatar ? buildAvatarUrl(user.id, user.avatar, size) : defaultAvatarUrl(user.id);
  } catch {
    return null;
  }
}

/**
 * Resolves the image to show for a host: an explicitly uploaded picture wins,
 * then Discord, then nothing (the UI renders initials).
 */
export async function resolveHostImage(host: {
  image?: string | null;
  discordUserId?: string | null;
}): Promise<string | null> {
  if (host.image) return host.image;
  if (host.discordUserId) return fetchDiscordAvatar(host.discordUserId, 512);
  return null;
}
