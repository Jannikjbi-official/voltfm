import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { getPlaylistDays, lautstation, type PlaylistDay } from "@/services/radio/lautstation";
import { Icon, ExternalLinkIcon } from "@/lib/icons";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Playlist",
  description: "Was bei VoltFM in den letzten Tagen lief, Titel für Titel.",
  alternates: { canonical: "/radio/playlist" },
};

const TZ = "Europe/Berlin";

/** "2026-10-25" in Senderzeit — so liefert lautstation.de die Tage. */
function stationDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date);
}

/** Mittags UTC, damit der Wochentag in keiner Zeitzone verrutscht. */
function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

function dayLabel(key: string, today: string, yesterday: string): string {
  if (key === today) return "Heute";
  if (key === yesterday) return "Gestern";
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: TZ,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(fromDateKey(key));
}

function longDate(key: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(fromDateKey(key));
}

/** "Interpret - Titel" in zwei Zeilen, wie in der Titelhistorie auf /radio. */
function splitSong(song: string): { title: string; artist: string | null } {
  const at = song.indexOf(" - ");
  if (at <= 0) return { title: song, artist: null };
  return { title: song.slice(at + 3), artist: song.slice(0, at) };
}

export default async function PlaylistPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const [{ tag }, days] = await Promise.all([searchParams, getPlaylistDays()]);

  const now = new Date();
  const today = stationDate(now);
  const yesterday = stationDate(new Date(now.getTime() - 86_400_000));

  // Ohne Auswahl der juengste Tag; ein unbekannter Tag faellt ebenfalls darauf zurueck.
  const selected: PlaylistDay | undefined =
    days?.find((day) => day.date === tag) ?? days?.[days.length - 1];

  return (
    <>
      <PageHeader
        eyebrow="Playlist"
        title="Was lief wann"
        description="Jeder Titel der letzten Tage, mit Uhrzeit. Wähl oben einen Tag aus."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/radio", label: "Radio" },
          { href: "/radio/playlist", label: "Playlist" },
        ]}
      />

      <section className="section shell">
        {!days || !selected ? (
          <EmptyState
            title="Die Playlist ist gerade nicht erreichbar"
            description={`Die Daten kommen von ${lautstation.name}, und die Seite antwortet im Moment nicht. Die letzten Titel stehen trotzdem auf der Radio-Seite.`}
          />
        ) : (
          <div className={styles.layout}>
            <nav className={styles.days} aria-label="Tag auswählen">
              {/* Neuester Tag zuerst: Meist will man wissen, was eben lief. */}
              {[...days].reverse().map((day) => (
                <Link
                  key={day.date}
                  href={`/radio/playlist?tag=${day.date}`}
                  className={styles.day}
                  aria-current={day.date === selected.date ? "page" : undefined}
                  scroll={false}
                >
                  {dayLabel(day.date, today, yesterday)}
                </Link>
              ))}
            </nav>

            <h2 className={styles.heading}>
              {longDate(selected.date)}
              <span className={styles.count}>{selected.tracks.length} Titel</span>
            </h2>

            <ol className={styles.list} role="list">
              {selected.tracks.map((track, index) => {
                const { title, artist } = splitSong(track.song);
                return (
                  <li key={`${track.time}-${index}`} className={styles.item}>
                    <span className={styles.time}>{track.time || "—"}</span>
                    <span className={styles.text}>
                      <span className={styles.title}>{title}</span>
                      {artist && <span className={styles.artist}>{artist}</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

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
