import type { Metadata } from "next";
import { requireCan } from "@/lib/session";
import { getRadioSnapshot } from "@/services/radio";
import { getStationInfo, getLastSongs } from "@/services/radio/metadata";
import { formatTime } from "@/lib/format";
import { site } from "@/lib/site";
import { AdminPageHeader, AdminPanel, DataList, StatusBadge } from "@/components/admin/admin-ui";

export const metadata: Metadata = { title: "Radio · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminRadioPage() {
  // Ein ausgeblendeter Menuepunkt ist kein Schutz — die Seite prueft selbst.
  await requireCan("settings", ["read"]);

  const [snapshot, station, history] = await Promise.all([
    getRadioSnapshot(),
    getStationInfo(),
    getLastSongs(15),
  ]);

  return (
    <>
      <AdminPageHeader title="Radio" description="Livedaten aus dem Sendesystem." />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <AdminPanel title="Status" titleId="radio-status" className="xl:self-start">
          <DataList
            rows={[
              { label: "Stream-URL", value: site.streamUrl },
              {
                label: "Aktueller Titel",
                value: snapshot.nowPlaying
                  ? `${snapshot.nowPlaying.artist} — ${snapshot.nowPlaying.title}`
                  : "Keine Metadaten",
              },
              { label: "Hörer", value: snapshot.listeners ?? "—" },
              { label: "Sendung", value: snapshot.currentShow?.name ?? "—" },
              { label: "Genres", value: station?.genres.join(", ") || "—" },
              {
                label: "Metadaten",
                value: (
                  <StatusBadge color={snapshot.degraded ? "warning" : "success"}>
                    {snapshot.degraded ? "Gestört" : "Erreichbar"}
                  </StatusBadge>
                ),
              },
            ]}
          />
        </AdminPanel>

        <AdminPanel title="Zuletzt gespielt" titleId="radio-history">
          {history.length === 0 ? (
            <p className="text-sm text-muted">Keine Titelhistorie verfügbar.</p>
          ) : (
            <ol className="divide-y divide-separator">
              {history.map((track) => (
                <li
                  key={`${track.id}-${track.startedAt}`}
                  className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="min-w-0 text-sm font-medium text-foreground">
                    {track.artist} — {track.title}
                  </span>
                  <time
                    className="shrink-0 text-xs tabular-nums text-muted"
                    dateTime={track.startedAt ?? undefined}
                  >
                    {track.startedAt ? formatTime(track.startedAt) : "—"}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </AdminPanel>
      </div>
    </>
  );
}
