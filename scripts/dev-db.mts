/**
 * Local development database.
 *
 * VoltFM targets a real MongoDB (Atlas in production). For local work this
 * boots a real mongod on a fixed port with an on-disk data directory, so data
 * survives restarts and `MONGODB_URI` looks exactly like production.
 *
 * Not used in production — see README. Run with: npm run db
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import { mkdirSync } from "node:fs";
import path from "node:path";

const PORT = Number(process.env.DEV_DB_PORT ?? 27017);
const dbPath = path.resolve(process.cwd(), ".mongo-data");
mkdirSync(dbPath, { recursive: true });

const server = await MongoMemoryServer.create({
  instance: { port: PORT, dbName: "voltfm", dbPath, storageEngine: "wiredTiger" },
});

console.log(`\n  MongoDB läuft: ${server.getUri("voltfm")}`);
console.log(`  Datenverzeichnis: ${dbPath}`);
console.log("  Beenden mit Strg+C\n");

const shutdown = async () => {
  await server.stop();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
