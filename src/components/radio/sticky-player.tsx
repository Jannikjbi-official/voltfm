"use client";

import Link from "next/link";
import { features, site } from "@/lib/site";
import { useRadioPlayer } from "./player-provider";
import { LevelMeter, PlayButton, PlayerStatusLine, VolumeControl } from "./player-controls";
import { CoverArt } from "./cover-art";
import { LiveIndicator } from "./live-indicator";
import styles from "./player.module.css";

/**
 * The persistent player.
 *
 * Rendered once in the root layout and never unmounted, so switching pages does
 * not interrupt playback. Body padding (--player-height in globals.css)
 * reserves its height so it never covers page content.
 *
 * Auf 375 px bleiben Knopf, Cover, Titel und der Stumm-Knopf. Laeuft etwas
 * schief, steht die Meldung an der Stelle des Interpreten — dort, wo man nach
 * dem Klick ohnehin hinschaut.
 */
export function StickyPlayer() {
  const { snapshot, status, error, embedAllowed } = useRadioPlayer();
  const track = snapshot?.nowPlaying;
  const show = snapshot?.currentShow;
  const failed = status === "error" || status === "offline";

  return (
    <aside className={styles.bar} aria-label="VoltFM Player">
      <div className={styles.barInner}>
        <PlayButton />

        <div className={styles.meta}>
          <CoverArt
            src={track?.coverUrl}
            alt={track ? `Cover: ${track.title} von ${track.artist}` : ""}
            className={styles.barCover}
          />
          <div className={styles.text}>
            <span className={styles.title}>
              {track?.title ?? `${site.name} Livestream`}
            </span>
            <span className={styles.artist} data-failed={failed || undefined}>
              {failed && error ? error : (track?.artist ?? site.tagline)}
            </span>
          </div>
        </div>

        <div className={styles.right}>
          {show && (
            /* Zeigt auf den Sendeplan, solange es einen gibt — sonst auf den
               Player, wo die laufende Playlist ohnehin steht. */
            <Link href={features.schedule ? "/programm" : "/radio"} className={styles.show}>
              <span className={styles.showLabel}>Playlist</span>
              <span className={styles.showName}>{show.name}</span>
            </Link>
          )}
          {embedAllowed ? (
            <LevelMeter />
          ) : (
            /* Auf dem Handy steht "Live" schon gross in der Buehne — in der
               schmalen Leiste waere es nur ein zweites rotes Feld. */
            <span className={styles.barLive}>
              <LiveIndicator />
            </span>
          )}
          <VolumeControl />
        </div>
      </div>

      {/* Die einzige Live-Region fuer den Wiedergabestatus — siehe PlayerStatusLine. */}
      <PlayerStatusLine className="visually-hidden" announce />
    </aside>
  );
}
