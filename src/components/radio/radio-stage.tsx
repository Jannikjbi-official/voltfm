"use client";

import { Badge } from "@/components/ui/badge";
import { features } from "@/lib/site";
import { useRadioPlayer } from "./player-provider";
import { PlayButton, VolumeControl, PlayerStatusLine, StreamNotice } from "./player-controls";
import { CoverArt } from "./cover-art";
import { LiveIndicator } from "./live-indicator";
import { formatTime } from "@/lib/format";
import styles from "./radio-stage.module.css";

/**
 * The full-size player for /radio: large artwork, transport controls and the
 * on-air context around it. Shares all state with the sticky bar, so pressing
 * play here is the same stream.
 */
export function RadioStage() {
  const { snapshot } = useRadioPlayer();
  const track = snapshot?.nowPlaying;
  const current = snapshot?.currentShow;
  const next = snapshot?.nextShow;

  return (
    <div className={styles.stage}>
      <div className={styles.artwork}>
        <CoverArt
          src={track?.coverUrl}
          alt={track ? `Cover: ${track.title} von ${track.artist}` : "VoltFM"}
          size={320}
          className={styles.cover}
        />
      </div>

      <div className={styles.body}>
        <div className={styles.topRow}>
          <LiveIndicator />
          {current && <Badge mode="lighter" size="sm">{current.name}</Badge>}
        </div>

        <div className={styles.titles}>
          <p className={styles.label}>Läuft gerade</p>
          <h2 className={styles.track}>{track?.title ?? "VoltFM Livestream"}</h2>
          <p className={styles.artist}>{track?.artist ?? "24/7 Musik aus Hamburg"}</p>
          {track?.album && (
            <p className={styles.album}>
              {track.album}
              {track.releaseYear ? ` · ${track.releaseYear}` : ""}
            </p>
          )}
        </div>

        <div className={styles.controls}>
          <PlayButton size="lg" withLabel />
          <VolumeControl />
        </div>

        <PlayerStatusLine />
        <StreamNotice />

        <dl className={styles.schedule}>
          {current && (
            <div className={styles.scheduleRow}>
              <dt>Sendung</dt>
              <dd>
                {current.name}
                {current.endsAt && <span> · bis {formatTime(current.endsAt)} Uhr</span>}
              </dd>
            </div>
          )}
          {features.schedule && next && (
            <div className={styles.scheduleRow}>
              <dt>Danach</dt>
              <dd>
                {next.name}
                {next.startsAt && <span> · ab {formatTime(next.startsAt)} Uhr</span>}
              </dd>
            </div>
          )}
        </dl>

        {snapshot?.degraded && (
          <p className={styles.degraded}>
            Titelinformationen sind gerade nicht verfügbar — der Livestream läuft
            trotzdem.
          </p>
        )}
      </div>
    </div>
  );
}
