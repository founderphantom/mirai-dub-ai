import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";
import * as schema from "./schema";

/**
 * Create a Drizzle instance from a D1 database binding
 */
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

/**
 * Database type for use in route handlers
 */
export type Database = ReturnType<typeof createDb>;

// Re-export schema for convenience
export { schema };
export * from "./schema";
