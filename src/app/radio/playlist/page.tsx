import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { LautstationPlaylist } from "@/components/radio/lautstation-playlist";
import { lautstation } from "@/lib/lautstation";
import { site } from "@/lib/site";
import { Icon, ExternalLinkIcon } from "@/lib/icons";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Playlist",
  description: "Was bei VoltFM in den letzten Tagen lief, Titel für Titel.",
  alternates: { canonical: "/radio/playlist" },
};

export default function PlaylistPage() {
  return (
    <>
      <PageHeader
        eyebrow="Playlist"
        title="Was lief wann"
        description="Jeder Titel der letzten Tage, mit Uhrzeit. Die kurze Liste steht auf der Radio-Seite, hier gibt es alles."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/radio", label: "Radio" },
          { href: "/radio/playlist", label: "Playlist" },
        ]}
      />

      <section className="section shell">
        <LautstationPlaylist station={site.station} />

        <p className={styles.source}>
          Daten:{" "}
          <a href={lautstation.stationUrl} target="_blank" rel="noreferrer noopener">
            {lautstation.name}
            <Icon icon={ExternalLinkIcon} />
          </a>
          , ein privates Verzeichnis für laut.fm-Stationen. Es gehört weder zu
          VoltFM noch zu laut.fm.
        </p>
      </section>
    </>
  );
}
