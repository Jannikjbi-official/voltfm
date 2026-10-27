import type { Metadata } from "next";

import { SectionHeader } from "@/components/common/section-header";
import { ButtonLink } from "@/components/common/button-link";
import { CoverStage } from "@/components/radio/cover-stage";
import { RecentTracks } from "@/components/radio/recent-tracks";
import { LautstationPlaylist } from "@/components/radio/lautstation-playlist";
import { Icon, DiscordIcon, ExternalLinkIcon } from "@/lib/icons";
import { lautstation } from "@/lib/lautstation";
import { site } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Radio",
  description:
    "Der VoltFM Livestream: höre rund um die Uhr, sieh was gerade läuft und was als Nächstes kommt.",
  alternates: { canonical: "/radio" },
};

export const revalidate = 60;

export default function RadioPage() {
  return (
    <>
      {/* Dieselbe Buehne wie auf der Startseite — die Seite ist der Player. */}
      <CoverStage heading="VoltFM hören" />

      <section className="section">
        <div className="shell">
          <div className={styles.grid}>
            <div>
              <SectionHeader eyebrow="Zuletzt gespielt" title="Was gerade lief" />

              {/* Ein Abschnitt, eine Liste: oben die letzten zehn Titel live aus
                  dem Metadaten-Abruf, darunter als Fortsetzung die ganze Playlist
                  der letzten Tage. Zwei Listen mit eigenen Ueberschriften
                  untereinander sahen aus wie zwei verschiedene Dinge. */}
              <RecentTracks
                limit={10}
                emptyText="Die Metadaten von laut.fm sind gerade nicht erreichbar. Der Stream läuft trotzdem."
              />

              {/* Lag kurz auf einer eigenen Seite; /radio/playlist leitet
                  hierher um (next.config.ts). */}
              <div id="playlist" className={styles.playlist}>
                <LautstationPlaylist station={site.station} />
                <p className={styles.source}>
                  Daten:{" "}
                  <a href={lautstation.stationUrl} target="_blank" rel="noreferrer noopener">
                    {lautstation.name}
                    <Icon icon={ExternalLinkIcon} />
                  </a>
                  , ein privates Verzeichnis für laut.fm-Stationen. Es gehört weder zu
                  VoltFM noch zu laut.fm.
                </p>
              </div>
            </div>

            <aside className={styles.info}>
              <h2 className={styles.infoTitle}>Stream-Informationen</h2>

              <dl className={styles.infoList}>
                <div className={styles.infoRow}>
                  <dt>Sender</dt>
                  <dd>{site.name}</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt>Motto</dt>
                  <dd>{site.tagline}</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt>Genres</dt>
                  <dd>{site.genres.join(", ")}</dd>
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
                <ButtonLink href={lautstation.scheduleUrl} external variant="neutral" mode="stroke" size="sm">
                  Sendeplan
                  <Icon icon={ExternalLinkIcon} />
                </ButtonLink>
              </div>
              <p className={styles.infoNote}>
                Der Sendeplan zeigt, welche Playlist wann läuft, und öffnet sich bei{" "}
                {lautstation.name} in einem neuen Tab.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
