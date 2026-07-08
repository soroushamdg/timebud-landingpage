import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy singleton: connecting eagerly at module load would throw during
// `next build`'s page-data collection step, which imports every route module
// (including ones that are force-dynamic and never touch the DB at build
// time) just to inspect their exports. Deferring the connection until a
// query actually runs keeps the build resilient when DATABASE_URL isn't set
// yet, while still failing loudly the moment a request tries to use it.
let cached: NeonHttpDatabase<typeof schema> | null = null;

function getDb(): NeonHttpDatabase<typeof schema> {
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set — see .env.local.example");
  }

  cached = drizzle(neon(url), { schema });
  return cached;
}

export const db: NeonHttpDatabase<typeof schema> = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
