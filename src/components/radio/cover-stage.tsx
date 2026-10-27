"use client";

import { radio, site } from "@/lib/site";
import { useRadioPlayer } from "./player-provider";
import {
  AlsoListenLink,
  LevelMeter,
  PlayButton,
  PlayerStatusLine,
  StreamNotice,
  VolumeControl,
} from "./player-controls";
import { CoverArt } from "./cover-art";
import { CoverBackdrop } from "./cover-backdrop";
import { LiveIndicator } from "./live-indicator";
import styles from "./cover-stage.module.css";

/**
 * Die Buehne: Das Cover ist das Groesste auf der Seite, dahinter liegt es noch
 * einmal weichgezeichnet. Daneben steht, was laeuft, und der grosse Knopf.
 *
 * Dieselbe Buehne steht auf der Startseite und auf /radio. Die `h1` ist eine
 * kleine Zeile ueber dem Titel (`heading`) — der Songtitel selbst ist keine
 * Ueberschrift: Er wechselt alle drei Minuten, und eine wechselnde `h1` ist fuer
 * Screenreader und Suchmaschinen gleichermassen schlecht.
 */
export function CoverStage({ heading }: { heading: string }) {
  const { snapshot, embedAllowed, isPlaying, status } = useRadioPlayer();
  const track = snapshot?.nowPlaying;
  const show = snapshot?.currentShow;
  const genres = site.genres.join(", ").replace(/, ([^,]*)$/, " und $1");

  return (
    <section className={styles.stage} aria-labelledby="stage-heading">
      <CoverBackdrop src={track?.coverUrl} />

      <div className={`shell ${styles.inner}`}>
        <div className={styles.artwork}>
          <CoverArt
            src={track?.coverUrl}
            alt={track ? `Cover: ${track.title} von ${track.artist}` : ""}
            size="large"
            eager
            className={styles.cover}
          />
        </div>

        <div className={styles.body}>
          <div className={styles.topline}>
            <LiveIndicator />
            <h1 id="stage-heading" className={styles.heading}>
              {heading}
            </h1>
          </div>

          <div className={styles.now}>
            <p className={styles.nowLabel}>
              Läuft gerade
              {show && (
                <>
                  <span className={styles.dot} aria-hidden="true">
                    ·
                  </span>
                  Playlist <span className={styles.playlist}>{show.name}</span>
                </>
              )}
            </p>
            <p className={styles.title}>{track?.title ?? `${site.name} Livestream`}</p>
            <p className={styles.artist}>{track?.artist ?? "Musik rund um die Uhr"}</p>
            {track?.album && (
              <p className={styles.album}>
                {track.album}
                {track.releaseYear ? ` · ${track.releaseYear}` : ""}
              </p>
            )}
          </div>

          <div className={styles.controls}>
            {embedAllowed ? (
              <>
                <PlayButton size="lg" />
                <div className={styles.controlText}>
                  <span className={styles.controlLabel}>
                    {status === "connecting"
                      ? "Verbinde …"
                      : isPlaying
                        ? "Du hörst VoltFM"
                        : "Jetzt live hören"}
                    <LevelMeter />
                  </span>
                  <PlayerStatusLine />
                </div>
              </>
            ) : (
              <div className={styles.controlText}>
                <PlayButton size="lg" withLabel />
                {/* Vor dem Klick sagen, wohin er fuehrt — der Knopf verlaesst
                    die Seite, statt hier etwas abzuspielen. */}
                <p className={styles.hint}>
                  Öffnet den Webplayer von {radio.externalName} in einem neuen Fenster.
                </p>
              </div>
            )}
          </div>

          <p className={styles.lead}>
            Rund um die Uhr {genres}, im Moment aus dem Musikpool von{" "}
            {radio.providerName}. Aus Hamburg, seit {site.foundedYear}.
          </p>

          <div className={styles.extras}>
            {/* Eigene Huelle: .volume ist fuer eine Zeile gebaut (flex-basis
                168px) und wuerde in dieser Spalte sonst 168px hoch. */}
            <div className={styles.volumeRow}>
              <VolumeControl />
            </div>
            <AlsoListenLink />
            <StreamNotice />
          </div>

          {snapshot?.degraded && (
            <p className={styles.degraded}>
              Titelinformationen sind gerade nicht verfügbar. Der Livestream läuft trotzdem.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
