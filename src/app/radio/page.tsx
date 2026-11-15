import type { Metadata } from "next";

import { SectionHeader } from "@/components/common/section-header";
import { ButtonLink } from "@/components/common/button-link";
import { CoverStage } from "@/components/radio/cover-stage";
import { RecentTracks } from "@/components/radio/recent-tracks";
import { LautstationPlaylist } from "@/components/radio/lautstation-playlist";
import { Icon, DiscordIcon, ExternalLinkIcon } from "@/lib/icons";
import { lautstation } from "@/lib/lautstation";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Radio",
  description:
    "Der VoltFM Livestream: höre rund um die Uhr, sieh was gerade läuft und was als Nächstes kommt.",
  alternates: { canonical: "/radio" },
};

export const revalidate = 60;

export default function RadioPage() {
  return (
    <>
      {/* Dieselbe Buehne wie auf der Startseite — die Seite ist der Player. */}
      <CoverStage heading="VoltFM hören" />

      <section className="shell py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-16">
          <div className="min-w-0">
            <SectionHeader title="Was gerade lief" />

            {/* Ein Abschnitt, eine Liste: oben die letzten zehn Titel live aus
                dem Metadaten-Abruf, darunter als Fortsetzung die ganze Playlist
                der letzten Tage. */}
            <RecentTracks
              limit={10}
              emptyText="Die Metadaten von laut.fm sind gerade nicht erreichbar. Der Stream läuft trotzdem."
            />

            {/* Lag kurz auf einer eigenen Seite; /radio/playlist leitet
                hierher um (next.config.ts). */}
            <div id="playlist" className="mt-12 flex flex-col gap-4">
              <LautstationPlaylist station={site.station} />
              <p className="text-sm text-muted">
                Daten:{" "}
                <a
                  href={lautstation.stationUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 rounded-sm font-medium text-foreground underline underline-offset-4"
                >
                  {lautstation.name}
                  <Icon icon={ExternalLinkIcon} className="text-[0.7em]" />
                </a>
                , ein privates Verzeichnis für laut.fm-Stationen. Es gehört weder zu
                VoltFM noch zu laut.fm.
              </p>
            </div>
          </div>

          <aside className="flex flex-col gap-5 self-start rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
            <h2 className="font-wide text-lg font-bold text-foreground">Stream-Informationen</h2>

            <dl className="flex flex-col divide-y divide-separator text-sm">
              {[
                ["Sender", site.name],
                ["Motto", site.tagline],
                ["Genres", site.genres.join(", ")],
                ["Standort", "Hamburg"],
                ["Verfügbarkeit", "24 / 7"],
              ].map(([term, value]) => (
                <div key={term} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-muted">{term}</dt>
                  <dd className="text-right font-semibold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap gap-2">
              <ButtonLink href={site.discordUrl} external size="sm">
                <Icon icon={DiscordIcon} />
                Discord
              </ButtonLink>
              <ButtonLink href={lautstation.scheduleUrl} external variant="outline" size="sm">
                Sendeplan
                <Icon icon={ExternalLinkIcon} />
              </ButtonLink>
            </div>
            <p className="text-xs leading-relaxed text-muted">
              Der Sendeplan zeigt, welche Playlist wann läuft, und öffnet sich bei{" "}
              {lautstation.name} in einem neuen Tab.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
