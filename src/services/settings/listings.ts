import "server-only";
import { settings } from "@/db/collections";
import { parseListenOnlineRadioUrl } from "@/lib/listings";

/**
 * Der eingetragene Link zu VoltFM bei ListenOnlineRadio, oder null.
 *
 * Faellt die Datenbank aus, fehlt nur der Link — die Seite laedt trotzdem.
 * Gespeichert wird bereits geprueft; die zweite Pruefung hier faengt Werte ab,
 * die von Hand in die Datenbank geraten sind.
 */
export async function getListenOnlineRadioUrl(): Promise<string | null> {
  try {
    const doc = await settings().findOne({ key: "site" }, { projection: { listenOnlineRadioUrl: 1 } });
    return doc?.listenOnlineRadioUrl ? parseListenOnlineRadioUrl(doc.listenOnlineRadioUrl) : null;
  } catch (error) {
    console.error("[settings] ListenOnlineRadio-Link nicht lesbar", error);
    return null;
  }
}
