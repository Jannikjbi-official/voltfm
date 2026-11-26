/**
 * Was sich an der Website geaendert hat, fuer /neu.
 *
 * Von Hand gepflegt und aus der Git-Historie abgeleitet
 * (`git log --format='%ad %s' --date=short`). Nur, was Besucher sehen —
 * Umbauten im Hintergrund stehen hier nicht. Neueste zuerst.
 */
export type ChangelogEntry = {
  /** ISO-Datum (YYYY-MM-DD). */
  date: string;
  title: string;
  items: string[];
};

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-11-27",
    title: "Charts, Archiv und neue Seiten",
    items: [
      "Charts mit den meistgespielten Songs und Künstlern, gezählt ab jetzt.",
      "„Was lief wann“: das Archiv, welcher Song an welchem Tag lief.",
      "„Im Fokus“ stellt Leute aus Team und Community vor.",
      "Vergangene Events können einen Rückblick bekommen.",
      "Songwünsche und Bewerbungen laufen über das VoltFM-Portal.",
      "Neu: Overlay für Streamer, Medienkit auf der Presseseite, „Partner werden“ und „So geht's“.",
    ],
  },
  {
    date: "2026-11-26",
    title: "Redesign „Gerät“",
    items: [
      "Die ganze Seite sieht jetzt aus wie ein Radio zum Anfassen: Platten, Displays und Tasten, hell oder dunkel.",
      "Neue Partnerseiten: Streamer und Projekte, mit denen wir zusammenarbeiten, jeweils mit eigener Unterseite.",
      "Als erster Partner ist Toki dabei.",
      "Das Handy-Menü hat die richtige Breite.",
    ],
  },
  {
    date: "2026-11-23",
    title: "Ideen aus dem Discord",
    items: [
      "Vorschläge und Playlist-Ideen aus dem Discord erscheinen auf der Seite, sobald wir sie freigegeben haben.",
      "Neuer Discord-Link.",
      "Neue Beiträge werden im Discord angekündigt.",
    ],
  },
  {
    date: "2026-11-17",
    title: "Verzeichnis-Links",
    items: [
      "Auf der Radio-Seite stehen Links zu Radio-Verzeichnissen, bei denen VoltFM ebenfalls zu finden ist.",
    ],
  },
  {
    date: "2026-11-15",
    title: "Neues Design",
    items: [
      "Neuer Look für alle Seiten.",
      "Die Programmseite ist am Handy nicht mehr breiter als der Bildschirm.",
    ],
  },
  {
    date: "2026-11-14",
    title: "Meilensteine",
    items: [
      "Automatische Beiträge zu Hörerzahlen und zum Jahrestag.",
      "Der Beitrag „Zwei Wochen VoltFM in Zahlen“.",
      "Die Titelangaben von laut.fm werden zuverlässiger abgerufen.",
    ],
  },
  {
    date: "2026-11-13",
    title: "Bewerbungsportal",
    items: [
      "Unser eigenes Bewerbungsportal ist online, dazu ein Beitrag.",
      "Am Handy ist nichts mehr breiter als der Bildschirm, und Tippflächen sind größer.",
      "Im Footer steht ein „Made by“-Abzeichen.",
    ],
  },
  {
    date: "2026-10-27",
    title: "„Das Cover ist die Bühne“",
    items: ["Neue Startseite, neue Navigation und eine neue Schrift."],
  },
  {
    date: "2026-10-26",
    title: "Profile und Instagram",
    items: [
      "Moderatorenprofile neu gebaut: drei Aufbauten und eine eigene Farbe je Person.",
      "Unser Instagram-Profil ist verlinkt.",
      "Das Logo hat auf der Presseseite und im Browser-Tab keinen Hintergrund mehr.",
    ],
  },
  {
    date: "2026-10-25",
    title: "Webplayer, Playlist und neues Logo",
    items: [
      "Der Play-Knopf öffnet den Webplayer von lautstation.de.",
      "Die Playlist der letzten Tage steht direkt auf der Radio-Seite, der Sendeplan ist ein Link zu lautstation.de.",
      "Neues Logo: Play-Icon mit Blitz und Wortmarke.",
      "RadioAid 2026 als Event und Countdown auf der Startseite.",
      "News ohne Bild bekommen ein Titelbild nach Kategorie.",
      "Startseite und Unterseiten versprechen nur noch, was es gibt.",
    ],
  },
  {
    date: "2026-09-20",
    title: "Über uns und Beiträge",
    items: [
      "„Über uns“ überarbeitet, mit Zeitleiste bis heute und Hamburg als Ort.",
      "Beiträge über den Relaunch und die neue Seite.",
      "Vier Überläufe auf sehr schmalen Geräten behoben.",
      "Drei neue Seiten im Menü.",
    ],
  },
  {
    date: "2026-09-19",
    title: "Team, News und RadioAid",
    items: [
      "Moderatorenseite und News-Seite neu gestaltet, Profile mit mehr Inhalt.",
      "Der Sendeplan pausiert.",
      "RadioAid in der Navigation, mit eigenem Design und einer Zeitleiste der bisherigen Ausgaben.",
      "Neue Zeitleiste auf „Über uns“.",
      "Mobile Navigation repariert.",
    ],
  },
];
