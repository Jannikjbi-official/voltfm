import type { Metadata } from "next";

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
            <div id="playlist" className="relative mt-12 flex flex-col gap-4">
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
            className="self-start lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]"
          >
            <div className="surface-card flex flex-col gap-5 rounded-3xl p-5 sm:p-6">
              <h2 id="stream-info-title" className="text-lg font-bold tracking-tight text-foreground">
                Stream-Informationen
              </h2>

              {/* Angaben als Kacheln; die eine, die zaehlt, gelb. */}
              <dl className="grid grid-cols-2 gap-2">
                <InfoTile term="Sender" wide>
                  {site.name}
                </InfoTile>
                <InfoTile term="Motto" wide>
                  {site.tagline}
                </InfoTile>
                <InfoTile term="Genres" wide>
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    {site.genres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full bg-default px-2.5 py-0.5 text-xs font-medium text-foreground"
                      >
                        {genre}
                      </span>
                    ))}
                  </span>
                </InfoTile>
                <InfoTile term="Standort">Hamburg</InfoTile>
                <div className="flex min-w-0 flex-col gap-0.5 rounded-2xl bg-volt px-4 py-3 text-ink">
                  <dt className="text-xs text-ink/70">Verfügbarkeit</dt>
                  <dd className="font-mono text-lg font-semibold">24 / 7</dd>
                </div>
              </dl>

              <div className="grid grid-cols-2 gap-2">
                <ButtonLink href={site.discordUrl} external size="sm" fullWidth>
                  <Icon icon={DiscordIcon} />
                  Discord
                </ButtonLink>
                <ButtonLink href={lautstation.scheduleUrl} external variant="secondary" size="sm" fullWidth>
                  Sendeplan
                  <Icon icon={ExternalLinkIcon} />
                </ButtonLink>
              </div>
              <p className="text-xs leading-relaxed text-muted">
                Der Sendeplan zeigt, welche Playlist wann läuft, und öffnet sich bei{" "}
                {lautstation.name} in einem neuen Tab.
              </p>

              {directoryLinks.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-separator pt-4">
                  <h3 className="text-sm font-bold text-foreground">Auch zu finden bei</h3>
                  {/* Reine Links, kein Player und kein Bild von dort (src/lib/listings.ts). */}
                  <ul className="flex flex-wrap gap-2">
                    {directoryLinks.map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 rounded-full bg-default px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-volt hover:text-ink"
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

/** Eine Angabe im Kasten rechts: Bezeichnung klein, Wert darunter. */
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
      className={
        wide
          ? "col-span-2 flex min-w-0 flex-col gap-0.5 rounded-2xl bg-surface-secondary px-4 py-3"
          : "flex min-w-0 flex-col gap-0.5 rounded-2xl bg-surface-secondary px-4 py-3"
      }
    >
      <dt className="text-xs text-muted">{term}</dt>
      <dd className="font-semibold break-words text-foreground">{children}</dd>
    </div>
  );
}
