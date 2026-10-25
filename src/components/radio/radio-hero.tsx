"use client";

import { ButtonLink } from "@/components/common/button-link";
import { Badge } from "@/components/ui/badge";
import { useRadioPlayer } from "./player-provider";
import { PlayButton, VolumeControl, PlayerStatusLine, StreamNotice } from "./player-controls";
import { CoverArt } from "./cover-art";
import { LiveIndicator } from "./live-indicator";
import { formatTime } from "@/lib/format";
import { Icon, ArrowRightIcon, DiscordIcon } from "@/lib/icons";
import { features, site } from "@/lib/site";
import styles from "./radio-hero.module.css";

/**
 * The homepage hero: station identity on the left, a live "what's on air"
 * panel on the right. Deliberately not a card grid — this is the one place the
 * page gets to be loud.
 */
export function RadioHero() {
  const { snapshot, embedAllowed } = useRadioPlayer();
  const track = snapshot?.nowPlaying;
  const current = snapshot?.currentShow;
  const next = snapshot?.nextShow;

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className="shell">
        <div className={styles.grid}>
          <div className={styles.intro}>
            <LiveIndicator />

            <h1 id="hero-title" className={styles.title}>
              Dein Sound.
              <br />
              Deine Community.
              <br />
              <span className={styles.titleAccent}>Dein Radio.</span>
            </h1>

            <p className={styles.lead}>
              Zwei Leute, ein Sender, seit 2021. Gerade läuft rund um die Uhr
              der Musikpool von laut.fm, wir arbeiten an mehr.
            </p>

            <div className={styles.actions}>
              {/* Ohne eingebetteten Player fuehrt der Knopf zu laut.fm und
                  sagt das selbst; mit Player bleibt es bei "Jetzt live hören". */}
              {embedAllowed ? (
                <>
                  <PlayButton size="lg" />
                  <div className={styles.actionText}>
                    <span className={styles.actionLabel}>Jetzt live hören</span>
                    <PlayerStatusLine />
                  </div>
                </>
              ) : (
                <PlayButton size="lg" withLabel />
              )}
            </div>

            <div className={styles.links}>
              {/* Solange der Sendeplan ruht, waere ein Verweis darauf ein
                  Angebot, hinter dem nichts steht. */}
              {features.schedule ? (
                <ButtonLink href="/programm" variant="neutral" mode="stroke" size="sm">
                  Sendeplan ansehen
                  <Icon icon={ArrowRightIcon} />
                </ButtonLink>
              ) : (
                <ButtonLink href="/radio" variant="neutral" mode="stroke" size="sm">
                  Was gerade läuft
                  <Icon icon={ArrowRightIcon} />
                </ButtonLink>
              )}
              <ButtonLink href={site.discordUrl} external variant="neutral" mode="ghost" size="sm">
                <Icon icon={DiscordIcon} />
                Discord
              </ButtonLink>
            </div>
          </div>

          <aside className={styles.panel} aria-label="Aktuell auf Sendung">
            <div className={styles.panelHead}>
              <span className={styles.panelLabel}>Läuft gerade</span>
              {current && <Badge mode="lighter" size="sm">{current.name}</Badge>}
            </div>

            <div className={styles.track}>
              <CoverArt
                src={track?.coverUrl}
                alt={track ? `Cover: ${track.title} von ${track.artist}` : "VoltFM"}
                size={104}
                className={styles.trackCover}
              />
              <div className={styles.trackText}>
                <p className={styles.trackTitle}>{track?.title ?? "VoltFM Livestream"}</p>
                <p className={styles.trackArtist}>{track?.artist ?? "24/7 Musik"}</p>
                {track?.album && <p className={styles.trackAlbum}>{track.album}</p>}
              </div>
            </div>

            <div className={styles.volumeRow}>
              <VolumeControl />
            </div>

            <StreamNotice />

            <dl className={styles.facts}>
              {current && (
                <div className={styles.fact}>
                  <dt>Sendung</dt>
                  <dd>
                    {current.name}
                    {current.endsAt && (
                      <span className={styles.factMuted}> bis {formatTime(current.endsAt)} Uhr</span>
                    )}
                  </dd>
                </div>
              )}
              {/* "Als Nächstes" kommt aus dem Sendeplan. Solange der ruht, ist
                  die Angabe bestenfalls die naechste Playlist — als Ansage
                  einer kommenden Sendung waere sie schlicht falsch. */}
              {features.schedule && next && (
                <div className={styles.fact}>
                  <dt>Als Nächstes</dt>
                  <dd>
                    {next.name}
                    {next.startsAt && (
                      <span className={styles.factMuted}> ab {formatTime(next.startsAt)} Uhr</span>
                    )}
                  </dd>
                </div>
              )}
            </dl>

            {snapshot?.degraded && (
              <p className={styles.degraded}>
                Titelinformationen sind gerade nicht verfügbar — der Livestream
                läuft trotzdem.
              </p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
