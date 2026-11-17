import type { Metadata } from "next";
import { requireCan } from "@/lib/session";
import { getRadioSnapshot } from "@/services/radio";
import { getStationInfo, getLastSongs } from "@/services/radio/metadata";
import { formatTime } from "@/lib/format";
import { site } from "@/lib/site";
import { Icon, ClockIcon, MicIcon, MusicIcon, RadioIcon } from "@/lib/icons";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  DataList,
  StatCard,
  StatusBadge,
  Td,
  Th,
  trClass,
} from "@/components/admin/admin-ui";

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
  const { nowPlaying, currentShow, nextShow } = snapshot;

  return (
    <>
      <AdminPageHeader
        title="Radio"
        description="Livedaten von laut.fm, frisch bei jedem Aufruf."
        actions={
          <StatusBadge color={snapshot.degraded ? "warning" : "success"} className="px-3 py-1 text-sm">
            {snapshot.degraded ? "Metadaten gestört" : "Metadaten erreichbar"}
          </StatusBadge>
        }
      />

      <ul className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <li>
          <StatCard accent label="Hörer gerade" value={snapshot.listeners ?? "—"} icon={RadioIcon} />
        </li>
        <li>
          <StatCard
            label="Sendung"
            value={<span className="block truncate text-[1.75rem] leading-tight">{currentShow?.name ?? "—"}</span>}
            icon={MicIcon}
            hint={currentShow?.endsAt ? `bis ${formatTime(currentShow.endsAt)} Uhr` : undefined}
          />
        </li>
        <li>
          <StatCard
            label="Als Nächstes"
            value={<span className="block truncate text-[1.75rem] leading-tight">{nextShow?.name ?? "—"}</span>}
            icon={ClockIcon}
            hint={nextShow?.startsAt ? `ab ${formatTime(nextShow.startsAt)} Uhr` : undefined}
          />
        </li>
        <li>
          <StatCard
            label="Läuft gerade"
            value={
              <span className="block truncate text-[1.75rem] leading-tight">{nowPlaying?.title ?? "—"}</span>
            }
            icon={MusicIcon}
            hint={nowPlaying?.artist ?? "Keine Metadaten"}
          />
        </li>
      </ul>

      <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <AdminPanel title="Sender" titleId="radio-station">
          <DataList
            rows={[
              {
                label: "Stream-URL",
                value: <code className="font-mono text-xs break-all">{site.streamUrl}</code>,
              },
              { label: "Station", value: station?.displayName || station?.name || "—" },
              { label: "Genres", value: station?.genres.join(", ") || "—" },
              { label: "Format", value: station?.format || "—" },
            ]}
          />
        </AdminPanel>

        <section aria-labelledby="radio-history">
          <h2 id="radio-history" className="mb-3 font-wide text-lg font-bold text-foreground">
            Zuletzt gespielt
          </h2>
          {history.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
              Keine Titelhistorie verfügbar.
            </p>
          ) : (
            <AdminTable>
              <thead>
                <tr>
                  <Th className="w-0">Zeit</Th>
                  <Th>Titel</Th>
                  <Th className="hidden sm:table-cell">Interpret</Th>
                </tr>
              </thead>
              <tbody>
                {history.map((track, index) => (
                  <tr key={`${track.id}-${track.startedAt}`} className={trClass}>
                    <Td className="font-mono text-xs whitespace-nowrap text-muted">
                      {index === 0 ? (
                        <span className="inline-flex items-center gap-1.5 font-sans font-semibold text-accent-text">
                          <Icon icon={RadioIcon} className="text-[0.7rem]" />
                          {track.startedAt ? formatTime(track.startedAt) : "jetzt"}
                        </span>
                      ) : (
                        <time dateTime={track.startedAt ?? undefined}>
                          {track.startedAt ? formatTime(track.startedAt) : "—"}
                        </time>
                      )}
                    </Td>
                    <Td className="max-w-0">
                      <span className="block truncate font-medium text-foreground">{track.title}</span>
                      <span className="block truncate text-xs text-muted sm:hidden">{track.artist}</span>
                    </Td>
                    <Td className="hidden max-w-0 text-muted sm:table-cell">
                      <span className="block truncate">{track.artist}</span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          )}
        </section>
      </div>
    </>
  );
}
