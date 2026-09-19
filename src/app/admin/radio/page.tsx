import type { Metadata } from "next";
import { requireCan } from "@/lib/session";
import { getRadioSnapshot } from "@/services/radio";
import { getStationInfo, getLastSongs } from "@/services/radio/metadata";
import { formatTime } from "@/lib/format";
import { site } from "@/lib/site";
import styles from "../page.module.css";

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
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Radio</h1>
          <p className={styles.subtitle}>Livedaten aus dem Sendesystem.</p>
        </div>
      </header>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Status</h2>
        <dl className={styles.onAir}>
          <div className={styles.onAirRow}>
            <dt>Stream-URL</dt>
            <dd>{site.streamUrl}</dd>
          </div>
          <div className={styles.onAirRow}>
            <dt>Aktueller Titel</dt>
            <dd>
              {snapshot.nowPlaying
                ? `${snapshot.nowPlaying.artist} — ${snapshot.nowPlaying.title}`
                : "Keine Metadaten"}
            </dd>
          </div>
          <div className={styles.onAirRow}>
            <dt>Hörer</dt>
            <dd>{snapshot.listeners ?? "—"}</dd>
          </div>
          <div className={styles.onAirRow}>
            <dt>Sendung</dt>
            <dd>{snapshot.currentShow?.name ?? "—"}</dd>
          </div>
          <div className={styles.onAirRow}>
            <dt>Genres</dt>
            <dd>{station?.genres.join(", ") || "—"}</dd>
          </div>
          <div className={styles.onAirRow}>
            <dt>Metadaten</dt>
            <dd>
              <span className={snapshot.degraded ? styles.statusWarn : styles.statusOk}>
                {snapshot.degraded ? "Gestört" : "Erreichbar"}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Zuletzt gespielt</h2>
        {history.length === 0 ? (
          <p className={styles.empty}>Keine Titelhistorie verfügbar.</p>
        ) : (
          <ul className={styles.recent} role="list">
            {history.map((track) => (
              <li key={`${track.id}-${track.startedAt}`}>
                <span className={styles.recentLink}>
                  <span className={styles.recentTitle}>
                    {track.artist} — {track.title}
                  </span>
                  <span className={styles.recentMeta}>
                    {track.startedAt ? formatTime(track.startedAt) : "—"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
