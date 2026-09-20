import { UTApi } from "uploadthing/server";

import { resolveImageKey } from "@/lib/images";

/**
 * Liefert ein hochgeladenes Bild unter der eigenen Domain aus.
 *
 * In der Adresse steht nur eine selbst erzeugte Zufallskennung. Der Schlüssel
 * beim Speicheranbieter wird serverseitig nachgeschlagen und verlässt den
 * Server nie — weder im HTML noch in den Netzwerkanfragen des Besuchers taucht
 * auf, wo die Datei tatsächlich liegt.
 */

// Eine Stunde im Browser, ein Tag im CDN. Unter einer Kennung ändert sich das
// Bild nie — ein neuer Upload bekommt eine neue.
const CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, immutable";

let api: UTApi | null = null;

function utapi(): UTApi {
  api ??= new UTApi();
  return api;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kennung: string }> },
) {
  const { kennung } = await params;

  if (!process.env.UPLOADTHING_TOKEN) {
    return new Response("Bild-Ablage ist nicht eingerichtet.", { status: 503 });
  }

  try {
    const storageKey = await resolveImageKey(kennung);
    if (!storageKey) return new Response("Bild nicht gefunden.", { status: 404 });

    const signed = await utapi().getSignedURL(storageKey, { expiresIn: 60 });
    const upstream = await fetch(signed.ufsUrl);

    if (!upstream.ok || !upstream.body) {
      return new Response("Bild nicht gefunden.", { status: 404 });
    }

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";

    // Nur Bilder durchreichen — sonst wäre die Route ein offener Proxy für
    // beliebige Dateitypen.
    if (!contentType.startsWith("image/")) {
      return new Response("Kein Bild.", { status: 415 });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": CACHE_CONTROL,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(`[bilder] ${kennung} konnte nicht geladen werden:`, error);
    return new Response("Bild nicht verfügbar.", { status: 404 });
  }
}
