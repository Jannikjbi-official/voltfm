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

/**
 * Die Buehne: immer dunkel, egal welcher Modus gewaehlt ist (Klasse `dark`
 * und data-theme — HeroUI und die eigenen Tokens schalten damit fuer diesen
 * Abschnitt auf Tinte). Gross der laufende Titel, der Interpret in Gelb, das
 * Cover, dahinter dasselbe Cover weichgezeichnet, und der gelbe Knopf.
 *
 * Dieselbe Buehne steht auf der Startseite und auf /radio. Die `h1` ist die
 * kleine Zeile ueber dem Titel (`heading`) — der Songtitel selbst ist keine
 * Ueberschrift: Er wechselt alle drei Minuten, und eine wechselnde `h1` ist
 * fuer Screenreader und Suchmaschinen gleichermassen schlecht.
 */
export function CoverStage({ heading }: { heading: string }) {
  const { snapshot, embedAllowed, isPlaying, status } = useRadioPlayer();
  const track = snapshot?.nowPlaying;
  const show = snapshot?.currentShow;
  const genres = site.genres.join(", ").replace(/, ([^,]*)$/, " und $1");

  return (
    <section
      aria-labelledby="stage-heading"
      data-theme="dark"
      className="dark relative isolate overflow-hidden bg-ink text-foreground"
    >
      <CoverBackdrop src={track?.coverUrl} />

      <div className="shell relative grid items-center gap-10 pt-10 pb-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14 md:pt-16 md:pb-20 lg:gap-20">
        <div className="mx-auto w-full max-w-[20rem] sm:max-w-sm md:max-w-none">
          <CoverArt
            src={track?.coverUrl}
            alt={track ? `Cover: ${track.title} von ${track.artist}` : ""}
            size="large"
            eager
            className="w-full rounded-2xl shadow-[0_32px_80px_-24px_rgba(0,0,0,0.85)] ring-1 ring-white/10"
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-3">
            <LiveIndicator />
            <h1 id="stage-heading" className="font-wide text-sm font-semibold text-paper/80">
              {heading}
            </h1>
          </div>

          <div className="mt-8">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span>Läuft gerade</span>
              {show && (
                <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-xs text-paper/85">
                  Playlist {show.name}
                </span>
              )}
            </p>
            <p className="mt-3 font-display text-[2.5rem] leading-[0.95] text-balance break-words text-paper sm:text-6xl lg:text-7xl">
              {track?.title ?? `${site.name} Livestream`}
            </p>
            <p className="mt-4 text-xl font-semibold text-volt sm:text-2xl">
              {track?.artist ?? "Musik rund um die Uhr"}
            </p>
            {track?.album && (
              <p className="mt-1 text-sm text-muted">
                {track.album}
                {track.releaseYear ? ` (${track.releaseYear})` : ""}
              </p>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-3">
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
                  <PlayerStatusLine />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <PlayButton size="lg" withLabel />
                </div>
                {/* Vor dem Klick sagen, wohin er fuehrt — der Knopf verlaesst
                    die Seite, statt hier etwas abzuspielen. */}
                <p className="text-sm text-muted">
                  Öffnet den Webplayer von {radio.externalName} in einem neuen Fenster.
                </p>
              </>
            )}
          </div>

          <p className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-paper/75">
            Rund um die Uhr {genres}, im Moment aus dem Musikpool von {radio.providerName}.
            Aus Hamburg, seit {site.foundedYear}.
          </p>

          <div className="mt-4 flex flex-col items-start gap-3 empty:hidden">
            <VolumeControl />
            <AlsoListenLink />
            <StreamNotice />
          </div>

          {snapshot?.degraded && (
            <p className="mt-4 text-sm text-muted">
              Titelinformationen sind gerade nicht verfügbar. Der Livestream läuft trotzdem.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
