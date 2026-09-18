/**
 * Relaunch-Inhalte: die beiden Gründerprofile, zusätzliche News-Kategorien und
 * der Beitrag zum Neustart.
 *
 * Diese Inhalte sind hier fest hinterlegt, damit sie in jeder Datenbank
 * garantiert vorhanden sind — bearbeitet werden sie danach aber im Admin.
 * Das Skript ist deshalb durchgehend so gebaut, dass es nie etwas ueberschreibt,
 * was jemand im Dashboard gepflegt hat:
 *
 *   - Kategorien und der Beitrag werden per `$setOnInsert` angelegt. Ein
 *     zweiter Lauf legt Fehlendes an und fasst Bestehendes nicht an.
 *   - Bei den beiden Gruenderprofilen werden `name`, `role` und `bio` nur dann
 *     nachgezogen, wenn dort noch exakt der Text aus der ersten Fassung steht
 *     (siehe REPLACEABLE). Sobald jemand das Feld angefasst hat, bleibt es.
 *   - Die alten Slugs `jannik` und `mochiko` werden einmalig auf die echten
 *     Handles umgezogen, inklusive der Verweise in den Sendungen.
 *
 * Aufruf: npm run seed:relaunch
 */
import { config } from "dotenv";
import { MongoClient, type Db } from "mongodb";

// Reihenfolge wie bei Next.js: .env.local gewinnt gegen .env.
config({ path: ".env.local" });
config({ path: ".env" });

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/voltfm";
const dbName = process.env.MONGODB_DB ?? "voltfm";

/** Einladungslink zum Discord. Wird in der Produktion per Env gesetzt. */
const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.gg/6JzSsUTWuh";

const now = new Date();

/* --- Gruenderprofile ------------------------------------------------------ */

/** Alte Slugs aus der ersten Fassung -> heutige Handles. */
const SLUG_MIGRATIONS: Record<string, string> = {
  jannik: "jannikjbi",
  mochiko: "mochikotv",
};

/**
 * Werte, die dieses Skript frueher selbst geschrieben hat.
 *
 * Steht in der Datenbank noch exakt einer davon, stammt er nicht von einem
 * Menschen und darf auf die Fassung unten aktualisiert werden. Weicht der Wert
 * ab, hat ihn jemand im Admin bearbeitet — dann bleibt er, wie er ist.
 */
const MACHINE_WRITTEN = [
  "Jannik",
  "Mochiko",
  "Founder & Programmchef",
  "Co-Founderin & EDM",
  "Jannik hat VoltFM 2021 in seinem Jugendzimmer in Hamburg gestartet — mit einem geliehenen Mikrofon und der festen Überzeugung, dass Radio mehr sein kann als eine Playlist. Heute verantwortet er das Programm, kümmert sich um die Technik hinter dem Stream und steht dreimal pro Woche selbst am Mikrofon. Seine Sendungen leben von langen Musikstrecken und ehrlichen Zwischentönen.",
];

/**
 * Deckt zusaetzlich einen Zwischenstand ab, in dem versehentlich der Wohnort
 * des Betreibers (Oldenburg) statt des Senderstandorts (Hamburg) im Text stand.
 * Abgeleitet statt abgetippt, damit beide Fassungen nie auseinanderlaufen.
 */
function isMachineWritten(value: string, target: string): boolean {
  return MACHINE_WRITTEN.includes(value) || value === target.replace(/Hamburg/g, "Oldenburg");
}

const HOSTS = [
  {
    slug: "jannikjbi",
    name: "jannikjbi",
    profileLayout: "spotlight",
    accentHue: 251,
    role: "Gründer & Programmchef",
    discordUserId: "810459620035657769",
    bio: "Jannik hat VoltFM 2021 in seinem Jugendzimmer in Hamburg gestartet — mit einem geliehenen Mikrofon und der festen Überzeugung, dass Radio mehr sein kann als eine Playlist. Von ihm stammt auch die laut.fm-Station, über die VoltFM heute sendet: Sie läuft seit den ersten Tagen unter seinem Handle. Heute verantwortet er das Programm, kümmert sich um die Technik hinter dem Stream und steht regelmäßig selbst am Mikrofon. Seine Sendungen leben von langen Musikstrecken und ehrlichen Zwischentönen.",
    showSlugs: ["volt-am-morgen", "volt-nacht"],
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
    showSlugs: ["volt-selection", "wochenendstart"],
    socials: [{ label: "Discord", url: DISCORD_URL }],
    order: 2,
    active: true,
    image: null,
  },
];

/* --- Zusaetzliche Kategorien ---------------------------------------------- */

const CATEGORIES = [
  { slug: "in-eigener-sache", name: "In eigener Sache", description: "Entscheidungen, Umbauten und alles, was den Sender selbst betrifft.", hue: 300, order: 10 },
  { slug: "hinter-den-kulissen", name: "Hinter den Kulissen", description: "Wie das Programm entsteht — Studio, Technik und Redaktion.", hue: 20, order: 11 },
  { slug: "sendeplan", name: "Sendeplan", description: "Änderungen am Programm und neue Sendungen.", hue: 60, order: 12 },
  { slug: "playlist", name: "Playlist", description: "Was rotiert, was neu dazukommt und warum.", hue: 340, order: 13 },
];

/* --- Relaunch-Beitrag ----------------------------------------------------- */

const RELAUNCH_ARTICLE = {
  slug: "voltfm-geht-weiter-neue-webseite",
  title: "VoltFM geht weiter — mit neuer Webseite",
  excerpt:
    "Der Sender bleibt, die Seite ist neu gebaut. Und weil viele danach fragen: Warum unsere laut.fm-Station jannikjbi heißt und nicht VoltFM.",
  categorySlug: "in-eigener-sache",
  tags: ["Relaunch", "In eigener Sache", "laut.fm"],
  authorName: "jannikjbi",
  featured: true,
  content: `<p class="vfm-lead">Kurz und deutlich vorweg: Es geht weiter mit VoltFM. Es war eine Zeit lang still um uns, und wer in den letzten Monaten vorbeigeschaut hat, konnte den Eindruck bekommen, hier passiert nichts mehr. Der Eindruck war falsch — wir haben in der Zwischenzeit die komplette Webseite neu gebaut.</p>
<h2>Warum die Seite komplett neu ist</h2>
<p>Die alte Seite war über die Jahre gewachsen, und man hat es ihr angesehen. Jede neue Funktion war irgendwo drangeklebt, Inhalte zu pflegen war eine Zumutung, und auf dem Handy war sie ehrlich gesagt nie richtig gut. Statt das weiter zu flicken, haben wir bei null angefangen.</p>
<p>Das Ergebnis ist die Seite, auf der du gerade bist. Sie ist schneller, sie funktioniert auf dem Handy genauso wie auf dem Rechner, und dahinter liegt endlich ein richtiges Redaktionssystem: Sendeplan, Moderatorenprofile, News und Events pflegen wir jetzt selbst, ohne dass jemand im Code herumschrauben muss. Das klingt unspektakulär, ist aber der Unterschied zwischen "wir aktualisieren das mal irgendwann" und "das ist heute Abend online".</p>
<h2>Warum unsere Station jannikjbi heißt</h2>
<p>Die Frage kommt so oft, dass sie hier stehen soll. Wenn du unseren Stream öffnest, landest du bei laut.fm auf einer Station namens <strong>jannikjbi</strong> — und nicht auf einer, die VoltFM heißt.</p>
<aside class="vfm-callout">
  <p><strong>Der Grund ist schlicht Geschichte:</strong> Die Station gehört Jannik, dem Gründer von VoltFM, und läuft seit den allerersten Tagen unter seinem Handle. Damals gab es VoltFM als Namen noch gar nicht.</p>
</aside>
<p>Wir hätten eine neue Station anlegen können. Dagegen sprach einiges: Eine bestehende laut.fm-Station bringt ihre Historie mit, ihre Einstellungen, ihre Hörerinnen und Hörer. Bei einem Neuanfang wäre all das weg gewesen — für einen kosmetischen Gewinn. Also bleibt es beim alten Namen. Das Programm, das darüber läuft, ist VoltFM, und das ist der Teil, auf den es ankommt.</p>
<h2>Was das für dich heißt</h2>
<p>Praktisch nichts, außer dass du dich nicht wundern musst. Wenn du auf "hören" klickst, öffnet sich laut.fm in einem neuen Fenster und dort läuft unser Programm. Dass die Wiedergabe bei laut.fm stattfindet und nicht hier auf der Seite, hat übrigens ebenfalls einen Grund: Die Nutzungsbedingungen von laut.fm erlauben ausdrücklich das Verlinken, aber nicht das Einbetten des Streams auf fremden Seiten. Daran halten wir uns.</p>
<h2>Wie es weitergeht</h2>
<p>Der Sendeplan wird in den nächsten Wochen wieder gefüllt, die Moderatorenprofile stehen bereits, und hier an dieser Stelle wird es regelmäßig Neues geben. Wenn du mitbekommen willst, was läuft, oder Lust hast, selbst etwas beizutragen: Der schnellste Weg zu uns ist nach wie vor der Discord.</p>
<p>Danke an alle, die in der stillen Zeit drangeblieben sind. Wir sind zurück.</p>`,
};

/* --- Schreiben ------------------------------------------------------------ */

/** Rechenschritt wie im Editor: ~200 Woerter pro Minute, mindestens eine. */
function readingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Zieht einen alten Slug auf den neuen um, statt einen zweiten Datensatz
 * anzulegen. Existiert der neue Slug bereits, bleibt alles, wie es ist.
 */
async function migrateHostSlug(db: Db, from: string, to: string): Promise<boolean> {
  const [old, current] = await Promise.all([
    db.collection("hosts").findOne({ slug: from }),
    db.collection("hosts").findOne({ slug: to }),
  ]);
  if (!old || current) return false;

  await db.collection("hosts").updateOne({ _id: old._id }, { $set: { slug: to, updatedAt: now } });
  // Sendungen verweisen ueber den Slug auf ihre Moderation.
  await db
    .collection("shows")
    .updateMany({ hostSlugs: from }, { $set: { "hostSlugs.$": to, updatedAt: now } });

  console.log(`  Moderator umgezogen: ${from} -> ${to}`);
  return true;
}

const client = new MongoClient(uri);
await client.connect();

try {
  const db = client.db(dbName);

  for (const [from, to] of Object.entries(SLUG_MIGRATIONS)) {
    await migrateHostSlug(db, from, to);
  }

  let created = 0;
  let refreshed = 0;
  let kept = 0;

  for (const host of HOSTS) {
    const { slug, ...rest } = host;
    const existing = await db.collection("hosts").findOne({ slug });

    if (!existing) {
      await db.collection("hosts").insertOne({ slug, ...rest, createdAt: now, updatedAt: now });
      created++;
      continue;
    }

    /* Nur Felder anfassen, die nachweislich noch aus dem alten Seed stammen —
       alles andere ist im Admin gepflegt und geht uns nichts an. */
    const patch: Record<string, unknown> = {};
    for (const field of ["name", "role", "bio"] as const) {
      const current = existing[field];
      if (typeof current === "string" && current !== rest[field] && isMachineWritten(current, rest[field])) {
        patch[field] = rest[field];
      }
    }

    /* Die Discord-ID gab es in der ersten Fassung noch nicht. Ein leeres Feld
       zu fuellen nimmt niemandem etwas weg; eine bereits eingetragene ID
       bleibt unangetastet. */
    if (rest.discordUserId && !existing.discordUserId) {
      patch.discordUserId = rest.discordUserId;
    }

    /* Fehlt das Feld ganz, ist der Datensatz aelter als das Flag — dann ist
       "unsichtbar" keine Entscheidung, sondern eine Luecke. Ein bewusst auf
       false gesetztes Profil bleibt versteckt. */
    if (existing.active === undefined || existing.active === null) {
      patch.active = true;
    } else if (existing.active === false) {
      console.log(`  Hinweis: ${slug} ist im Admin auf "versteckt" gesetzt und bleibt es.`);
    }

    if (Object.keys(patch).length > 0) {
      await db.collection("hosts").updateOne({ slug }, { $set: { ...patch, updatedAt: now } });
      console.log(`  ${slug}: ${Object.keys(patch).join(", ")} aktualisiert.`);
      refreshed++;
    } else {
      kept++;
    }
  }
  console.log(
    `  Moderatoren: ${created} neu, ${refreshed} aus dem alten Seed nachgezogen, ${kept} unveraendert.`,
  );

  created = 0;
  kept = 0;
  for (const category of CATEGORIES) {
    const { slug, ...rest } = category;
    const result = await db.collection("categories").updateOne(
      { slug },
      { $setOnInsert: { slug, ...rest, createdAt: now, updatedAt: now } },
      { upsert: true },
    );
    if (result.upsertedCount) created++;
    else kept++;
  }
  console.log(`  Kategorien: ${created} neu angelegt, ${kept} unveraendert gelassen.`);

  const article = {
    ...RELAUNCH_ARTICLE,
    status: "published" as const,
    publishedAt: now,
    readingTime: readingTime(RELAUNCH_ARTICLE.content),
    coverImage: undefined,
    coverAlt: "",
    seoTitle: RELAUNCH_ARTICLE.title,
    seoDescription: RELAUNCH_ARTICLE.excerpt,
  };

  const articleResult = await db.collection("articles").updateOne(
    { slug: article.slug },
    { $setOnInsert: { ...article, createdAt: now, updatedAt: now } },
    { upsert: true },
  );
  console.log(
    articleResult.upsertedCount
      ? `  Beitrag angelegt: /news/${article.slug}`
      : `  Beitrag existiert bereits, nicht ueberschrieben: /news/${article.slug}`,
  );

  console.log(`\nFertig in "${dbName}".\n`);
} finally {
  await client.close();
}
