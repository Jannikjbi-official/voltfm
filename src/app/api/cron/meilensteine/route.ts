import { runMilestones } from "@/services/milestones";
import { isPreviewDeploy } from "@/lib/deploy";

/**
 * Der taegliche Lauf fuer die Meilenstein-Beitraege (Zeitplan in vercel.json).
 *
 * Vercel ruft die Adresse nur fuer Production auf und schickt dabei
 * "Authorization: Bearer <CRON_SECRET>" mit. Ohne das Geheimnis passiert
 * nichts — und auf Vorschauen nie, denn die teilen sich die Datenbank mit
 * voltfm.xyz und wuerden sonst dort Beitraege anlegen.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

  const run = await runMilestones();
  return Response.json(run, { status: run.ok ? 200 : 500 });
}
