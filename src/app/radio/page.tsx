import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { ButtonLink } from "@/components/common/button-link";
import { RadioStage } from "@/components/radio/radio-stage";
import { Icon, DiscordIcon } from "@/lib/icons";
import { getLastSongs, getStationInfo } from "@/services/radio/metadata";
import { formatTime } from "@/lib/format";
import { site } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Radio",
  description:
    "Der VoltFM Livestream: höre rund um die Uhr, sieh was gerade läuft und was als Nächstes kommt.",
  alternates: { canonical: "/radio" },
};

export const revalidate = 60;

export default async function RadioPage() {
  const [station, history] = await Promise.all([getStationInfo(), getLastSongs(10)]);

  return (
    <>
      <PageHeader
        eyebrow="Livestream"
        title="VoltFM hören"
        description="Ein Klick, kein Konto, keine Werbeunterbrechung — gesendet wird rund um die Uhr über laut.fm."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/radio", label: "Radio" },
        ]}
        size="large"
      />

      <section className="section shell">
        <RadioStage />
      </section>

      <section className={styles.lower}>
        <div className="shell">
          <div className={styles.grid}>
            <div>
              <SectionHeader
                eyebrow="Zuletzt gespielt"
                title="Was gerade lief"
              />

              {history.length > 0 ? (
                <ol className={styles.history} role="list">
                  {history.map((track) => (
                    <li key={`${track.id}-${track.startedAt}`} className={styles.historyItem}>
                      <span className={styles.historyTime}>
                        {track.startedAt ? formatTime(track.startedAt) : "—"}
                      </span>
                      <span className={styles.historyText}>
                        <span className={styles.historyTitle}>{track.title}</span>
                        <span className={styles.historyArtist}>{track.artist}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState
                  title="Keine Titelhistorie verfügbar"
                  description="Die Metadaten von laut.fm sind gerade nicht erreichbar. Der Stream läuft trotzdem."
                />
              )}
            </div>

            <aside className={styles.info}>
              <h2 className={styles.infoTitle}>Stream-Informationen</h2>

              <dl className={styles.infoList}>
                <div className={styles.infoRow}>
                  <dt>Sender</dt>
                  <dd>{site.name}</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt>Format</dt>
                  <dd>{station?.format || "Pop, Dance, Deutschpop"}</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt>Genres</dt>
                  <dd>{station?.genres.join(", ") || "Pop, Rock, Schlager"}</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt>Standort</dt>
                  <dd>Hamburg</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt>Verfügbarkeit</dt>
                  <dd>24 / 7</dd>
                </div>
              </dl>

              <div className={styles.infoActions}>
                <ButtonLink href={site.discordUrl} external variant="primary" mode="filled" size="sm">
                  <Icon icon={DiscordIcon} />
                  Discord
                </ButtonLink>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
