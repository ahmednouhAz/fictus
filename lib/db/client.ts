import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getServerEnv } from "@/lib/env";
import * as schema from "@/lib/db/schema";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

// Cached on globalThis so Next.js dev-mode hot-reload doesn't recreate the
// client (and its underlying fetch-based Neon connection) on every edit.
const globalForDb = globalThis as unknown as { db?: DbInstance };

function getDb(): DbInstance {
  if (!globalForDb.db) {
    globalForDb.db = drizzle(neon(getServerEnv().DATABASE_URL), { schema });
  }
  return globalForDb.db;
}

// A lazy proxy so merely importing this module has no side effects — env
// validation (and the DB connection) only happens the first time a query
// actually runs, not just from another module importing `db`.
export const db: DbInstance = new Proxy({} as DbInstance, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
