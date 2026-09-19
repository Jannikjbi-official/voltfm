"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Icon,
  PlayIcon,
  PauseIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeMuteIcon,
  LoadingIcon,
} from "@/lib/icons";
import { radio } from "@/lib/site";
import { useRadioPlayer } from "./player-provider";
import styles from "./player.module.css";

/**
 * Play / pause / retry, sized for either the sticky bar or the radio hero.
 *
 * While `radio.embedAllowed` is false this is a link to the provider rather
 * than a transport control — laut.fm's terms allow linking, not embedding.
 */
export function PlayButton({ size = "md" }: { size?: "md" | "lg" }) {
  const { status, isPlaying, toggle, retry, embedAllowed, externalUrl, openStream } =
    useRadioPlayer();

  if (!embedAllowed) {
    const label = `Auf ${radio.providerName} hören (öffnet ein neues Fenster)`;
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            /* Bleibt ein echter Link: Mittelklick, Strg-Klick und "Adresse
               kopieren" sollen weiter funktionieren. Nur der normale Klick wird
               abgefangen, damit vorher der Hinweis erscheint. */
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              data-player-size={size}
              className={styles.externalPlay}
              onClick={(event) => {
                if (event.defaultPrevented) return;
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                if (event.button !== 0) return;
                event.preventDefault();
                openStream();
              }}
            >
              <Icon icon={PlayIcon} />
            </a>
          }
        />
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    );
  }

  if (status === "error" || status === "offline") {
    return (
      <Button variant="error" mode="filled" size={size === "lg" ? "lg" : "md"} onClick={retry}>
        Erneut versuchen
      </Button>
    );
  }

  const connecting = status === "connecting";
  const label = isPlaying ? "Wiedergabe pausieren" : "Livestream abspielen";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="primary"
            mode="filled"
            size={size === "lg" ? "lg" : "md"}
            asIcon
            onClick={toggle}
            aria-label={label}
            data-player-size={size}
            className={styles.playButton}
          >
            <Icon
              icon={connecting ? LoadingIcon : isPlaying ? PauseIcon : PlayIcon}
              className={connecting ? styles.spin : undefined}
            />
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Mute toggle plus volume slider.
 *
 * Renders nothing while playback happens on the provider's site — there is no
 * audio here whose volume could be changed.
 */
export function VolumeControl() {
  const { volume, muted, setVolume, toggleMute, embedAllowed } = useRadioPlayer();

  if (!embedAllowed) return null;

  const effective = muted ? 0 : volume;
  const icon =
    effective === 0 ? VolumeMuteIcon : effective < 0.5 ? VolumeLowIcon : VolumeHighIcon;

  return (
    <div className={styles.volume}>
      <Button
        variant="neutral"
        mode="ghost"
        size="sm"
        asIcon
        onClick={toggleMute}
        aria-label={muted ? "Ton einschalten" : "Stummschalten"}
        aria-pressed={muted}
        className={styles.volumeButton}
      >
        <Icon icon={icon} />
      </Button>
      <Slider
        value={Math.round(effective * 100)}
        onValueChange={(value) => setVolume((value as number) / 100)}
        min={0}
        max={100}
        step={1}
        aria-label="Lautstärke"
        className={styles.volumeSlider}
      />
    </div>
  );
}

/** Human-readable playback state for screen readers and the error surface. */
export function PlayerStatusLine() {
  const { status, error, embedAllowed, consent } = useRadioPlayer();

  /* Ohne eingebetteten Player gibt es keinen Wiedergabestatus zu melden — und
     <StreamNotice> darunter sagt ohnehin schon, wo abgespielt wird. */
  if (!embedAllowed) return null;

  const text =
    status === "connecting"
      ? "Verbinde mit dem Livestream …"
      : status === "playing"
        ? "Livestream läuft"
        : status === "paused"
          ? "Wiedergabe pausiert"
          : status === "offline"
            ? "Keine Internetverbindung"
            : consent === false
              ? `Der Stream wird erst nach deiner Zustimmung von ${radio.providerName} geladen.`
              : (error ?? "");

  return (
    <p className={styles.statusLine} role="status" aria-live="polite">
      {text}
    </p>
  );
}

/**
 * Why there is no player here, plus the way to withdraw a given consent.
 *
 * Shown on /radio and in the hero, where there is room to explain — the sticky
 * bar only gets the button.
 */
export function StreamNotice() {
  const { embedAllowed, consent, revokeConsent } = useRadioPlayer();

  /* Alles zur Weiterleitung steht im Hinweis, der vor dem Verlassen der Seite
     erscheint — hier reicht die Ansage, was einen erwartet. */
  if (!embedAllowed) {
    return (
      <p className={styles.notice}>
        Rund um die Uhr auf Sendung — zusammengestellt von Menschen, die selbst
        zuhören.
      </p>
    );
  }

  if (consent !== true) return null;

  return (
    <p className={styles.notice}>
      Du hast der Verbindung zu {radio.providerName} zugestimmt.{" "}
      <button type="button" className={styles.linkButton} onClick={revokeConsent}>
        Verbindung trennen
      </button>
    </p>
  );
}
