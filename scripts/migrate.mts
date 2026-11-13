/**
 * Datenbank-Migrationen.
 *
 * Laeuft automatisch bei jedem Deploy (siehe `vercel-build` in package.json)
 * und laesst sich jederzeit von Hand anstossen: `npm run migrate`.
 *
 * Regeln, an die sich jede Migration hier halten muss:
 *
 *  1. **Genau einmal.** Jede Migration hat einen Namen, der nach dem Lauf in der
 *     Sammlung `migrations` vermerkt wird. Was dort steht, wird nie wieder
 *     ausgefuehrt.
 *  2. **Nichts ueberschreiben, was ein Mensch gepflegt hat.** Neue Datensaetze
 *     anlegen ist in Ordnung; bestehende nur dort anfassen, wo nachweislich noch
 *     der urspruenglich eingespielte Wert steht.
 *  3. **Nichts loeschen.** Loeschen passiert im Admin, nicht im Deploy.
 *
 * Neue Migration: unten an `MIGRATIONS` anhaengen, nie eine bestehende
 * umbenennen oder dazwischenschieben — der Name ist der Schluessel.
 */
import { config } from "dotenv";
import { MongoClient, type Db } from "mongodb";

import { renderRichText } from "../src/lib/sanitize";
import { radioaid, getRadioAidSchedule } from "../src/lib/radioaid";
import { formatDayMonth, formatTime } from "../src/lib/format";
import {
  RELAUNCH_ARTICLE,
  WEBSEITE_ARTICLE,
  RADIOAID_2026_ARTICLE,
  UPDATE_OKTOBER_2026_ARTICLE,
} from "./artikel.mjs";

// Eine bereits gesetzte Umgebungsvariable gewinnt gegen die Dateien (Vercel).
config({ path: ".env.local" });
config({ path: ".env" });

const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.gg/6JzSsUTWuh";

interface Migration {
  name: string;
  run: (db: Db, now: Date) => Promise<string>;
}

/* --- Hilfen --------------------------------------------------------------- */

/** Legt an, was fehlt, und laesst Bestehendes unberuehrt. */
async function insertMissing(
  db: Db,
  collection: string,
  key: string,
  docs: Record<string, unknown>[],
  now: Date,
): Promise<number> {
  let created = 0;
  for (const doc of docs) {
    const result = await db.collection(collection).updateOne(
      { [key]: doc[key] },
      { $setOnInsert: { ...doc, createdAt: now, updatedAt: now } },
      { upsert: true },
    );
    if (result.upsertedCount) created++;
  }
  return created;
}

/* --- Inhalte -------------------------------------------------------------- */

const CATEGORIES = [
  { slug: "news", name: "News", description: "Alles Neue aus dem Sender.", hue: 0, order: 1 },
  { slug: "musik", name: "Musik", description: "Releases, Charts und Entdeckungen.", hue: 40, order: 2 },
  { slug: "radio", name: "Radio", description: "Technik, Sendungen und Blicke hinter die Kulissen.", hue: -30, order: 3 },
  { slug: "community", name: "Community", description: "Was in unserem Discord passiert.", hue: 80, order: 4 },
  { slug: "events", name: "Events", description: "Specials, Livestreams und Aktionen.", hue: 120, order: 5 },
  { slug: "in-eigener-sache", name: "In eigener Sache", description: "Entscheidungen, Umbauten und alles, was den Sender selbst betrifft.", hue: 300, order: 10 },
  { slug: "hinter-den-kulissen", name: "Hinter den Kulissen", description: "Wie das Programm entsteht — Studio, Technik und Redaktion.", hue: 20, order: 11 },
  { slug: "sendeplan", name: "Sendeplan", description: "Änderungen am Programm und neue Sendungen.", hue: 60, order: 12 },
  { slug: "playlist", name: "Playlist", description: "Was rotiert, was neu dazukommt und warum.", hue: 340, order: 13 },
];

const TIMELINE = [
  {
    key: "start-2021",
    year: "Jan 2021",
    kicker: "Der Anfang",
    title: "Jemand drückt auf Play",
    text: "Jannik legt eine laut.fm-Station an — damals noch als jannikjbiFM, aus dem Jugendzimmer in Hamburg. Kein Konzept, kein Sendeplan, keine Hörer. Mochiko ist von der ersten Stunde an dabei.",
    current: false,
    order: 10,
  },
  {
    key: "namenssuche",
    year: "danach",
    kicker: "Die Namenssuche",
    title: "Wie heißt das hier eigentlich?",
    text: "Aus jannikjbiFM wird ein anderer Name, und noch einer, und noch einer. Ausprobiert und wieder verworfen — weil damals schlicht nicht klar war, was bei Hörern ankommt. Geblieben ist am Ende VoltFM. Und die Station-ID jannikjbi, die bis heute im Stream steht.",
    current: false,
    order: 20,
  },
  {
    key: "radioaid-2022",
    year: "2022",
    kicker: "Zum ersten Mal RadioAid",
    title: "Radio, das etwas bewirkt",
    text: "Die Station überträgt zum ersten Mal RadioAid, die 24-stündige Charity-Sendung der laut.fm-Community — in dem Jahr zugunsten der Tafeln Deutschland. Seitdem gehört das zum festen Jahresablauf.",
    current: false,
    order: 30,
  },
  {
    key: "radioaid-2023-2025",
    year: "2023–2025",
    kicker: "Jedes Jahr wieder",
    title: "Drei Ausgaben, drei Organisationen",
    text: "Deutsche Depressionshilfe, Ambulantes Kinderhospiz München, Hamburger Kinderwünsche. Jedes Jahr 24 Stunden Programm, das nicht uns gehört, sondern einem guten Zweck.",
    href: "/radioaid",
    linkLabel: "Alle Ausgaben ansehen",
    current: false,
    order: 40,
  },
  {
    key: "plattform-2026",
    year: "2026",
    kicker: "Die eigene Plattform",
    title: "VoltFM bekommt ein Zuhause",
    text: "Eine eigene Website statt einer Seite von der Stange: Moderatorenprofile, News, Events — und ein Player, der beim Seitenwechsel nicht abbricht.",
    current: false,
    order: 50,
  },
];

/**
 * Was 2026 noch dazukam.
 *
 * Getrennt gehalten, weil Migration 005 die Zeitleiste bereits angelegt hat
 * und nichts anfassen darf, was seitdem im Admin gepflegt wurde.
 */
const TIMELINE_2026 = [
  {
    key: "azuracast-august-2026",
    year: "Aug 2026",
    kicker: "Der Versuch",
    title: "Einmal alles selbst machen",
    text: "Wir bauen eine eigene Sendeinfrastruktur mit AzuraCast auf — zunächst als Test. Er zeigt vor allem, was so etwas kostet: der Server rund um die Uhr, GEMA und GVL als größter Posten, dazu die nötige Software. Wir gehen zurück auf die laut.fm-Station von 2021.",
    current: false,
    order: 60,
  },
  {
    key: "pause-september-2026",
    year: "3.–19. Sep 2026",
    kicker: "Fast Schluss",
    title: "Sechzehn Tage offline",
    text: "Die Webseite geht aus privaten Gründen vom Netz, und es steht ernsthaft zur Debatte, VoltFM zu beenden. Der Stream läuft weiter. Am Ende fällt die Entscheidung anders — und statt die alte Seite wieder anzuschalten, entsteht in sechzehn Tagen eine neue.",
    href: "/news/was-die-neue-seite-kann",
    linkLabel: "Die ganze Geschichte",
    current: false,
    order: 70,
  },
  {
    key: "heute-2026",
    year: "Jetzt",
    kicker: "Heute",
    title: "Zurück auf Sendung",
    text: "Die neue Seite steht, die Station läuft über den Musikpool von laut.fm, und am 6. November übertragen wir wieder RadioAid — diesmal für Seelenpflaster e. V. Woran wir als Nächstes arbeiten: rund um die Uhr live senden, mit eigener Musik.",
    href: "/radioaid",
    linkLabel: "Zu RadioAid",
    current: true,
    order: 80,
  },
];

const HOSTS = [
  {
    slug: "jannikjbi",
    name: "jannikjbi",
    profileLayout: "buehne",
    accentHue: 251,
    role: "Gründer & Programmchef",
    discordUserId: "810459620035657769",
    bio: "Jannik hat VoltFM 2021 in seinem Jugendzimmer in Hamburg gestartet — mit einem geliehenen Mikrofon und der festen Überzeugung, dass Radio mehr sein kann als eine Playlist. Von ihm stammt auch die laut.fm-Station, über die VoltFM heute sendet: Sie läuft seit den ersten Tagen unter seinem Handle. Heute verantwortet er das Programm, kümmert sich um die Technik hinter dem Stream und steht regelmäßig selbst am Mikrofon. Seine Sendungen leben von langen Musikstrecken und ehrlichen Zwischentönen.",
    showSlugs: [],
    socials: [{ label: "Discord", url: DISCORD_URL }],
    order: 1,
    active: true,
    image: null,
  },
  {
    slug: "mochikotv",
    name: "mochikotv",
    profileLayout: "poster",
    accentHue: 320,
    role: "Co-Gründerin & EDM",
    discordUserId: "513032712240627733",
    bio: "Mochiko ist die zweite Hälfte von VoltFM. Sie war von Anfang an dabei, als der Sender noch aus einem Laptop und zu viel Koffein bestand, und verantwortet heute alles, was in Richtung EDM geht: Playlists, Sets, Specials. Ihr Anspruch an einen Track ist unbestechlich einfach — er muss um drei Uhr nachts das Potenzial haben, dass die Polizei wegen Ruhestörung klingelt. Wer ihre Sendung kennt, weiß: das ist keine Übertreibung.",
    showSlugs: [],
    socials: [{ label: "Discord", url: DISCORD_URL }],
    order: 2,
    active: true,
    image: null,
  },
];

/**
 * Janniks Profil ohne Versprechen, die der Sender gerade nicht haelt: kein
 * "steht regelmaessig am Mikrofon", keine "Sendungen", solange nur der
 * Musikpool laeuft. Die Rolle passt sich an "Co-Founder" bei Mochiko an.
 *
 * `from` ist genau der Wert, den Migration 003 eingespielt hat — nur dann wird
 * ersetzt (Regel 2).
 */
const JANNIK_PROFILE = {
  bio: {
    from: HOSTS[0].bio,
    to: "Jannik hat 2021 bei laut.fm angefangen, mit der Station jannikjbi. Daraus wurde erst JannikjbiFM und dann, zusammen mit Mochiko, VoltFM. Die Station-ID ist geblieben, deshalb steht im Stream bis heute jannikjbi. 2026 kam der Versuch, mit AzuraCast über einen eigenen Server zu senden. Nach einem Monat war klar, dass sich die Kosten nicht lohnen. Seitdem läuft VoltFM wieder über laut.fm.",
  },
  role: { from: HOSTS[0].role, to: "Founder" },
};

/**
 * RadioAid 2026 als Event. Termin und Empfaenger kommen aus src/lib/radioaid.ts,
 * damit /radioaid, der Banner auf der Startseite und das Event nicht
 * auseinanderlaufen koennen. Der Spendenlink ist der, auf den radioaid.de
 * selbst verweist.
 */
const RADIOAID_EVENT_SOURCE = `Einmal im Jahr machen Radiostationen 24 Stunden lang gemeinsam Programm für einen guten Zweck. RadioAid kommt aus der laut.fm-Community, inzwischen kann jede Station mitmachen. Wir sind seit 2022 dabei und übertragen die Sendung auch dieses Jahr in voller Länge.

## Für wen

Die Spenden gehen 2026 an **${radioaid.organisation}** Der Verein schickt Kindern in schweren Lebenssituationen persönliche Post: ein kleines Überraschungsgeschenk und eine Grußkarte, adressiert an genau dieses Kind.

## Wie du hilfst

Einschalten, weitersagen und, wenn du kannst, spenden. Gespendet wird direkt bei RadioAid: [spende.radioaid.de](${radioaid.donateUrl}).

## Du hast selbst einen Sender?

Jede Station kann mitmachen, die Sendung gibt es kostenlos. Alles dazu steht auf [radioaid.de](${radioaid.website}).

[Alles zu RadioAid bei VoltFM](/radioaid)`;

/**
 * Die Playlist steht inzwischen direkt auf /radio statt hinter einem Link.
 * Der neue Satz stimmt fuer beide Staende, deshalb ist es egal, ob die
 * Migration vor oder nach dem Code live geht.
 */
const PLAYLIST_SENTENCE = {
  from: "Auf der [Radio-Seite](/radio) gibt es jetzt einen Link zur Playlist der letzten Tage: jeder Titel mit Uhrzeit, Tag für Tag.",
  to: "Auf der [Radio-Seite](/radio) findest du jetzt die Playlist der letzten Tage: jeder Titel mit Uhrzeit, Tag für Tag.",
};

/**
 * Phase 3: Mochikos Profil und drei Eintraege der Zeitleiste.
 *
 * `from` ist jeweils exakt der Wert, der live steht (am 25.10.2026 von
 * voltfm.xyz abgelesen). Rolle und Bio von mochikotv wurden im Admin
 * gepflegt, die Zeitleiste stammt aus Migration 005 bzw. wurde dort von Hand
 * ergaenzt. Wo inzwischen etwas anderes steht, bleibt es unangetastet.
 */
const MOCHIKO_PROFILE = {
  role: { from: "co founder", to: "Co-Founder" },
  bio: {
    from: "ist 100 mal schlechter als jannik",
    to: "Hat VoltFM mit Jannik gegründet und ist seit dem ersten Tag dabei. Die Webseite, auf der du gerade bist, haben die beiden zusammen gebaut.",
  },
};

const TIMELINE_FIXES: { key: string; from: Record<string, unknown>; to: Record<string, unknown> }[] = [
  {
    /* Die Station hiess anfangs nur jannikjbi, jannikjbiFM kam danach. */
    key: "start-2021",
    from: { text: TIMELINE[0].text },
    to: { text: TIMELINE[0].text.replace("damals noch als jannikjbiFM", "damals unter dem Namen jannikjbi") },
  },
  {
    key: "namenssuche",
    from: { text: TIMELINE[1].text },
    to: {
      text: TIMELINE[1].text.replace(
        "Aus jannikjbiFM wird ein anderer Name, und noch einer, und noch einer.",
        "Aus jannikjbi wird jannikjbiFM, dann ein anderer Name, und noch einer.",
      ),
    },
  },
  {
    /* Stand vor "Aug 2026" und versprach Sendeplan und einen Player, der auf
       der Seite laeuft. Beides gibt es nicht. Jetzt nach "3.–19. Sep 2026"
       (order 70) und vor "Jetzt" (order 80). */
    key: "plattform-2026",
    from: {
      text: "Eine eigene Website mit Redaktionssystem: Sendeplan, News, Moderatorenprofile und ein Player, der beim Seitenwechsel nicht abbricht. Am 6. November läuft wieder RadioAid, diesmal für Seelenpflaster e. V.",
    },
    to: {
      year: "19. Sep 2026",
      order: 75,
      text: "Die neue Seite geht online: News, Moderatorenprofile, Events und ein Admin-Bereich, in dem wir selbst schreiben können, ohne Code anzufassen.",
    },
  },
];

/**
 * Phase 4: Zwei Beitraege versprechen noch einen Player, der auf der Seite
 * laeuft und beim Klicken nicht abbricht. Den gab es nie — "Jetzt hören"
 * oeffnet seit dem 25.10.2026 den Webplayer von lautstation.de in einem
 * eigenen Fenster, vorher laut.fm.
 *
 * Live steht nicht die Fassung aus artikel.mts, sondern die aus cab92bf (am
 * 25.10.2026 gegen voltfm.xyz geprueft): 011 und 012 schreiben nur, wo noch
 * nichts steht. Ersetzt wird deshalb Satz fuer Satz im `contentSource`. Ein
 * Satz, den jemand im Admin umgeschrieben hat, wird nicht gefunden und bleibt,
 * wie er ist. Kurzbeschreibung und SEO-Text nur bei exakt dem alten Wortlaut.
 */
interface SentenceFix {
  slug: string;
  sentences: [from: string, to: string][];
  /** Gilt fuer `excerpt` und `seoDescription`, jeweils nur bei exakt `from`. */
  excerpt?: [from: string, to: string];
}

const WEBPLAYER_FIXES: SentenceFix[] = [
  {
    slug: "was-die-neue-seite-kann",
    sentences: [
      ["## Der Player bleibt an", "## Der Ton bleibt an"],
      [
        "Jetzt liegt der Player über der ganzen Seite. Du kannst durch die News blättern, ein Profil ansehen, die Zeitleiste lesen, und es läuft weiter.",
        "Inzwischen öffnet „Jetzt hören“ den Webplayer in einem eigenen Fenster. Dort läuft die Musik weiter, egal, wo du hier gerade klickst.",
      ],
      [
        /* Einen Lautstaerkeregler gibt es ohne eingebetteten Player gar nicht. */
        " Auf dem Handy ist die Leiste schmaler und ohne Lautstärkeregler — mit dem Daumen trifft man die Tasten des Geräts ohnehin schneller.",
        "",
      ],
      [
        "Der Stream liegt bei laut.fm. Sobald du auf Play drückst, weiß laut.fm, dass jemand von deiner Adresse zuhört — daran führt kein Weg vorbei. Aber wir fragen vorher,",
        "Der Stream liegt bei laut.fm, der Webplayer bei lautstation.de. Sobald du auf Play drückst, wissen beide, dass jemand von deiner Adresse zuhört — daran führt kein Weg vorbei. Aber wir sagen es dir vorher,",
      ],
      [
        "warum wir den Player über die ganze Seite legen konnten,",
        "warum auf jeder Seite unten steht, was gerade läuft,",
      ],
    ],
    excerpt: [
      "Ein Rundgang durch die neue Webseite: der Player, der beim Klicken nicht abbricht, die Profile, die Suche — und warum es kein Tracking, keine fremden Bilder und vorerst keinen Sendeplan gibt.",
      "Ein Rundgang durch die neue Webseite: die Leiste, die immer zeigt, was läuft, die Profile, die Suche — und warum es kein Tracking, keine fremden Bilder und vorerst keinen Sendeplan gibt.",
    ],
  },
  {
    slug: "voltfm-geht-weiter-neue-webseite",
    sentences: [
      [
        "**Ein Player, der beim Seitenwechsel nicht abbricht.** Du kannst durch die Seite klicken, ohne dass der Ton stoppt.",
        "**Eine Leiste, die immer zeigt, was läuft.** Gehört wird in einem eigenen Fenster, du kannst also durch die Seite klicken, ohne dass der Ton stoppt.",
      ],
      [
        "Wenn du unseren Stream öffnest, landest du bei laut.fm auf einer Station namens **jannikjbi** — und nicht auf einer, die VoltFM heißt.",
        "Wenn du unseren Stream öffnest, heißt die Station dort **jannikjbi** — und nicht VoltFM.",
      ],
      [
        "Wenn du auf „hören\" klickst, öffnet sich laut.fm in einem neuen Fenster.",
        "Wenn du auf „Jetzt hören“ klickst, öffnet sich der Webplayer von lautstation.de in einem neuen Fenster.",
      ],
    ],
  },
];

/**
 * Die Namensfolge im Beitrag "VoltFM geht weiter", passend zur Zeitleiste
 * (Migration 018): Die Station hiess anfangs jannikjbi, jannikjbiFM kam danach.
 */
const NAME_FIXES: SentenceFix[] = [
  {
    slug: "voltfm-geht-weiter-neue-webseite",
    sentences: [
      [
        "mit einer laut.fm-Station, die damals noch **jannikjbiFM** hieß.",
        "mit einer laut.fm-Station namens **jannikjbi**.",
      ],
      [
        "Aus jannikjbiFM wurde ein anderer Name, und noch einer, und noch einer.",
        "Aus jannikjbi wurde jannikjbiFM, dann ein anderer Name, und noch einer.",
      ],
    ],
  },
];

/**
 * Das Bewerbungsportal ist umgezogen: von dash.pwr.lol auf die eigene
 * Adresse bewerbung.voltfm.xyz. Nur der Link im Relaunch-Beitrag, der Text
 * drumherum ("Bewerbungen laufen über unser Portal") stimmt weiter.
 */
const APPLY_LINK_FIXES: SentenceFix[] = [
  {
    slug: "voltfm-geht-weiter-neue-webseite",
    sentences: [
      ["](https://dash.pwr.lol/website/1549922141003190324)", "](https://bewerbung.voltfm.xyz/)"],
    ],
  },
];

/**
 * Was beim Start der Discord-Ankuendigung (13.11.2026) noch nachgepostet
 * wird: die letzten Beitraege, die noch aktuell sind. "RadioAid 2026" fehlt
 * bewusst — er kuendigt den Start am 6. November an, und der ist vorbei.
 */
const DISCORD_BACKFILL = [
  "neues-logo-und-ehrlichere-texte",
  "ueber-1000-hoerer-danke",
  "voltfm-weihnachten-playlist",
];

/** Rechenschritt wie im Editor: ~200 Woerter pro Minute, mindestens eine. */
function readingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Ersetzt einzelne Saetze im `contentSource` und rendert `content` neu.
 *
 * Ein Satz, der nicht mehr wortgleich dasteht, wurde im Admin bearbeitet und
 * bleibt, wie er ist (Regel 2). Ein Beitrag ohne `contentSource` stammt aus
 * der HTML-Zeit und wird nicht angefasst.
 */
async function applySentenceFixes(db: Db, now: Date, fixes: SentenceFix[]): Promise<string> {
  const articles = db.collection("articles");
  const changed: string[] = [];

  for (const fix of fixes) {
    const doc = await articles.findOne({ slug: fix.slug }, { projection: { contentSource: 1 } });
    const before = typeof doc?.contentSource === "string" ? doc.contentSource : null;

    if (before !== null) {
      let source = before;
      let hits = 0;
      for (const [from, to] of fix.sentences) {
        if (!source.includes(from)) continue;
        source = source.replace(from, () => to);
        hits++;
      }

      if (hits > 0) {
        const content = renderRichText(source);
        /* Gegen den gelesenen Stand: Hat jemand in der Zwischenzeit
           gespeichert, greift das hier nicht. */
        const result = await articles.updateOne(
          { slug: fix.slug, contentSource: before },
          {
            $set: {
              content,
              contentSource: source,
              readingTime: readingTime(content),
              updatedAt: now,
            },
          },
        );
        if (result.modifiedCount) changed.push(`${fix.slug} (${hits}/${fix.sentences.length} Sätze)`);
      }
    }

    if (fix.excerpt) {
      const [from, to] = fix.excerpt;
      for (const field of ["excerpt", "seoDescription"]) {
        const result = await articles.updateOne(
          { slug: fix.slug, [field]: from },
          { $set: { [field]: to, updatedAt: now } },
        );
        if (result.modifiedCount) changed.push(`${fix.slug}.${field}`);
      }
    }
  }

  return changed.length ? `angepasst: ${changed.join(", ")}` : "nichts mehr im Ausgangszustand — nichts angefasst";
}

/* --- Die Migrationen ------------------------------------------------------ */

const MIGRATIONS: Migration[] = [
  {
    name: "001-indexes",
    run: async (db) => {
      await Promise.all([
        db.collection("articles").createIndex({ slug: 1 }, { unique: true }),
        db.collection("articles").createIndex({ status: 1, publishedAt: -1 }),
        db.collection("articles").createIndex({ categorySlug: 1, status: 1, publishedAt: -1 }),
        db.collection("articles").createIndex({ tags: 1 }),
        db.collection("categories").createIndex({ slug: 1 }, { unique: true }),
        db.collection("hosts").createIndex({ slug: 1 }, { unique: true }),
        db.collection("shows").createIndex({ slug: 1 }, { unique: true }),
        db.collection("events").createIndex({ slug: 1 }, { unique: true }),
        db.collection("events").createIndex({ startsAt: -1 }),
        db.collection("media").createIndex({ createdAt: -1 }),
        db.collection("timeline").createIndex({ key: 1 }, { unique: true }),
        db.collection("timeline").createIndex({ order: 1 }),
      ]);
      return "Indizes sichergestellt";
    },
  },

  {
    name: "002-host-slugs-auf-handles",
    run: async (db, now) => {
      const moved: string[] = [];
      for (const [from, to] of Object.entries({ jannik: "jannikjbi", mochiko: "mochikotv" })) {
        const [old, current] = await Promise.all([
          db.collection("hosts").findOne({ slug: from }),
          db.collection("hosts").findOne({ slug: to }),
        ]);
        if (!old || current) continue;
        await db.collection("hosts").updateOne({ _id: old._id }, { $set: { slug: to, updatedAt: now } });
        await db
          .collection("shows")
          .updateMany({ hostSlugs: from }, { $set: { "hostSlugs.$": to, updatedAt: now } });
        moved.push(`${from} → ${to}`);
      }
      return moved.length ? `umgezogen: ${moved.join(", ")}` : "nichts umzuziehen";
    },
  },

  {
    name: "003-gruenderprofile",
    run: async (db, now) => {
      /* Werte, die frueher von einem Skript geschrieben wurden. Steht einer
         davon noch in der Datenbank, stammt er nicht von einem Menschen. */
      const machineWritten = [
        "Jannik",
        "Mochiko",
        "Founder & Programmchef",
        "Co-Founderin & EDM",
        "Jannik hat VoltFM 2021 in seinem Jugendzimmer in Hamburg gestartet — mit einem geliehenen Mikrofon und der festen Überzeugung, dass Radio mehr sein kann als eine Playlist. Heute verantwortet er das Programm, kümmert sich um die Technik hinter dem Stream und steht dreimal pro Woche selbst am Mikrofon. Seine Sendungen leben von langen Musikstrecken und ehrlichen Zwischentönen.",
      ];
      const replaceable = (value: string, target: string) =>
        machineWritten.includes(value) || value === target.replace(/Hamburg/g, "Oldenburg");

      let created = 0;
      let touched = 0;

      for (const host of HOSTS) {
        const { slug, ...rest } = host;
        const existing = await db.collection("hosts").findOne({ slug });

        if (!existing) {
          await db.collection("hosts").insertOne({ slug, ...rest, createdAt: now, updatedAt: now });
          created++;
          continue;
        }

        const patch: Record<string, unknown> = {};
        for (const field of ["name", "role", "bio"] as const) {
          const current = existing[field];
          if (typeof current === "string" && current !== rest[field] && replaceable(current, rest[field])) {
            patch[field] = rest[field];
          }
        }
        if (rest.discordUserId && !existing.discordUserId) patch.discordUserId = rest.discordUserId;
        // Fehlt das Flag ganz, ist der Datensatz aelter als das Feld.
        if (existing.active === undefined || existing.active === null) patch.active = true;

        if (Object.keys(patch).length) {
          await db.collection("hosts").updateOne({ slug }, { $set: { ...patch, updatedAt: now } });
          touched++;
        }
      }
      return `${created} angelegt, ${touched} nachgezogen`;
    },
  },

  {
    name: "004-kategorien",
    run: async (db, now) => {
      const created = await insertMissing(db, "categories", "slug", CATEGORIES, now);
      return `${created} von ${CATEGORIES.length} angelegt`;
    },
  },

  {
    name: "005-zeitleiste",
    run: async (db, now) => {
      const created = await insertMissing(db, "timeline", "key", TIMELINE, now);
      return `${created} von ${TIMELINE.length} angelegt`;
    },
  },

  {
    name: "006-discord-einladungslink",
    run: async (db, now) => {
      const wrong = "https://discord.gg/voltfm";
      let n = 0;
      for (const name of ["hosts", "shows", "articles", "events", "settings"]) {
        for (const doc of await db.collection(name).find({}).toArray()) {
          const raw = JSON.stringify(doc);
          if (!raw.includes(wrong)) continue;
          /* Nur die betroffenen Felder ersetzen. Das ganze Dokument durch
             JSON zu schicken wuerde Date-Werte in Strings verwandeln. */
          const patch: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(doc)) {
            if (k === "_id") continue;
            const asText = JSON.stringify(v);
            if (asText?.includes(wrong)) patch[k] = JSON.parse(asText.split(wrong).join(DISCORD_URL));
          }
          if (Object.keys(patch).length) {
            await db.collection(name).updateOne({ _id: doc._id }, { $set: { ...patch, updatedAt: now } });
            n++;
          }
        }
      }
      return `${n} Dokumente korrigiert`;
    },
  },

  {
    name: "007-datumsfelder-reparieren",
    run: async (db) => {
      /* Ein frueheres Skript hat Dokumente per JSON umgeschrieben und dabei
         Date-Werte in ISO-Strings verwandelt. Das macht Sortierung und
         Datumsformatierung kaputt und wird hier zurueckgedreht. */
      const fields = ["createdAt", "updatedAt", "startsAt", "endsAt", "publishedAt"];
      const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
      let n = 0;
      for (const name of ["hosts", "shows", "articles", "events", "categories", "timeline", "media"]) {
        for (const doc of await db.collection(name).find({}).toArray()) {
          const patch: Record<string, Date> = {};
          for (const f of fields) {
            const v = doc[f];
            if (typeof v === "string" && iso.test(v)) {
              const parsed = new Date(v);
              if (!Number.isNaN(parsed.getTime())) patch[f] = parsed;
            }
          }
          if (Object.keys(patch).length) {
            await db.collection(name).updateOne({ _id: doc._id }, { $set: patch });
            n++;
          }
        }
      }
      return `${n} Dokumente repariert`;
    },
  },

  {
    name: "008-relaunch-beitrag",
    run: async (db, now) => {
      const { source, ...rest } = RELAUNCH_ARTICLE;
      const content = renderRichText(source);
      const article = {
        ...rest,
        content,
        contentSource: source,
        status: "published" as const,
        publishedAt: now,
        readingTime: readingTime(content),
        coverAlt: "",
        seoTitle: RELAUNCH_ARTICLE.title,
        seoDescription: RELAUNCH_ARTICLE.excerpt,
      };
      const result = await db.collection("articles").updateOne(
        { slug: article.slug },
        { $setOnInsert: { ...article, createdAt: now, updatedAt: now } },
        { upsert: true },
      );
      return result.upsertedCount ? `angelegt: /news/${article.slug}` : "war schon da";
    },
  },

  {
    name: "009-host-felder-nachtragen",
    run: async (db, now) => {
      /* `genres` kam mit den ausfuehrlicheren Profilen dazu. Fehlt das Feld,
         laeuft jedes `.length` darauf ins Leere. */
      const result = await db
        .collection("hosts")
        .updateMany({ genres: { $exists: false } }, { $set: { genres: [], updatedAt: now } });
      return `${result.modifiedCount} Profile ergaenzt`;
    },
  },

  {
    name: "010-host-zusatzangaben",
    run: async (db, now) => {
      /* `details` kam mit den frei pflegbaren Profilangaben dazu. Fehlt das
         Feld, laeuft jede Schleife darueber ins Leere. */
      const result = await db
        .collection("hosts")
        .updateMany({ details: { $exists: false } }, { $set: { details: [], updatedAt: now } });
      return `${result.modifiedCount} Profile ergaenzt`;
    },
  },

  {
    name: "011-relaunch-beitrag-ausfuehrlicher",
    run: async (db, now) => {
      /* Der Beitrag wurde ausgebaut — und dabei zwei Aussagen korrigiert, die
         nicht mehr stimmten: "Der Sendeplan wird in den naechsten Wochen wieder
         gefuellt" (er ist bewusst abgeschaltet) und das Schweigen ueber die
         Werbung bei laut.fm.

         Regel 2 der Migrationen: nur anfassen, wo noch der eingespielte Wert
         steht. Wer den Beitrag im Admin bearbeitet hat, hat dabei
         `contentSource` bekommen — dessen Fehlen ist also der Beleg dafuer,
         dass hier noch die urspruengliche Fassung liegt. */
      const { source, ...rest } = RELAUNCH_ARTICLE;
      const content = renderRichText(source);

      const result = await db.collection("articles").updateOne(
        { slug: rest.slug, contentSource: { $exists: false } },
        {
          $set: {
            title: rest.title,
            excerpt: rest.excerpt,
            tags: rest.tags,
            content,
            contentSource: source,
            readingTime: readingTime(content),
            seoTitle: rest.title,
            seoDescription: rest.excerpt,
            updatedAt: now,
          },
        },
      );

      if (result.matchedCount === 0) return "schon bearbeitet oder nicht vorhanden — nichts angefasst";
      return `/news/${rest.slug} ueberarbeitet`;
    },
  },

  {
    name: "012-beitrag-ueber-die-neue-seite",
    run: async (db, now) => {
      const { source, ...rest } = WEBSEITE_ARTICLE;
      const content = renderRichText(source);

      const result = await db.collection("articles").updateOne(
        { slug: rest.slug },
        {
          $setOnInsert: {
            ...rest,
            content,
            contentSource: source,
            status: "published" as const,
            publishedAt: now,
            readingTime: readingTime(content),
            coverAlt: "",
            seoTitle: rest.title,
            seoDescription: rest.excerpt,
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true },
      );

      return result.upsertedCount ? `angelegt: /news/${rest.slug}` : "war schon da";
    },
  },

  {
    name: "013-zeitleiste-2026",
    run: async (db, now) => {
      const created = await insertMissing(db, "timeline", "key", TIMELINE_2026, now);

      /* Der Eintrag zur Plattform war als "Heute" markiert. Das ist er nicht
         mehr — aber nur anfassen, wenn dort noch der eingespielte Text steht. */
      const moved = await db.collection("timeline").updateOne(
        { key: "plattform-2026", kicker: "Heute" },
        { $set: { kicker: "Die eigene Plattform", current: false, updatedAt: now } },
      );

      return `${created} von ${TIMELINE_2026.length} angelegt, ${moved.modifiedCount} umgestellt`;
    },
  },

  {
    name: "014-profil-jannikjbi-ohne-sendungen",
    run: async (db, now) => {
      const changed: string[] = [];
      for (const [field, { from, to }] of Object.entries(JANNIK_PROFILE)) {
        const result = await db
          .collection("hosts")
          .updateOne({ slug: "jannikjbi", [field]: from }, { $set: { [field]: to, updatedAt: now } });
        if (result.modifiedCount) changed.push(field);
      }
      return changed.length
        ? `jannikjbi: ${changed.join(", ")} ersetzt`
        : "schon bearbeitet oder nicht vorhanden — nichts angefasst";
    },
  },

  {
    name: "015-event-radioaid-2026",
    run: async (db, now) => {
      const { start, end } = getRadioAidSchedule(now);
      const event = {
        title: "RadioAid 2026",
        slug: "radioaid-2026",
        description: `24 Stunden Charity-Radio für ${radioaid.organisation} VoltFM überträgt die gemeinsame Sendung vom ${formatDayMonth(start)}, ${formatTime(start)} Uhr, bis zum ${formatDayMonth(end)}, ${formatTime(end)} Uhr.`,
        content: renderRichText(RADIOAID_EVENT_SOURCE),
        contentSource: RADIOAID_EVENT_SOURCE,
        startsAt: start,
        endsAt: end,
        location: "Im VoltFM-Stream auf laut.fm",
        category: "Events",
        status: "upcoming" as const,
        url: radioaid.website,
      };
      /* Nur anlegen. Wer das Event im Admin schon selbst angelegt hat, behaelt
         seine Fassung (Regel 2). */
      const result = await db.collection("events").updateOne(
        { slug: event.slug },
        { $setOnInsert: { ...event, createdAt: now, updatedAt: now } },
        { upsert: true },
      );
      return result.upsertedCount ? `angelegt: /events/${event.slug}` : "war schon da";
    },
  },

  {
    name: "016-beitraege-radioaid-und-update",
    run: async (db, now) => {
      const created: string[] = [];
      /* RadioAid zuerst und eine Minute frueher: So steht das Update in der
         Liste oben, RadioAid bleibt als einziger "featured" der Aufmacher. */
      const items = [
        { article: RADIOAID_2026_ARTICLE, publishedAt: new Date(now.getTime() - 60_000) },
        { article: UPDATE_OKTOBER_2026_ARTICLE, publishedAt: now },
      ];
      for (const { article, publishedAt } of items) {
        const { source, ...rest } = article;
        const content = renderRichText(source);
        const result = await db.collection("articles").updateOne(
          { slug: rest.slug },
          {
            $setOnInsert: {
              ...rest,
              content,
              contentSource: source,
              status: "published" as const,
              publishedAt,
              readingTime: readingTime(content),
              coverAlt: rest.coverAlt ?? "",
              seoTitle: rest.title,
              seoDescription: rest.excerpt,
              createdAt: now,
              updatedAt: now,
            },
          },
          { upsert: true },
        );
        if (result.upsertedCount) created.push(`/news/${rest.slug}`);
      }
      return created.length ? `angelegt: ${created.join(", ")}` : "waren schon da";
    },
  },

  {
    name: "017-update-beitrag-playlist-auf-radio",
    run: async (db, now) => {
      /* Regel 2: nur, wo noch genau der Text von 016 steht. Wer den Beitrag im
         Admin bearbeitet hat, hat einen anderen contentSource. */
      const source = UPDATE_OKTOBER_2026_ARTICLE.source;
      const before = source.replace(PLAYLIST_SENTENCE.to, PLAYLIST_SENTENCE.from);
      if (before === source) throw new Error("Satz in UPDATE_OKTOBER_2026_ARTICLE nicht gefunden");

      const content = renderRichText(source);
      const result = await db.collection("articles").updateOne(
        { slug: UPDATE_OKTOBER_2026_ARTICLE.slug, contentSource: before },
        {
          $set: {
            content,
            contentSource: source,
            readingTime: readingTime(content),
            updatedAt: now,
          },
        },
      );
      return result.modifiedCount
        ? `/news/${UPDATE_OKTOBER_2026_ARTICLE.slug} angepasst`
        : "schon bearbeitet oder nicht vorhanden — nichts angefasst";
    },
  },

  {
    name: "018-mochiko-und-zeitleiste",
    run: async (db, now) => {
      const changed: string[] = [];

      for (const [field, { from, to }] of Object.entries(MOCHIKO_PROFILE)) {
        const result = await db
          .collection("hosts")
          .updateOne({ slug: "mochikotv", [field]: from }, { $set: { [field]: to, updatedAt: now } });
        if (result.modifiedCount) changed.push(`mochikotv.${field}`);
      }

      for (const fix of TIMELINE_FIXES) {
        if (JSON.stringify(fix.from) === JSON.stringify(fix.to)) {
          throw new Error(`${fix.key}: Ersetzung greift nicht, Text hat sich geaendert`);
        }
        const result = await db
          .collection("timeline")
          .updateOne({ key: fix.key, ...fix.from }, { $set: { ...fix.to, updatedAt: now } });
        if (result.modifiedCount) changed.push(`timeline.${fix.key}`);
      }

      return changed.length ? `angepasst: ${changed.join(", ")}` : "nichts mehr im Ausgangszustand — nichts angefasst";
    },
  },

  {
    name: "019-beitraege-webplayer-statt-player",
    run: (db, now) => applySentenceFixes(db, now, WEBPLAYER_FIXES),
  },

  {
    name: "020-relaunch-beitrag-namensfolge",
    run: (db, now) => applySentenceFixes(db, now, NAME_FIXES),
  },

  {
    name: "021-discord-ankuendigung-bestand",
    run: async (db, now) => {
      /* Ab jetzt kuendigt der Bot neue Beitraege im Discord an. Von dem, was
         schon online ist, gehen nur die letzten noch aktuellen raus
         (DISCORD_BACKFILL). Der Rest bekommt den Haken "ankuendigen" auf aus;
         im Admin laesst er sich wieder setzen. Beitraege mit Datum in der
         Zukunft bleiben unberuehrt und gehen raus, sobald sie online sind. */
      const result = await db.collection("articles").updateMany(
        {
          status: "published",
          publishedAt: { $lte: now },
          announceOnDiscord: { $exists: false },
          slug: { $nin: DISCORD_BACKFILL },
        },
        { $set: { announceOnDiscord: false } },
      );
      return `${result.modifiedCount} ältere Beiträge nicht ankündigen; nachgepostet werden: ${DISCORD_BACKFILL.join(", ")}`;
    },
  },

  {
    name: "022-bewerbungsportal-eigene-adresse",
    run: (db, now) => applySentenceFixes(db, now, APPLY_LINK_FIXES),
  },
];

/* --- Der Lauf ------------------------------------------------------------- */

const uri = process.env.MONGODB_URI;

/* Ohne Datenbank darf der Build nicht scheitern: Ein Vorschau-Deploy oder ein
   frisch geklontes Repo hat schlicht keine. Fehlende Migrationen laufen dann
   beim naechsten Deploy mit Verbindung. */
if (!uri) {
  console.log("[migrate] MONGODB_URI ist nicht gesetzt — übersprungen.");
  process.exit(0);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15_000 });

try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "voltfm");
  const log = db.collection("migrations");
  await log.createIndex({ name: 1 }, { unique: true });

  const done = new Set((await log.find({}, { projection: { name: 1 } }).toArray()).map((d) => d.name));
  let ran = 0;

  for (const migration of MIGRATIONS) {
    if (done.has(migration.name)) continue;

    const started = Date.now();
    try {
      const summary = await migration.run(db, new Date());
      await log.insertOne({ name: migration.name, runAt: new Date(), summary });
      console.log(`[migrate] ${migration.name}: ${summary} (${Date.now() - started} ms)`);
      ran++;
    } catch (error) {
      /* Abbrechen statt weiterlaufen: Migrationen bauen aufeinander auf, und
         eine uebersprungene wuerde die naechste auf falschen Daten arbeiten
         lassen. Nicht vermerkt heisst: beim naechsten Deploy erneut versucht. */
      console.error(`[migrate] ${migration.name} fehlgeschlagen:`, error);
      process.exitCode = 1;
      break;
    }
  }

  console.log(
    ran === 0
      ? `[migrate] Alles aktuell (${MIGRATIONS.length} Migrationen bekannt).`
      : `[migrate] ${ran} Migration(en) ausgeführt.`,
  );
} catch (error) {
  // Keine Verbindung ist kein Grund, das Deployment zu verhindern.
  console.error("[migrate] Keine Verbindung zur Datenbank — übersprungen:", error);
} finally {
  await client.close().catch(() => {});
}
