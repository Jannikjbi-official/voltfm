import { recordRecentPlays } from "@/services/plays";
import { isPreviewDeploy } from "@/lib/deploy";

/**
 * Traegt ein, was zuletzt auf VoltFM lief (laut.fm `last_songs`), fuer
 * /charts und /gespielt. laut.fm gibt nur zehn Songs heraus, deshalb muss das
 * regelmaessig laufen: auf dem Server alle 15 Minuten, mit
 * "Authorization: Bearer <CRON_SECRET>".
 *
 * Wie bei den Meilensteinen nur auf voltfm.xyz: Testseiten teilen sich die
 * Datenbank, eintragen soll nur eine Stelle.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  if (isPreviewDeploy()) {
    return new Response("Läuft nur auf voltfm.xyz.", { status: 403 });
  }
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response("Nicht eingerichtet: CRON_SECRET fehlt.", { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Nicht erlaubt.", { status: 401 });
  }

  const run = await recordRecentPlays();
  return Response.json(run, { status: run.ok ? 200 : 502 });
}
