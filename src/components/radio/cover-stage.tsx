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
 * Die Buehne ist das Geraet selbst: links ein grosses schwarzes Display mit
 * Punktmatrix-Laufschrift, Titel und Interpret, rechts das Cover in seinem
 * Fenster und darunter die gelbe Taste zum Hoeren. Drumherum das Gehaeuse
 * mit Beschriftung und Signal-LED.
 *
 * Dieselbe Buehne steht auf der Startseite und auf /radio.
 *
 * Die `h1` ist die Zeile oben am Gehaeuse (`heading`). Der Songtitel selbst
 * ist keine Ueberschrift: Er wechselt alle drei Minuten, und eine wechselnde
 * `h1` ist fuer Screenreader und Suchmaschinen gleichermassen schlecht.
 */
export function CoverStage({ heading }: { heading: string }) {
  const { snapshot, embedAllowed, isPlaying, status } = useRadioPlayer();
  const track = snapshot?.nowPlaying;
  const show = snapshot?.currentShow;
  const genres = site.genres.join(", ").replace(/, ([^,]*)$/, " und $1");

  return (
    <section aria-labelledby="stage-heading" className="shell pt-2">
      <div className="surface-card rounded-[var(--radius)] p-2 sm:p-3">
        {/* Beschriftung am Gehaeuse */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-2 pt-1 pb-3 sm:px-3">
          <LiveIndicator label="on air" className="text-foreground" />
          <h1 id="stage-heading" className="font-meta text-muted">
            {heading}
          </h1>
          {show && <span className="font-meta text-muted sm:ml-auto">playlist / {show.name}</span>}
        </div>

        <div className="grid gap-2 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          {/* Das Display */}
          <div className="display-panel display-dots flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-[var(--radius)] sm:min-h-[26rem]">
            <DotTicker text={track ? `${track.title} – ${track.artist}` : `${site.name} live`} />

            <div className="px-5 pb-6 sm:px-8 sm:pb-8">
              <p className="font-meta text-display-muted">läuft gerade</p>
              <p className="mt-3 font-display text-[2.6rem] text-balance break-words text-display-foreground sm:text-6xl lg:text-[5rem]">
                {track?.title ?? `${site.name} Livestream`}
              </p>
              <p className="mt-3 font-dot text-2xl text-volt sm:text-3xl">{track?.artist ?? "rund um die uhr"}</p>
              {track?.album && (
                <p className="mt-2 text-sm text-display-muted">
                  {track.album}
                  {track.releaseYear ? ` (${track.releaseYear})` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Cover-Fenster und Bedienfeld */}
          <div className="flex flex-col gap-2">
            <div className="well rounded-[var(--radius)] p-2">
              <CoverArt
                src={track?.coverUrl}
                alt={track ? `Cover: ${track.title} von ${track.artist}` : ""}
                size="large"
                eager
                className="aspect-square w-full rounded-[3px]"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between gap-4 rounded-[var(--radius)] border border-border p-4">
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
                    <PlayerStatusLine />
                  </div>
                </div>
              ) : (
                <>
                  <PlayButton size="lg" withLabel />
                  {/* Vor dem Klick sagen, wohin er fuehrt — der Knopf verlaesst
                      die Seite, statt hier etwas abzuspielen. */}
                  <p className="text-sm text-muted">
                    Öffnet den Webplayer von {radio.externalName} in einem neuen Fenster.
                  </p>
                </>
              )}

              <div className="flex flex-col items-start gap-3 empty:hidden">
                <VolumeControl />
                <AlsoListenLink />
                <StreamNotice />
              </div>
            </div>
          </div>
        </div>

        <p className="px-2 pt-3 pb-1 text-sm text-muted sm:px-3">
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
 * Laufschrift in Punktmatrix oben im Display: der laufende Titel, endlos.
 * Rein dekorativ (aria-hidden) — Titel und Interpret stehen darunter noch
 * einmal als Text. Bei reduzierter Bewegung steht sie still.
 */
function DotTicker({ text }: { text: string }) {
  const items = Array.from({ length: 4 }, (_, index) => index);
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((index) => (
        <span key={index} className="flex items-center">
          <span className="px-6 font-dot text-xl whitespace-nowrap text-volt sm:text-2xl">{text}</span>
          <LogoIcon className="h-4 w-auto [--logo-mark:var(--volt)]" />
        </span>
      ))}
    </div>
  );

  return (
    <div aria-hidden="true" className="overflow-hidden border-b border-white/10 py-3">
      <div className="flex w-max animate-[vfm-marquee_38s_linear_infinite] motion-reduce:animate-none">
        {row}
        {row}
      </div>
    </div>
  );
}
