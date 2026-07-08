import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

// Only `db:migrate`/`db:studio` need a real connection; `db:generate` just
// diffs the schema file against prior snapshots, so we allow a placeholder
// here and let drizzle-kit fail with a clear connection error if you try to
// migrate/studio without DATABASE_URL set.
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://placeholder/placeholder",
  },
});
