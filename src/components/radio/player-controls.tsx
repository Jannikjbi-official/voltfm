"use client";

import { Button, cn } from "@heroui/react";
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

/**
 * Play / Pause / Erneut versuchen — klein fuer die Leiste ("md"), gross fuer
 * die Buehne ("lg").
 *
 * Solange `radio.embedAllowed` false ist, ist das kein Wiedergabeknopf,
 * sondern ein Link zum Webplayer von lautstation.de (`radio.externalUrl`):
 * laut.fm erlaubt das Verlinken, nicht das Einbetten (§ 6 Abs. 9). Ein
 * normaler Klick oeffnet vorher den Hinweis (`openStream`), Mittelklick und
 * "Adresse kopieren" funktionieren weiter wie bei jedem Link.
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
          onClick={onClick}
          className="group inline-flex h-16 items-center gap-4 rounded-full bg-volt py-2 pr-7 pl-2 text-ink shadow-[0_12px_40px_-12px_rgba(255,214,10,0.55)] transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-volt motion-reduce:transition-none sm:h-[4.5rem]"
        >
          <span
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-full bg-ink text-lg text-volt sm:size-14"
          >
            <Icon icon={PlayIcon} className="translate-x-px" />
          </span>
          <span className="font-display text-xl sm:text-2xl">Jetzt hören</span>
          <Icon icon={ExternalLinkIcon} className="text-sm opacity-70" aria-hidden />
          <span className="sr-only">
            {" "}im Webplayer von {radio.externalName} (öffnet ein neues Fenster)
          </span>
        </a>
      );
    }

    return (
      <a
        href={externalUrl}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={label}
        title={label}
        onClick={onClick}
        className={cn(
          "relative grid shrink-0 place-items-center rounded-full bg-volt text-ink transition-transform hover:scale-105 active:scale-95 motion-reduce:transition-none",
          size === "lg" ? "size-16 text-xl" : "size-11 text-base",
        )}
      >
        <Icon icon={PlayIcon} className="translate-x-px" />
        {/* Ohne Text: der kleine Pfeil sagt, dass ein neues Fenster aufgeht. */}
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-ink text-[0.5rem] text-volt ring-2 ring-[var(--player-ring,var(--background))]"
        >
          <Icon icon={ExternalLinkIcon} />
        </span>
      </a>
    );
  }

  /* Nach einem Fehler wird aus dem Knopf "Erneut versuchen" — gleiche Stelle,
     gleiche Groesse, damit die Leiste nicht springt. */
  if (status === "error" || status === "offline") {
    return (
      <Button
        variant="danger"
        isIconOnly
        onPress={retry}
        aria-label="Erneut versuchen"
        className={cn("rounded-full", size === "lg" ? "size-16 text-xl" : "size-11")}
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
      isIconOnly
      onPress={toggle}
      aria-label={label}
      data-state={connecting ? "connecting" : isPlaying ? "playing" : "idle"}
      className={cn("rounded-full", size === "lg" ? "size-16 text-xl" : "size-11")}
    >
      <Icon icon={connecting ? LoadingIcon : isPlaying ? PauseIcon : PlayIcon} spin={connecting} />
    </Button>
  );
}

/**
 * Stummschalten plus Lautstaerkeregler.
 *
 * Nichts davon, solange auf der Seite des Anbieters gehoert wird — hier gibt
 * es dann keinen Ton, dessen Lautstaerke sich aendern liesse. Auf iPhone und
 * iPad gibt es nur den Stumm-Knopf: Dort bestimmt allein das Geraet.
 */
export function VolumeControl() {
  const { volume, muted, volumeSupported, setVolume, toggleMute, embedAllowed } =
    useRadioPlayer();

  if (!embedAllowed) return null;

  const effective = muted ? 0 : volume;
  const icon =
    effective === 0 ? VolumeMuteIcon : effective < 0.5 ? VolumeLowIcon : VolumeHighIcon;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        onPress={toggleMute}
        aria-label={muted ? "Ton einschalten" : "Stummschalten"}
        aria-pressed={muted}
      >
        <Icon icon={icon} />
      </Button>
      {volumeSupported && (
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(effective * 100)}
          onChange={(event) => setVolume(Number(event.target.value) / 100)}
          aria-label="Lautstärke"
          className="hidden w-28 accent-[var(--volt)] sm:block"
        />
      )}
    </div>
  );
}

/**
 * Der Wiedergabestatus in Worten — fuer Screenreader und fuer Fehler.
 *
 * Angesagt (`announce`) wird nur aus der Leiste, die es auf jeder Seite gibt.
 * Zwei Live-Regionen wuerden jede Meldung doppelt vorlesen.
 */
export function PlayerStatusLine({
  className,
  announce = false,
}: {
  className?: string;
  announce?: boolean;
}) {
  const { status, error, embedAllowed, consent } = useRadioPlayer();

  /* Ohne eingebetteten Player gibt es keinen Wiedergabestatus zu melden. */
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
      className={cn("text-sm", failed ? "text-danger" : "text-muted", className)}
      role={announce ? "status" : undefined}
      aria-live={announce ? "polite" : undefined}
    >
      {text}
    </p>
  );
}

/**
 * Vier Balken, die sich bewegen, solange Musik laeuft.
 *
 * Reine Gestaltung, keine Messung: Die Web Audio API liefert bei einem
 * fremden Stream ohne CORS-Freigabe nur Stille. Bei reduzierter Bewegung
 * stehen die Balken still.
 */
export function LevelMeter({ className }: { className?: string }) {
  const { status, embedAllowed } = useRadioPlayer();
  if (!embedAllowed) return null;
  const active = status === "playing";

  const bar = cn(
    "h-full flex-1 origin-bottom scale-y-[0.18] rounded-[1px] bg-volt",
    active && "animate-[vfm-level_900ms_ease-in-out_infinite_alternate] motion-reduce:animate-none",
  );

  return (
    <span
      className={cn(
        "inline-flex h-4 w-[18px] shrink-0 items-end gap-0.5 transition-opacity duration-300",
        !active && "opacity-0",
        className,
      )}
      aria-hidden="true"
    >
      <span className={bar} />
      <span className={cn(bar, "[animation-delay:-200ms] [animation-duration:640ms]")} />
      <span className={cn(bar, "[animation-delay:-450ms] [animation-duration:1100ms]")} />
      <span className={cn(bar, "[animation-delay:-120ms] [animation-duration:760ms]")} />
    </span>
  );
}

/** Der zweite Weg zum Hoeren — nur mit eingebettetem Player. */
export function AlsoListenLink({ className }: { className?: string }) {
  const { embedAllowed } = useRadioPlayer();
  /* Ohne eingebetteten Player fuehrt schon der grosse Knopf dorthin. */
  if (!embedAllowed) return null;

  return (
    <a
      href={radio.externalUrl}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted underline underline-offset-4 hover:text-foreground",
        className,
      )}
    >
      Auch im Webplayer von {radio.externalName} hören
      <Icon icon={ExternalLinkIcon} className="text-[0.7em]" />
      <span className="sr-only"> (öffnet einen neuen Tab)</span>
    </a>
  );
}

/** Eine gegebene Einwilligung zuruecknehmen — nur mit eingebettetem Player. */
export function StreamNotice() {
  const { embedAllowed, consent, revokeConsent } = useRadioPlayer();
  if (!embedAllowed || consent !== true) return null;

  return (
    <p className="text-sm text-muted">
      Du hast der Verbindung zu {radio.providerName} zugestimmt.{" "}
      <button
        type="button"
        className="rounded-sm font-medium text-foreground underline underline-offset-4"
        onClick={revokeConsent}
      >
        Verbindung trennen
      </button>
    </p>
  );
}
