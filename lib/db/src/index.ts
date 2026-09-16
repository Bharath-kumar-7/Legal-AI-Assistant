import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let db: ReturnType<typeof drizzle> | null = null;
let pool: InstanceType<typeof Pool> | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  console.warn(
    "[db] DATABASE_URL not set — running in mock/offline mode.",
  );
}

export { pool, db };
export * from "./schema";
