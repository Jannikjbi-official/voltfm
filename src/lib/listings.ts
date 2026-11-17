/**
 * Verzeichnisse, in denen VoltFM gelistet ist.
 *
 * Der Link selbst steht nicht im Code, sondern wird unter Admin →
 * Einstellungen eingetragen (Collection `settings`, Feld
 * `listenOnlineRadioUrl`). Solange dort nichts steht, zeigt die Seite keinen
 * Link — so geht nichts online, bevor der Eintrag freigegeben ist.
 *
 * Es bleibt ein reiner Link: kein Embed-Player, kein Abzeichen-Bild von
 * deren Server. Ein Player dort spielt den laut.fm-Stream (§ 6 Abs. 9 der
 * laut.fm-Nutzungsbedingungen), ein fremdes Bild wuerde den Browser ohne
 * Einwilligung mit dem Verzeichnis verbinden.
 */
export const listenOnlineRadio = {
  name: "ListenOnlineRadio",
  hosts: ["listenonlineradio.com", "www.listenonlineradio.com"],
} as const;

/**
 * Prueft eine eingetragene Adresse. Erlaubt ist nur https auf
 * listenonlineradio.com — so landet kein Tippfehler und keine fremde Seite
 * als Link auf voltfm.xyz. Gibt die bereinigte Adresse zurueck oder null.
 */
export function parseListenOnlineRadioUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (!(listenOnlineRadio.hosts as readonly string[]).includes(url.hostname.toLowerCase())) return null;
  if (url.username || url.password) return null;
  return url.toString();
}
