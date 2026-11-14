import type { Metadata } from "next";
import { requireAdmin, requireCan } from "@/lib/session";
import { serverEnv } from "@/lib/env";
import { site } from "@/lib/site";
import { discordNewsEnabled } from "@/services/discord/news";
import { radioadminConfigured } from "@/services/lautfm/radioadmin";
import { milestones } from "@/db/collections";
import { formatDateTime } from "@/lib/format";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Einstellungen · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // Ein ausgeblendeter Menuepunkt ist kein Schutz — die Seite prueft selbst.
  await requireCan("settings", ["update"]);

  await requireAdmin();

  /* Read-only view of the effective configuration. Secrets are never rendered —
     only whether they are set. */
  const rows: { label: string; value: string }[] = [
    { label: "Site-URL", value: site.url },
    { label: "Stream-URL", value: site.streamUrl },
    { label: "laut.fm Station", value: site.station },
    { label: "Discord-Einladung", value: site.discordUrl },
    { label: "Kontakt-E-Mail", value: site.contactEmail },
    { label: "Discord-Login", value: serverEnv.discordEnabled ? "aktiv" : "nicht konfiguriert" },
    {
      label: "UploadThing",
      value: process.env.UPLOADTHING_TOKEN ? "konfiguriert" : "nicht konfiguriert",
    },
    {
      label: "Discord-Bot (Avatare)",
      value: process.env.DISCORD_BOT_TOKEN ? "konfiguriert" : "nicht konfiguriert",
    },
    {
      label: "Meilensteine",
      value: await milestoneStatus(),
    },
    {
      label: "News im Discord",
      value: discordNewsEnabled()
        ? `aktiv, Kanal ${site.discordNewsChannelId}`
        : "aus (nur auf voltfm.xyz mit Bot-Token)",
    },
  ];

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Einstellungen</h1>
          <p className={styles.subtitle}>
            Aktive Konfiguration. Änderungen erfolgen über Environment-Variablen.
          </p>
        </div>
      </header>

      <section className={styles.panel}>
        <dl className={styles.onAir}>
          {rows.map((row) => (
            <div key={row.label} className={styles.onAirRow}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

/** Was der letzte taegliche Lauf gemacht hat (src/services/milestones). */
async function milestoneStatus(): Promise<string> {
  const setup = [
    radioadminConfigured() ? null : "laut.fm-Token fehlt",
    process.env.CRON_SECRET ? null : "CRON_SECRET fehlt",
  ].filter(Boolean);
  const last = await milestones()
    .findOne({ key: "lauf" })
    .catch(() => null);
  if (!last) return setup.length ? `aus (${setup.join(", ")})` : "eingerichtet, noch nicht gelaufen";

  let summary = "";
  try {
    const run = JSON.parse(last.note ?? "{}") as { ok?: boolean; published?: string[]; error?: string };
    summary = run.ok
      ? run.published?.length
        ? `, neu: ${run.published.join(", ")}`
        : ", nichts Neues"
      : `, Fehler: ${run.error}`;
  } catch {
    summary = "";
  }
  return `zuletzt ${formatDateTime(last.reachedAt)}${summary}${setup.length ? ` (${setup.join(", ")})` : ""}`;
}
