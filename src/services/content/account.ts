import "server-only";
import { getCurrentUser, isAdminUser } from "@/lib/session";
import { listHosts } from "./index";
import { resolveHostImage } from "@/services/discord/avatar";

export interface AccountAvatar {
  image: string | null;
  /** Gesetzt, wenn zu diesem Konto ein oeffentliches Moderatorenprofil gehoert. */
  hostSlug: string | null;
  /** Darf diese Person ins Admin? */
  isAdmin: boolean;
}

/**
 * Bild und oeffentliches Profil des angemeldeten Kontos.
 *
 * Better Auth fuellt `user.image` nur, wenn die Anmeldung ueber einen Anbieter
 * lief, der eines mitliefert. Bei Benutzername und Passwort bleibt es leer —
 * das Bild liegt dann am Moderatorenprofil, zusammen mit der Discord-ID.
 *
 * Laeuft auf dem Server, weil das Kontomenue im Browser nichts nachschlagen
 * kann. Ohne Anmeldung kostet es nichts: Die Profilliste wird dann gar nicht
 * erst geholt.
 */
export async function getAccountAvatar(): Promise<AccountAvatar> {
  const user = await getCurrentUser();
  if (!user) return { image: null, hostSlug: null, isAdmin: false };

  const named = user.name || (user as { username?: string }).username || "";
  const host = named ? (await listHosts(true)).find((h) => h.name === named) : undefined;

  return {
    image: user.image ?? (host ? await resolveHostImage(host) : null),
    // Nur verlinken, wenn das Profil auch oeffentlich sichtbar ist.
    hostSlug: host?.active ? host.slug : null,
    /* Muss der Server beantworten: Fest hinterlegte Betreiber tragen in der
       Datenbank oft die Rolle "user", und der Browser sieht nur die. Deshalb
       fehlte der Admin-Link ausgerechnet denen, die ihn am noetigsten haben. */
    isAdmin: isAdminUser(user),
  };
}
