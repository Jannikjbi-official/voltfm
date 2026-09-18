import { MongoClient, type Db } from "mongodb";
import { serverEnv } from "@/lib/env";

/**
 * A single MongoClient per process.
 *
 * The client is constructed lazily but NOT awaited: the driver connects on the
 * first real operation. That matters because `src/lib/auth.ts` needs a `Db`
 * synchronously at module scope — awaiting a connection there would make
 * `next build` fail on any machine that cannot reach Mongo at build time.
 *
 * In development Next.js clears the module registry on every HMR pass, which
 * would otherwise open a new connection pool on each edit. Caching on
 * globalThis survives that.
 */

declare global {
  var __voltfmMongoClient: MongoClient | undefined;
}

export function getMongoClient(): MongoClient {
  return (global.__voltfmMongoClient ??= new MongoClient(serverEnv.mongodbUri, {
    maxPoolSize: 10,
    retryWrites: true,
  }));
}

export function getDb(): Db {
  return getMongoClient().db(serverEnv.mongodbDb);
}

/** Explicit connect, for scripts that want to fail fast (seed, health checks). */
export async function connectDb(): Promise<Db> {
  const client = getMongoClient();
  await client.connect();
  return client.db(serverEnv.mongodbDb);
}
