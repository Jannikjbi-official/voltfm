/**
 * Local development database.
 *
 * VoltFM targets a real MongoDB (Atlas in production). This boots a real mongod
 * on a fixed port with an on-disk data directory, so data survives restarts and
 * `MONGODB_URI` looks exactly like production.
 *
 * It runs as a single-node REPLICA SET, not a standalone. That matters: Better
 * Auth's MongoDB adapter uses transactions when it is given the client, and
 * MongoDB only allows transactions on a replica set. A standalone dev database
 * would fail every sign-up with "Transaction numbers are only allowed on a
 * replica set member or mongos" — a failure that never shows up against Atlas,
 * which is always a replica set.
 *
 * Not used in production — see README. Run with: npm run db
 */
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { mkdirSync } from "node:fs";
import path from "node:path";

const PORT = Number(process.env.DEV_DB_PORT ?? 27017);
const REPL_SET = "voltfm-dev";
const dbPath = path.resolve(process.cwd(), ".mongo-data");
mkdirSync(dbPath, { recursive: true });

const server = await MongoMemoryReplSet.create({
  replSet: { name: REPL_SET, count: 1, dbName: "voltfm", storageEngine: "wiredTiger" },
  instanceOpts: [{ port: PORT, dbPath, storageEngine: "wiredTiger" }],
});

console.log(`\n  MongoDB (Replica Set "${REPL_SET}") laeuft.`);
console.log(`  MONGODB_URI=mongodb://127.0.0.1:${PORT}/voltfm?replicaSet=${REPL_SET}`);
console.log(`  Datenverzeichnis: ${dbPath}`);
console.log("  Beenden mit Strg+C\n");

const shutdown = async () => {
  await server.stop();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
