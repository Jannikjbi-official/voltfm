"use client";

import Link from "next/link";
import { cn } from "@heroui/react";
import { features, site } from "@/lib/site";
import { useRadioPlayer } from "./player-provider";
import { LevelMeter, PlayButton, PlayerStatusLine, VolumeControl } from "./player-controls";
import { CoverArt } from "./cover-art";
import { LiveIndicator } from "./live-indicator";

/**
 * Die Player-Leiste unten.
 *
 * Einmal im Root-Layout gerendert und nie entfernt, damit ein Seitenwechsel
 * die Wiedergabe nicht unterbricht. Das Padding am <body>
 * (--player-height) haelt ihr den Platz frei.
 *
 * Sie ist die Bedienleiste des Geraets: gelbe Play-Taste links, daneben
 * ein schwarzes Display mit Cover, Titel und Interpret in Punktmatrix.
 *
 * Auf 375 px bleiben Knopf, Cover und Titel. Laeuft etwas schief, steht die
 * Meldung an der Stelle des Interpreten — dort schaut man nach dem Klick hin.
 */
export function StickyPlayer() {
  const { snapshot, status, error, embedAllowed } = useRadioPlayer();
  const track = snapshot?.nowPlaying;
  const show = snapshot?.currentShow;
  const failed = status === "error" || status === "offline";

  return (
    <aside
      aria-label="VoltFM Player"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-1px_0_rgba(255,255,255,0.4),0_-12px_32px_-20px_rgba(0,0,0,0.5)]"
    >
      <div className="shell flex h-[var(--player-height)] items-center gap-2.5 sm:gap-3">
        <PlayButton />

        {/* Das Display: Cover, Titel in Gross, Interpret in Punktmatrix. */}
        <div className="display-panel display-dots flex h-[3.4rem] min-w-0 flex-1 items-center gap-3 rounded-[var(--radius)] px-2.5">
          <CoverArt
            src={track?.coverUrl}
            alt={track ? `Cover: ${track.title} von ${track.artist}` : ""}
            className="size-10 rounded-[3px]"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-wide text-[0.95rem] font-bold text-display-foreground">
              {track?.title ?? `${site.name} Livestream`}
            </p>
            <p className={cn("truncate font-dot text-[0.95rem] leading-tight", failed ? "text-danger" : "text-volt")}>
              {failed && error ? error : (track?.artist ?? site.tagline)}
            </p>
          </div>
          {show && (
            /* Zeigt auf den Sendeplan, solange es einen gibt — sonst auf den
               Player, wo die laufende Playlist ohnehin steht. */
            <Link
              href={features.schedule ? "/programm" : "/radio"}
              className="hidden shrink-0 flex-col items-end border-l border-white/10 pl-3 text-right md:flex"
            >
              <span className="font-meta text-display-muted">playlist</span>
              <span className="max-w-[14rem] truncate text-sm font-semibold text-display-foreground">
                {show.name}
              </span>
            </Link>
          )}
          {embedAllowed ? <LevelMeter /> : <LiveIndicator className="hidden sm:inline-flex" />}
        </div>

        <VolumeControl />
      </div>

      {/* Die einzige Live-Region fuer den Wiedergabestatus. */}
      <PlayerStatusLine className="sr-only" announce />
    </aside>
  );
}
