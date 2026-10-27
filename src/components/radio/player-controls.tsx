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
  ExternalLinkIcon,
  RetryIcon,
} from "@/lib/icons";
import { radio } from "@/lib/site";
import { useRadioPlayer } from "./player-provider";
import styles from "./player.module.css";

/**
 * Play / pause / retry, sized for either the sticky bar ("md") or the stage
 * in the hero and on /radio ("lg").
 *
 * While `radio.embedAllowed` is false this is a link to the provider rather
 * than a transport control — laut.fm's terms allow linking, not embedding.
 * Das Ziel ist der Webplayer von lautstation.de (siehe `radio.externalUrl`).
 * Damit vor dem Klick klar ist, dass ein neues Fenster aufgeht, steht dann
 * "Jetzt hören" mit dem Extern-Pfeil daneben (`withLabel`, Buehne) bzw. ein
 * kleiner Pfeil am Knopf (Sticky-Leiste, ohne Platz fuer Text).
 */
export function PlayButton({
  size = "md",
  withLabel = false,
}: {
  size?: "md" | "lg";
  /** Nur ohne eingebetteten Player: Text und Knopf als ein gemeinsamer Link. */
  withLabel?: boolean;
}) {
  const { status, isPlaying, toggle, retry, embedAllowed, externalUrl, openStream } =
    useRadioPlayer();

  if (!embedAllowed) {
    const label = `Im Webplayer von ${radio.externalName} hören (öffnet ein neues Fenster)`;
    /* Bleibt ein echter Link: Mittelklick, Strg-Klick und "Adresse kopieren"
       sollen weiter funktionieren. Nur der normale Klick wird abgefangen,
       damit vorher der Hinweis erscheint. */
    const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.button !== 0) return;
      event.preventDefault();
      openStream();
    };

    if (withLabel) {
      return (
        <a
          href={externalUrl}
          target="_blank"
          rel="noreferrer noopener"
          data-player-size={size}
          className={styles.externalPlayLabeled}
          onClick={onClick}
        >
          <span className={styles.externalPlay} data-player-size={size} aria-hidden="true">
            <Icon icon={PlayIcon} />
          </span>
          <span className={styles.externalPlayText}>
            Jetzt hören
            <Icon icon={ExternalLinkIcon} className={styles.externalPlayArrow} />
            <span className="visually-hidden">
              {" "}im Webplayer von {radio.externalName} (öffnet ein neues Fenster)
            </span>
          </span>
        </a>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              data-player-size={size}
              className={styles.externalPlay}
              onClick={onClick}
            >
              <Icon icon={PlayIcon} />
              {/* Ohne Text: der kleine Pfeil sagt, dass ein neues Fenster aufgeht. */}
              <span className={styles.externalBadge} aria-hidden="true">
                <Icon icon={ExternalLinkIcon} />
              </span>
            </a>
          }
        />
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    );
  }

  /* Nach einem Fehler wird aus dem Knopf "Erneut versuchen" — gleiche Stelle,
     gleiche Groesse, damit die Leiste nicht springt. */
  if (status === "error" || status === "offline") {
    return (
      <Button
        variant="error"
        mode="filled"
        size={size}
        asIcon
        onClick={retry}
        aria-label="Erneut versuchen"
        data-player-size={size}
        className={styles.playButton}
      >
        <Icon icon={RetryIcon} />
      </Button>
    );
  }

  const connecting = status === "connecting";
  const label = connecting
    ? "Verbindet … zum Abbrechen klicken"
    : isPlaying
      ? "Wiedergabe pausieren"
      : "Livestream abspielen";

  return (
    <Button
      variant="primary"
      mode="filled"
      size={size}
      asIcon
      onClick={toggle}
      aria-label={label}
      data-player-size={size}
      data-state={connecting ? "connecting" : isPlaying ? "playing" : "idle"}
      className={styles.playButton}
    >
      <Icon
        icon={connecting ? LoadingIcon : isPlaying ? PauseIcon : PlayIcon}
        className={connecting ? styles.spin : undefined}
      />
    </Button>
  );
}

/**
 * Mute toggle plus volume slider.
 *
 * Renders nothing while playback happens on the provider's site — there is no
 * audio here whose volume could be changed. Auf iPhone und iPad gibt es nur
 * den Stumm-Knopf: Dort bestimmt allein das Geraet die Lautstaerke.
 */
export function VolumeControl() {
  const { volume, muted, volumeSupported, setVolume, toggleMute, embedAllowed } =
    useRadioPlayer();

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
      {volumeSupported && (
        <Slider
          value={Math.round(effective * 100)}
          onValueChange={(value) => setVolume((value as number) / 100)}
          min={0}
          max={100}
          step={1}
          aria-label="Lautstärke"
          className={styles.volumeSlider}
        />
      )}
    </div>
  );
}

/**
 * Human-readable playback state for screen readers and the error surface.
 *
 * Angesagt (`announce`) wird nur aus der Sticky-Leiste, die es auf jeder Seite
 * gibt. Steht die Zeile zusaetzlich sichtbar auf der Buehne, waeren es sonst
 * zwei Live-Regionen, und der Screenreader saehe jede Meldung doppelt.
 */
export function PlayerStatusLine({
  className,
  announce = false,
}: {
  className?: string;
  announce?: boolean;
}) {
  const { status, error, embedAllowed, consent } = useRadioPlayer();

  /* Ohne eingebetteten Player gibt es keinen Wiedergabestatus zu melden — und
     <StreamNotice> darunter sagt ohnehin schon, wo abgespielt wird. */
  if (!embedAllowed) return null;

  const failed = status === "error" || status === "offline";
  const text =
    status === "connecting"
      ? "Verbinde mit dem Livestream …"
      : status === "playing"
        ? "Läuft live"
        : status === "paused"
          ? "Pausiert. Weiter geht es live, nicht an der Stelle von eben."
          : failed
            ? (error ?? "Der Stream lässt sich gerade nicht abspielen.")
            : consent === false
              ? `Beim ersten Abspielen fragen wir einmal, ob dein Browser sich mit ${radio.providerName} verbinden darf.`
              : "Bereit. Ein Klick, und es läuft.";

  return (
    <p
      className={`${styles.statusLine} ${className ?? ""}`}
      data-failed={failed || undefined}
      role={announce ? "status" : undefined}
      aria-live={announce ? "polite" : undefined}
    >
      {text}
    </p>
  );
}

/**
 * Die Pegelanzeige: vier Balken, die sich bewegen, solange Musik laeuft.
 *
 * Reine Gestaltung, keine Messung. Ein echter Pegel braeuchte die Web Audio
 * API, und die liefert bei einem fremden Stream ohne CORS-Freigabe nur Stille —
 * laut.fm schickt keinen `Access-Control-Allow-Origin`, der Ton waere also weg.
 * Deshalb tanzen die Balken per CSS, und nur dann, wenn wirklich etwas spielt.
 * Bei `prefers-reduced-motion` stehen sie still.
 */
export function LevelMeter({ className }: { className?: string }) {
  const { status, embedAllowed } = useRadioPlayer();
  if (!embedAllowed) return null;

  return (
    <span
      className={`${styles.meter} ${className ?? ""}`}
      data-active={status === "playing" || undefined}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

/**
 * Der zweite Weg zum Hoeren, klein unter dem Play-Knopf. Er fuehrt zum
 * Webplayer von lautstation.de (ein privates Verzeichnis, nicht laut.fm
 * selbst) — deshalb steht der Name im Text, nicht "laut.fm-Player".
 */
export function AlsoListenLink({ className }: { className?: string }) {
  const { embedAllowed } = useRadioPlayer();
  /* Ohne eingebetteten Player fuehrt schon der grosse Knopf dorthin. */
  if (!embedAllowed) return null;

  return (
    <a
      href={radio.externalUrl}
      target="_blank"
      rel="noreferrer noopener"
      className={`${styles.alsoListen} ${className ?? ""}`}
    >
      Auch im Webplayer von {radio.externalName} hören
      <Icon icon={ExternalLinkIcon} />
      <span className="visually-hidden"> (öffnet einen neuen Tab)</span>
    </a>
  );
}

/**
 * Der Weg, eine gegebene Einwilligung zurueckzunehmen — nur mit eingebettetem
 * Player, denn nur dann gibt es eine Verbindung, die sie erlaubt hat.
 *
 * Shown on the stage, where there is room to explain — the sticky bar only
 * gets the button.
 */
export function StreamNotice() {
  const { embedAllowed, consent, revokeConsent } = useRadioPlayer();

  /* Ohne eingebetteten Player gibt es keine Einwilligung zurueckzunehmen. Was
     beim Klick passiert, sagt der Hinweis unter dem Knopf, und alles zur
     Weiterleitung der Dialog davor. */
  if (!embedAllowed) return null;

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
