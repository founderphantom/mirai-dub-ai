import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";
import { videos } from "./videos";

/**
 * Transaction types
 */
export const transactionTypes = [
  "purchase", // Credit purchase
  "usage", // Credit consumption (video processing)
  "refund", // Refund for failed processing
  "bonus", // Bonus credits (signup, promo)
  "subscription", // Subscription allocation
] as const;
export type TransactionType = (typeof transactionTypes)[number];

/**
 * Transactions table - tracks all credit changes
 */
export const transactions = sqliteTable("transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Transaction details
  type: text("type", { enum: transactionTypes }).notNull(),
  creditsAmount: real("credits_amount").notNull(), // positive = add, negative = deduct
  balanceAfter: real("balance_after").notNull(),

  // References
  videoId: text("video_id").references(() => videos.id, { onDelete: "set null" }),
  polarPaymentId: text("polar_payment_id"),
  polarOrderId: text("polar_order_id"),

  // Details
  description: text("description"),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),

  // Timestamp
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Type exports
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
