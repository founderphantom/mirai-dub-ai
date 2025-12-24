// Export all schemas
export * from "./users";
export * from "./videos";
export * from "./jobs";
export * from "./transactions";

// Re-export schema object for Drizzle
import { users, sessions, accounts, verifications } from "./users";
import { videos } from "./videos";
import { jobs } from "./jobs";
import { transactions } from "./transactions";

export const schema = {
  // User-related tables
  users,
  sessions,
  accounts,
  verifications,

  // Core tables
  videos,
  jobs,
  transactions,
};
