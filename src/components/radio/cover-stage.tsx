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
import { LogoIcon } from "@/components/layout/logo";
import { CoverArt } from "./cover-art";
import { LiveIndicator } from "./live-indicator";

/**
 * Die Buehne: eine grosse gelbe Karte mit Tinte darauf, oben der laufende
 * Titel als Laufband, darunter Titel und Interpret gross, daneben das Cover.
 * Keine Weichzeichner, kein Leuchten.
 *
 * Gelb und Tinte sind hier fest — in beiden Modi. Dieselbe Buehne steht auf
 * der Startseite und auf /radio.
 *
 * Die `h1` ist die Zeile im Laufband (`heading`). Der Songtitel selbst ist
 * keine Ueberschrift: Er wechselt alle drei Minuten, und eine wechselnde `h1`
 * ist fuer Screenreader und Suchmaschinen gleichermassen schlecht.
 */
export function CoverStage({ heading }: { heading: string }) {
  const { snapshot, embedAllowed, isPlaying, status } = useRadioPlayer();
  const track = snapshot?.nowPlaying;
  const show = snapshot?.currentShow;
  const genres = site.genres.join(", ").replace(/, ([^,]*)$/, " und $1");

  return (
    <section aria-labelledby="stage-heading" className="shell pt-6 sm:pt-8">
      <div className="overflow-hidden rounded-[2rem] bg-volt text-ink shadow-[var(--lift-shadow)]">
        {/* Kopfzeile mit Live-Punkt und dem Laufband darunter */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 pt-5 sm:px-8 sm:pt-7">
          <LiveIndicator className="bg-ink text-volt" />
          <h1 id="stage-heading" className="text-sm font-bold">
            {heading}
          </h1>
          {show && (
            <span className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold sm:ml-auto">
              Playlist {show.name}
            </span>
          )}
        </div>

        <Marquee text={track ? `${track.title} — ${track.artist}` : `${site.name} Livestream`} />

        <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-10 lg:p-10">
          <div className="flex min-w-0 flex-col justify-between gap-10">
            <div>
              <p className="font-mono text-xs text-ink/70">Läuft gerade</p>
              <p className="mt-3 font-display text-[2.9rem] text-balance break-words sm:text-6xl lg:text-[5.5rem]">
                {track?.title ?? `${site.name} Livestream`}
              </p>
              <p className="mt-4 text-xl font-bold sm:text-2xl">{track?.artist ?? "Musik rund um die Uhr"}</p>
              {track?.album && (
                <p className="mt-1 text-sm text-ink/65">
                  {track.album}
                  {track.releaseYear ? ` (${track.releaseYear})` : ""}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {embedAllowed ? (
                <div className="flex items-center gap-4">
                  <PlayButton size="lg" />
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-2 text-lg font-bold">
                      {status === "connecting"
                        ? "Verbinde …"
                        : isPlaying
                          ? "Du hörst VoltFM"
                          : "Jetzt live hören"}
                      <LevelMeter />
                    </span>
                    <PlayerStatusLine className="text-ink/75" />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <PlayButton size="lg" withLabel />
                  </div>
                  {/* Vor dem Klick sagen, wohin er fuehrt — der Knopf verlaesst
                      die Seite, statt hier etwas abzuspielen. */}
                  <p className="text-sm text-ink/70">
                    Öffnet den Webplayer von {radio.externalName} in einem neuen Fenster.
                  </p>
                </>
              )}

              <div className="flex flex-col items-start gap-3 empty:hidden">
                <VolumeControl />
                <AlsoListenLink className="text-ink/75 hover:text-ink" />
                <StreamNotice />
              </div>
            </div>
          </div>

          <div className="relative">
            <CoverArt
              src={track?.coverUrl}
              alt={track ? `Cover: ${track.title} von ${track.artist}` : ""}
              size="large"
              eager
              className="aspect-square w-full rounded-3xl shadow-[0_32px_64px_-28px_rgba(14,15,18,0.65)] ring-1 ring-ink/10"
            />
          </div>
        </div>

        <p className="px-5 pb-6 text-sm text-ink/70 sm:px-8 lg:px-10 lg:pb-8">
          Rund um die Uhr {genres}, im Moment aus dem Musikpool von {radio.providerName}.
          Aus Hamburg, seit {site.foundedYear}.
          {snapshot?.degraded && (
            <> Titelinformationen sind gerade nicht verfügbar. Der Livestream läuft trotzdem.</>
          )}
        </p>
      </div>
    </section>
  );
}

/**
 * Das Laufband: der laufende Titel in Gelb auf Tinte, endlos. Rein
 * dekorativ (aria-hidden) — Titel und Interpret stehen darunter noch einmal
 * als Text. Bei reduzierter Bewegung steht es still.
 */
function Marquee({ text }: { text: string }) {
  const items = Array.from({ length: 4 }, (_, index) => index);
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((index) => (
        <span key={index} className="flex items-center">
          <span className="px-6 font-display text-2xl whitespace-nowrap sm:text-3xl">{text}</span>
          <LogoIcon className="h-5 w-auto [--logo-mark:var(--ink)]" />
        </span>
      ))}
    </div>
  );

  return (
    <div aria-hidden="true" className="mt-5 overflow-hidden border-y border-ink/15 py-3">
      <div className="flex w-max animate-[vfm-marquee_38s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row}
        {row}
      </div>
    </div>
  );
}
