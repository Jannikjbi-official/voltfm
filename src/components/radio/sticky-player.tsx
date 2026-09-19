"use client";

import Link from "next/link";
import { features } from "@/lib/site";
import { useRadioPlayer } from "./player-provider";
import { PlayButton, VolumeControl } from "./player-controls";
import { CoverArt } from "./cover-art";
import { LiveIndicator } from "./live-indicator";
import styles from "./player.module.css";

/**
 * The persistent player.
 *
 * Rendered once in the root layout and never unmounted, so switching pages does
 * not interrupt playback. Body padding (--player-offset) reserves its height so
 * it never covers page content.
 */
export function StickyPlayer() {
  const { snapshot, status } = useRadioPlayer();
  const track = snapshot?.nowPlaying;
  const show = snapshot?.currentShow;

  return (
    <aside className={styles.bar} aria-label="VoltFM Player">
      <div className={styles.barInner}>
        <PlayButton />

        <div className={styles.meta}>
          <CoverArt
            src={track?.coverUrl}
            alt={track ? `Cover: ${track.title} von ${track.artist}` : "VoltFM"}
            size={48}
          />
          <div className={styles.text}>
            <span className={styles.title}>
              {track?.title ?? (status === "idle" ? "VoltFM Livestream" : "VoltFM")}
            </span>
            <span className={styles.artist}>
              {track?.artist ?? "Dein Sound. Deine Community."}
            </span>
          </div>
        </div>

        <div className={styles.right}>
          {show && (
            /* Zeigt auf den Sendeplan, solange es einen gibt — sonst auf den
               Player, wo die laufende Sendung ohnehin steht. */
            <Link href={features.schedule ? "/programm" : "/radio"} className={styles.show}>
              <span className={styles.showName}>{show.name}</span>
              läuft gerade
            </Link>
          )}
          <LiveIndicator />
          <VolumeControl />
        </div>
      </div>
    </aside>
  );
}
