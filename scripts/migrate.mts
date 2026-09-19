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
    kicker: "Heute",
    title: "VoltFM bekommt ein Zuhause",
    text: "Eine eigene Website mit Redaktionssystem: Sendeplan, News, Moderatorenprofile und ein Player, der beim Seitenwechsel nicht abbricht. Am 6. November läuft wieder RadioAid, diesmal für Seelenpflaster e. V.",
    current: true,
    order: 50,
  },
];

const HOSTS = [
  {
    slug: "jannikjbi",
    name: "jannikjbi",
    profileLayout: "spotlight",
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
    profileLayout: "stage",
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
