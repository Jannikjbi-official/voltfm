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
import { useRadioPlayer } from "./player-provider";
import styles from "./player.module.css";

/** Play / pause / retry, sized for either the sticky bar or the radio hero. */
export function PlayButton({ size = "md" }: { size?: "md" | "lg" }) {
  const { status, isPlaying, toggle, retry } = useRadioPlayer();

  if (status === "error" || status === "offline") {
    return (
      <Button
        variant="error"
        mode="filled"
        size={size === "lg" ? "lg" : "md"}
        onClick={retry}
      >
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

/** Mute toggle plus volume slider. Hidden on small screens by the parent. */
export function VolumeControl() {
  const { volume, muted, setVolume, toggleMute } = useRadioPlayer();
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
  const { status, error } = useRadioPlayer();

  const text =
    status === "connecting"
      ? "Verbinde mit dem Livestream …"
      : status === "playing"
        ? "Livestream läuft"
        : status === "paused"
          ? "Wiedergabe pausiert"
          : status === "offline"
            ? "Keine Internetverbindung"
            : error ?? "";

  return (
    <p className={styles.statusLine} role="status" aria-live="polite">
      {text}
    </p>
  );
}
