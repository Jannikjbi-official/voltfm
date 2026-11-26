import type { Metadata } from "next";
import { cn } from "@heroui/react";

import { SectionHeader } from "@/components/common/section-header";
import { ButtonLink } from "@/components/common/button-link";
import { CoverStage } from "@/components/radio/cover-stage";
import { RecentTracks } from "@/components/radio/recent-tracks";
import { LautstationPlaylist } from "@/components/radio/lautstation-playlist";
import { Icon, DiscordIcon, ExternalLinkIcon } from "@/lib/icons";
import { lautstation } from "@/lib/lautstation";
import { site } from "@/lib/site";
import { getDirectoryLinks } from "@/services/settings/listings";

export const metadata: Metadata = {
  title: "Radio",
  description:
    "Der VoltFM Livestream: höre rund um die Uhr, sieh was gerade läuft und was als Nächstes kommt.",
  alternates: { canonical: "/radio" },
};

export const revalidate = 60;

export default async function RadioPage() {
  // Gepflegt unter Admin → Einstellungen → Verzeichnisse.
  const directoryLinks = await getDirectoryLinks();

  return (
    <>
      {/* Dieselbe Buehne wie auf der Startseite — die Seite ist der Player. */}
      <CoverStage heading="VoltFM hören" />

      <section className="shell pt-12 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-2">
          <div className="min-w-0 lg:pr-6">
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
            <div id="playlist" className="relative mt-2 flex flex-col gap-3">
              <LautstationPlaylist station={site.station} />
              <p className="px-1 text-xs leading-relaxed text-muted">
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

          <aside
            aria-labelledby="stream-info-title"
            className="self-start lg:sticky lg:top-[calc(var(--header-height)+1rem)]"
          >
            <div className="surface-card flex flex-col gap-2 rounded-[var(--radius)] p-2">
              <h2 id="stream-info-title" className="px-2 pt-2 pb-1 font-meta text-muted">
                Stream-Informationen
              </h2>

              {/* Das, was zaehlt, als Display; der Rest in Mulden. */}
              <div className="display-panel display-dots rounded-[var(--radius)] px-4 py-4">
                <dl className="flex flex-col gap-2">
                  <dt className="flex items-center gap-2 font-meta text-display-muted">
                    <span aria-hidden="true" className="led" />
                    Verfügbarkeit
                  </dt>
                  <dd className="font-dot text-4xl leading-none text-volt">24/7</dd>
                </dl>
              </div>

              <dl className="grid grid-cols-2 gap-2">
                <InfoTile term="Sender">{site.name}</InfoTile>
                <InfoTile term="Standort">Hamburg</InfoTile>
                <InfoTile term="Motto" wide>
                  {site.tagline}
                </InfoTile>
                <InfoTile term="Genres" wide>
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    {site.genres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-[3px] bg-surface px-2 py-0.5 font-mono text-[0.7rem] font-semibold lowercase text-foreground ring-1 ring-border"
                      >
                        {genre}
                      </span>
                    ))}
                  </span>
                </InfoTile>
              </dl>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <ButtonLink href={site.discordUrl} external size="sm" fullWidth>
                  <Icon icon={DiscordIcon} />
                  Discord
                </ButtonLink>
                <ButtonLink href={lautstation.scheduleUrl} external variant="secondary" size="sm" fullWidth>
                  Sendeplan
                  <Icon icon={ExternalLinkIcon} />
                </ButtonLink>
              </div>
              <p className="px-2 pt-1 text-xs leading-relaxed text-muted">
                Der Sendeplan zeigt, welche Playlist wann läuft, und öffnet sich bei{" "}
                {lautstation.name} in einem neuen Tab.
              </p>

              {directoryLinks.length > 0 && (
                <div className="mt-1 flex flex-col gap-3 border-t border-separator px-2 pt-4 pb-2">
                  <h3 className="font-meta text-muted">Auch zu finden bei</h3>
                  {/* Reine Links, kein Player und kein Bild von dort (src/lib/listings.ts). */}
                  <ul className="flex flex-wrap gap-2">
                    {directoryLinks.map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="key inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-surface px-3 py-1.5 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-volt hover:text-graphite"
                        >
                          {link.name}
                          <Icon icon={ExternalLinkIcon} className="text-[0.65em] opacity-60" />
                          <span className="sr-only"> (öffnet einen neuen Tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

/** Eine Angabe im Kasten rechts: Beschriftung klein, Wert darunter, in einer Mulde. */
function InfoTile({
  term,
  wide = false,
  children,
}: {
  term: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "well flex min-w-0 flex-col gap-0.5 rounded-[var(--radius)] px-3 py-2.5",
        wide && "col-span-2",
      )}
    >
      <dt className="font-meta text-muted">{term}</dt>
      <dd className="font-semibold break-words text-foreground">{children}</dd>
    </div>
  );
}
