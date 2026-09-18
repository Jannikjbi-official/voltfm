/**
 * Zeigt, was in der hosts-Sammlung tatsaechlich steht.
 *
 * Gedacht fuer die Frage "warum fehlt jemand auf /moderatoren?". Die oeffentliche
 * Liste zeigt nur Profile mit `active: true` — fehlt jemand, steht die Antwort
 * meistens in dieser Ausgabe.
 *
 * Laeuft gegen die Datenbank aus .env.local. Fuer die Produktionsdatenbank die
 * Atlas-Verbindung voranstellen:
 *
 *   MONGODB_URI="mongodb+srv://..." npm run hosts:status
 */
import { config } from "dotenv";
import { MongoClient } from "mongodb";

// Eine bereits gesetzte Umgebungsvariable gewinnt gegen die Dateien.
config({ path: ".env.local" });
config({ path: ".env" });

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/voltfm";
const dbName = process.env.MONGODB_DB ?? "voltfm";
const isLocal = /127\.0\.0\.1|localhost/.test(uri);

const client = new MongoClient(uri);
await client.connect();

try {
  const db = client.db(dbName);
  const hosts = await db.collection("hosts").find().sort({ order: 1 }).toArray();

  console.log(`\nDatenbank "${dbName}" ${isLocal ? "(LOKAL)" : "(remote)"}\n`);

  if (hosts.length === 0) {
    console.log("  Keine Moderatoren vorhanden.\n");
  } else {
    for (const h of hosts) {
      const flags = [
        h.active ? "sichtbar" : "VERSTECKT",
        h.discordUserId ? "Discord-ID gesetzt" : "keine Discord-ID",
        h.image ? "eigenes Bild" : "kein eigenes Bild",
      ];
      console.log(`  /${h.slug}`);
      console.log(`     Name:  ${h.name}`);
      console.log(`     Rolle: ${h.role}`);
      console.log(`     ${flags.join(" | ")}`);
      console.log(`     Bio:   ${String(h.bio ?? "").slice(0, 90)}…`);
      console.log("");
    }
  }

  const counts = await Promise.all(
    ["articles", "categories", "shows", "events"].map(async (name) => {
      const n = await db.collection(name).countDocuments();
      return `${name}: ${n}`;
    }),
  );
  console.log(`  Sonstiges — ${counts.join(", ")}\n`);

  if (isLocal) {
    console.log(
      "  Hinweis: Das war die lokale Datenbank. Fuer die Produktion die\n" +
        '  Atlas-Verbindung voranstellen: MONGODB_URI="mongodb+srv://..." npm run hosts:status\n',
    );
  }
} finally {
  await client.close();
}
