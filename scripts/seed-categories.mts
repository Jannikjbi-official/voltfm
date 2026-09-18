/**
 * Creates the VoltFM news categories.
 *
 * Unlike `npm run seed`, this touches nothing but the `categories` collection,
 * so it is safe to run against a database that already holds real articles,
 * hosts and events. Each category is upserted by slug: re-running refreshes the
 * name, description and ordering and never produces duplicates. Categories that
 * already exist keep their own `createdAt`.
 *
 * Run with: npm run seed:categories
 */
import { config } from "dotenv";
import { MongoClient } from "mongodb";

// Match Next.js env precedence: .env.local wins over .env.
config({ path: ".env.local" });
config({ path: ".env" });

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/voltfm";
const dbName = process.env.MONGODB_DB ?? "voltfm";

/**
 * `hue` is an offset from the VoltFM primary, so category colours stay on brand
 * instead of each one inventing its own palette.
 */
const CATEGORIES = [
  { slug: "news", name: "News", description: "Alles Neue aus dem Sender.", hue: 0, order: 1 },
  { slug: "musik", name: "Musik", description: "Releases, Charts und Entdeckungen.", hue: 40, order: 2 },
  { slug: "radio", name: "Radio", description: "Technik, Sendungen und Blicke hinter die Kulissen.", hue: -30, order: 3 },
  { slug: "community", name: "Community", description: "Was in unserem Discord passiert.", hue: 80, order: 4 },
  { slug: "events", name: "Events", description: "Specials, Livestreams und Aktionen.", hue: 120, order: 5 },
  { slug: "entertainment", name: "Entertainment", description: "Popkultur, Film und Serien.", hue: 160, order: 6 },
  { slug: "gaming", name: "Gaming", description: "Spiele, Soundtracks und Streams.", hue: 200, order: 7 },
  { slug: "technik", name: "Technik", description: "Studio, Streaming und Ausrüstung.", hue: 240, order: 8 },
  { slug: "voltfm", name: "VoltFM", description: "In eigener Sache.", hue: 280, order: 9 },
];

const client = new MongoClient(uri);
await client.connect();

try {
  const collection = client.db(dbName).collection("categories");
  await collection.createIndex({ slug: 1 }, { unique: true });

  const now = new Date();
  const result = await collection.bulkWrite(
    CATEGORIES.map((category) => ({
      updateOne: {
        filter: { slug: category.slug },
        update: {
          $set: { ...category, updatedAt: now },
          $setOnInsert: { createdAt: now },
        },
        upsert: true,
      },
    })),
  );

  console.log(
    `Kategorien: ${result.upsertedCount} neu, ${result.modifiedCount} aktualisiert, ` +
      `${CATEGORIES.length} insgesamt in "${dbName}".`,
  );
} finally {
  await client.close();
}
