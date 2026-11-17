/**
 * Radio-Verzeichnisse, in denen VoltFM zu finden ist.
 *
 * Die Links lassen sich unter Admin → Einstellungen aendern (Collection
 * `settings`, Feld `listings`). Was dort nie gespeichert wurde, kommt aus
 * `defaultUrl` — so stehen die bekannten Eintraege sofort auf der Seite. Ein
 * leer gespeichertes Feld heisst: kein Link.
 *
 * Es bleiben reine Links: kein Embed-Player, kein Abzeichen-Bild von deren
 * Servern. Ein Player dort spielt den laut.fm-Stream (§ 6 Abs. 9 der
 * laut.fm-Nutzungsbedingungen), ein fremdes Bild wuerde den Browser ohne
 * Einwilligung mit dem Verzeichnis verbinden.
 */

export type DirectoryId = "tunein" | "onlineRadioBox" | "streema" | "radioBrowser" | "listenOnlineRadio";

export interface Directory {
  id: DirectoryId;
  name: string;
  /** Nur Adressen auf diesen Hosts werden angenommen. */
  hosts: readonly string[];
  /** Bekannter Eintrag (Stand 17.11.2026), solange im Admin nichts gespeichert ist. */
  defaultUrl?: string;
  /** Hinweis unter dem Feld im Admin. */
  hint?: string;
}

export const directories: readonly Directory[] = [
  {
    id: "tunein",
    name: "TuneIn",
    hosts: ["tunein.com", "www.tunein.com"],
    defaultUrl: "https://tunein.com/radio/Jannikjbi-s318289/",
  },
  {
    id: "onlineRadioBox",
    name: "Online Radio Box",
    hosts: ["onlineradiobox.com", "www.onlineradiobox.com"],
    defaultUrl: "https://onlineradiobox.com/de/jannikjbi/",
  },
  {
    id: "streema",
    name: "Streema",
    hosts: ["streema.com", "www.streema.com"],
    defaultUrl: "https://streema.com/radios/Jannikjbi",
  },
  {
    id: "radioBrowser",
    name: "radio-browser.info",
    hosts: ["www.radio-browser.info", "radio-browser.info"],
    defaultUrl: "https://www.radio-browser.info/history/e2c94cd0-c98a-4bc4-bf99-e829a1566b62",
  },
  {
    id: "listenOnlineRadio",
    name: "ListenOnlineRadio",
    hosts: ["listenonlineradio.com", "www.listenonlineradio.com"],
    hint: "Erst eintragen, wenn der Eintrag dort freigegeben ist.",
  },
];

/**
 * Prueft eine eingetragene Adresse: nur https und nur auf den Hosts des
 * Verzeichnisses — so landet kein Tippfehler und keine fremde Seite als Link
 * auf voltfm.xyz. Gibt die bereinigte Adresse zurueck oder null.
 */
export function parseDirectoryUrl(directory: Directory, raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (!directory.hosts.includes(url.hostname.toLowerCase())) return null;
  if (url.username || url.password) return null;
  return url.toString();
}
