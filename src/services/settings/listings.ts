import "server-only";
import { settings } from "@/db/collections";
import { directories, parseDirectoryUrl, type DirectoryId } from "@/lib/listings";

export interface DirectoryLink {
  id: DirectoryId;
  name: string;
  url: string;
}

/** Was im Admin gespeichert ist. Faellt die Datenbank aus: nichts. */
async function storedListings(): Promise<Partial<Record<DirectoryId, string>> | null> {
  try {
    const doc = await settings().findOne({ key: "site" }, { projection: { listings: 1 } });
    return doc?.listings ?? {};
  } catch (error) {
    console.error("[settings] Verzeichnis-Links nicht lesbar", error);
    return null;
  }
}

/** Gespeicherter Wert, sonst der bekannte Eintrag. "" heisst: bewusst leer. */
function effective(stored: Partial<Record<DirectoryId, string>>, id: DirectoryId, fallback?: string): string {
  return stored[id] ?? fallback ?? "";
}

/**
 * Die Links fuer die oeffentliche Seite, in fester Reihenfolge. Ist die
 * Datenbank nicht erreichbar, gelten die bekannten Eintraege — die Seite
 * laedt trotzdem. Jeder Wert wird beim Lesen noch einmal geprueft, falls
 * etwas von Hand in die Datenbank geraten ist.
 */
export async function getDirectoryLinks(): Promise<DirectoryLink[]> {
  const stored = (await storedListings()) ?? {};
  return directories.flatMap((directory) => {
    const raw = effective(stored, directory.id, directory.defaultUrl);
    const url = raw ? parseDirectoryUrl(directory, raw) : null;
    return url ? [{ id: directory.id, name: directory.name, url }] : [];
  });
}

/** Die Werte fuer das Formular im Admin. */
export async function getDirectoryFormValues(): Promise<{ id: DirectoryId; value: string }[]> {
  const stored = (await storedListings()) ?? {};
  return directories.map((directory) => ({
    id: directory.id,
    value: effective(stored, directory.id, directory.defaultUrl),
  }));
}
