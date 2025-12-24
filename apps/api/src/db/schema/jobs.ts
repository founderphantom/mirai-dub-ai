import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { videos } from "./videos";

/**
 * Job status
 */
export const jobStatuses = ["pending", "processing", "completed", "failed"] as const;
export type JobStatus = (typeof jobStatuses)[number];

/**
 * Processing steps (matching mobile app constants)
 */
export const processingSteps = [
  "upload",
  "analyze",
  "translate",
  "voice",
  "sync",
  "finalize",
] as const;
export type ProcessingStep = (typeof processingSteps)[number];

/**
 * Jobs table - tracks video processing jobs
 */
export const jobs = sqliteTable("jobs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  videoId: text("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),

  // Replicate integration
  replicateId: text("replicate_id"),
  replicateVersion: text("replicate_version"),

  // Status tracking
  status: text("status", { enum: jobStatuses }).notNull().default("pending"),
  progress: integer("progress").notNull().default(0), // 0-100
  currentStep: text("current_step", { enum: processingSteps })
    .notNull()
    .default("upload"),

  // Error handling
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").notNull().default(0),
  maxRetries: integer("max_retries").notNull().default(3),

  // Metadata (JSON string for step-specific data)
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

// Type exports
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
