import type { Metadata } from "next";
import { requireAdmin, requireCan } from "@/lib/session";
import { serverEnv } from "@/lib/env";
import { site } from "@/lib/site";
import { discordNewsEnabled, discordNewsTarget } from "@/services/discord/news";
import { radioadminConfigured } from "@/services/lautfm/radioadmin";
import { milestones } from "@/db/collections";
import { formatDateTime } from "@/lib/format";
import { AdminPageHeader, AdminPanel, DataList, StatusBadge } from "@/components/admin/admin-ui";
import { getDirectoryFormValues } from "@/services/settings/listings";
import { ListingForm } from "./listing-form";

export const metadata: Metadata = { title: "Einstellungen · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

type Tone = "default" | "accent" | "success" | "warning" | "danger";

interface ServiceRow {
  label: string;
  /** Wofuer der Dienst da ist — ein Halbsatz. */
  purpose: string;
  status: string;
  tone: Tone;
  detail?: string;
}

export default async function AdminSettingsPage() {
  // Ein ausgeblendeter Menuepunkt ist kein Schutz — die Seite prueft selbst.
  await requireCan("settings", ["update"]);

  await requireAdmin();

  /* Read-only view of the effective configuration. Secrets are never rendered —
     only whether they are set. */
  const addresses = [
    { label: "Site-URL", value: site.url },
    { label: "Stream-URL", value: site.streamUrl },
    { label: "laut.fm Station", value: site.station },
    { label: "Discord-Einladung", value: site.discordUrl },
    { label: "Kontakt-E-Mail", value: site.contactEmail },
  ];

  const services: ServiceRow[] = [
    {
      label: "Discord-Login",
      purpose: "Anmelden mit Discord",
      ...(serverEnv.discordEnabled
        ? { status: "aktiv", tone: "success" as const }
        : { status: "nicht konfiguriert", tone: "default" as const }),
    },
    {
      label: "UploadThing",
      purpose: "Bilder hochladen",
      ...(process.env.UPLOADTHING_TOKEN
        ? { status: "konfiguriert", tone: "success" as const }
        : { status: "nicht konfiguriert", tone: "warning" as const }),
    },
    {
      label: "Discord-Bot (Avatare)",
      purpose: "Profilbilder aus Discord",
      ...(process.env.DISCORD_BOT_TOKEN
        ? { status: "konfiguriert", tone: "success" as const }
        : { status: "nicht konfiguriert", tone: "default" as const }),
    },
    { label: "Meilensteine", purpose: "Tageszahlen und Beiträge", ...(await milestoneStatus()) },
    {
      label: "News im Discord",
      purpose: "Neue Artikel ankündigen",
      ...(discordNewsEnabled()
        ? {
            status: "aktiv",
            tone: "success" as const,
            detail: discordNewsTarget() === "webhook" ? "über Webhook" : `Bot, Kanal ${site.discordNewsChannelId}`,
          }
        : { status: "aus", tone: "default" as const, detail: "nur auf voltfm.xyz, mit Webhook oder Bot-Token" }),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Einstellungen"
        description="Aktive Konfiguration. Bis auf die Verzeichnis-Links kommt alles aus Environment-Variablen."
      />

      <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 xl:grid-cols-2">
        <AdminPanel title="Dienste" titleId="settings-services" bodyClassName="p-0">
          <ul className="divide-y divide-separator">
            {services.map((service) => (
              <li key={service.label} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{service.label}</p>
                  <p className="text-xs text-muted">{service.purpose}</p>
                </div>
                <div className="flex min-w-0 flex-col gap-1 sm:items-end sm:text-right">
                  <StatusBadge color={service.tone}>{service.status}</StatusBadge>
                  {service.detail && <p className="text-xs break-words text-muted">{service.detail}</p>}
                </div>
              </li>
            ))}
          </ul>
        </AdminPanel>

        <AdminPanel title="Sender und Adressen" titleId="settings-addresses">
          <DataList
            rows={addresses.map((row) => ({
              label: row.label,
              value: <span className="font-mono text-xs">{row.value}</span>,
            }))}
          />
        </AdminPanel>

        <AdminPanel
          title="Verzeichnisse"
          titleId="settings-listings"
          description="Links zu VoltFM, stehen auf der Radio-Seite. Leer heißt: kein Link. Gespeichert wird hier, ohne neues Deployment."
        >
          <ListingForm values={await getDirectoryFormValues()} />
        </AdminPanel>
      </div>
    </>
  );
}

/** Was der letzte taegliche Lauf gemacht hat (src/services/milestones). */
async function milestoneStatus(): Promise<{ status: string; tone: Tone; detail?: string }> {
  const setup = [
    radioadminConfigured() ? null : "laut.fm-Token fehlt",
    process.env.CRON_SECRET ? null : "CRON_SECRET fehlt",
  ].filter(Boolean);
  const missing = setup.length ? setup.join(", ") : undefined;
  const last = await milestones()
    .findOne({ key: "lauf" })
    .catch(() => null);
  if (!last) {
    return missing
      ? { status: "aus", tone: "default", detail: missing }
      : { status: "eingerichtet", tone: "accent", detail: "noch nicht gelaufen" };
  }

  let run: { ok?: boolean; published?: string[]; error?: string } = {};
  try {
    run = JSON.parse(last.note ?? "{}");
  } catch {
    run = {};
  }
  const result = run.ok
    ? run.published?.length
      ? `neu: ${run.published.join(", ")}`
      : "nichts Neues"
    : run.error
      ? `Fehler: ${run.error}`
      : "";
  const detail = [`zuletzt ${formatDateTime(last.reachedAt)}`, result, missing].filter(Boolean).join(", ");
  return {
    status: run.ok ? "läuft" : run.error ? "Fehler" : "gelaufen",
    tone: run.ok ? (missing ? "warning" : "success") : run.error ? "danger" : "default",
    detail,
  };
}
