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
 * Sie ist immer dunkel (Klasse `dark`), wie die Buehne: Der gelbe Knopf
 * steht so in beiden Modi auf Tinte.
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
      data-theme="dark"
      className="dark fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[color-mix(in_oklab,var(--ink)_92%,transparent)] pb-[env(safe-area-inset-bottom,0px)] text-foreground backdrop-blur-xl [--player-ring:var(--ink)]"
    >
      <div className="shell flex h-[var(--player-height)] items-center gap-3 sm:gap-4">
        <PlayButton />

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <CoverArt
            src={track?.coverUrl}
            alt={track ? `Cover: ${track.title} von ${track.artist}` : ""}
            className="size-11 rounded-md"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {track?.title ?? `${site.name} Livestream`}
            </p>
            <p className={cn("truncate text-sm", failed ? "text-danger" : "text-volt")}>
              {failed && error ? error : (track?.artist ?? site.tagline)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {show && (
            /* Zeigt auf den Sendeplan, solange es einen gibt — sonst auf den
               Player, wo die laufende Playlist ohnehin steht. */
            <Link
              href={features.schedule ? "/programm" : "/radio"}
              className="hidden flex-col items-end rounded-md text-right md:flex"
            >
              <span className="text-xs text-muted">Playlist</span>
              <span className="max-w-[14rem] truncate text-sm font-semibold">{show.name}</span>
            </Link>
          )}
          {embedAllowed ? (
            <LevelMeter />
          ) : (
            /* Am Handy steht "Live" schon gross auf der Buehne. */
            <LiveIndicator className="hidden sm:inline-flex" />
          )}
          <VolumeControl />
        </div>
      </div>

      {/* Die einzige Live-Region fuer den Wiedergabestatus. */}
      <PlayerStatusLine className="sr-only" announce />
    </aside>
  );
}
