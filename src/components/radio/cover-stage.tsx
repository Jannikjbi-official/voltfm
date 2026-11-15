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
import { LiveIndicator } from "./live-indicator";

/**
 * Die Buehne als Plakat: ein gelber Block mit Tinte darauf, der laufende Titel
 * gross und schmal gesetzt, daneben das Cover mit harter Kante. Oben ein
 * Streifen wie ein Laufband. Keine Weichzeichner, kein Leuchten.
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
    <section aria-labelledby="stage-heading" className="shell pt-6 sm:pt-10">
      <div className="border-2 border-border bg-volt text-ink">
        {/* Laufband */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-ink bg-ink px-4 py-2 text-paper sm:px-6">
          <LiveIndicator className="bg-volt text-ink" />
          <h1 id="stage-heading" className="font-wide text-sm font-bold">
            {heading}
          </h1>
          {show && (
            <span className="font-mono text-xs text-paper/75 sm:ml-auto">Playlist {show.name}</span>
          )}
        </div>

        <div className="grid md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="flex min-w-0 flex-col justify-between gap-10 p-5 sm:p-8 lg:p-10">
            <div>
              <p className="font-mono text-xs">Läuft gerade</p>
              <p className="mt-3 font-display text-[3.25rem] text-balance break-words sm:text-7xl lg:text-[6.5rem]">
                {track?.title ?? `${site.name} Livestream`}
              </p>
              <p className="mt-4 font-wide text-xl font-bold sm:text-2xl">
                {track?.artist ?? "Musik rund um die Uhr"}
              </p>
              {track?.album && (
                <p className="mt-1 font-mono text-xs text-ink/70">
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
                    <span className="inline-flex items-center gap-2 font-wide text-lg font-bold">
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
                  <p className="text-sm text-ink/75">
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

          <div className="border-t-2 border-ink md:border-t-0 md:border-l-2">
            <CoverArt
              src={track?.coverUrl}
              alt={track ? `Cover: ${track.title} von ${track.artist}` : ""}
              size="large"
              eager
              className="w-full"
            />
          </div>
        </div>

        <p className="border-t-2 border-ink px-5 py-3 text-sm sm:px-8 lg:px-10">
          Rund um die Uhr {genres}, im Moment aus dem Musikpool von {radio.providerName}.
          Aus Hamburg, seit {site.foundedYear}.
        </p>

        {snapshot?.degraded && (
          <p className="border-t-2 border-ink px-5 py-3 text-sm sm:px-8 lg:px-10">
            Titelinformationen sind gerade nicht verfügbar. Der Livestream läuft trotzdem.
          </p>
        )}
      </div>
    </section>
  );
}
