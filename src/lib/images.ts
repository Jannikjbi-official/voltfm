import "server-only";

import { randomBytes } from "node:crypto";

import { media } from "@/db/collections";

/**
 * Zuordnung zwischen öffentlicher Kennung und Speicher-Schlüssel.
 *
 * Bilder liegen bei UploadThing, ausgeliefert werden sie aber unter der eigenen
 * Domain als `/api/bilder/<kennung>`. Zwei Gründe:
 *
 * 1. Der Browser der Besucher verbindet sich nicht mehr mit einem Dritten.
 *    Externe Ressourcen bräuchten sonst eine Einwilligung (Leitfaden 2.3) —
 *    für Bilder im Artikel wäre das absurd.
 * 2. Der Anbieter ist austauschbar, ohne dass eine einzige gespeicherte
 *    Adresse falsch wird.
 *
 * In der Adresse steht nur eine selbst erzeugte Zufallskennung. Wo die Datei
 * tatsächlich liegt, verlässt den Server nicht.
 */

/** 24 Zeichen aus dem URL-sicheren Alphabet — genug gegen Erraten. */
function newPublicId(): string {
  return randomBytes(18).toString("base64url");
}

const PUBLIC_ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

/** Legt die Zuordnung an und gibt die öffentliche Adresse zurück. */
export async function registerImage(
  key: string,
  mimeType: string,
  uploadedBy: string,
): Promise<string> {
  const publicId = newPublicId();

  await media().insertOne({
    publicId,
    storageKey: key,
    url: `/api/bilder/${publicId}`,
    alt: "",
    mimeType,
    uploadedBy,
    createdAt: new Date(),
  });

  return `/api/bilder/${publicId}`;
}

/** Löst eine öffentliche Kennung in den Speicher-Schlüssel auf. */
export async function resolveImageKey(publicId: string): Promise<string | null> {
  if (!PUBLIC_ID_PATTERN.test(publicId)) return null;

  const asset = await media().findOne({ publicId }, { projection: { storageKey: 1 } });
  return asset?.storageKey ?? null;
}
