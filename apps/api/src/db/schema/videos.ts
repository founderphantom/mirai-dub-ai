import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";

/**
 * Video processing status
 */
export const videoStatuses = [
  "uploading",
  "queued",
  "processing",
  "completed",
  "failed",
] as const;
export type VideoStatus = (typeof videoStatuses)[number];

/**
 * Supported languages
 */
export const supportedLanguages = [
  "auto",
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ja",
  "zh",
  "ko",
  "ar",
  "hi",
  "ru",
  "nl",
  "pl",
  "tr",
  "vi",
  "th",
  "id",
  "sv",
] as const;
export type LanguageCode = (typeof supportedLanguages)[number];

/**
 * Videos table
 */
export const videos = sqliteTable("videos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Video metadata
  title: text("title").notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  durationSeconds: integer("duration_seconds"),
  fileSizeBytes: integer("file_size_bytes"),
  resolution: text("resolution"),
  mimeType: text("mime_type"),

  // R2 storage keys
  originalKey: text("original_key"),
  translatedKey: text("translated_key"),
  thumbnailKey: text("thumbnail_key"),
  previewKey: text("preview_key"),

  // Processing status
  status: text("status", { enum: videoStatuses }).notNull().default("uploading"),
  progress: integer("progress").notNull().default(0), // 0-100
  errorMessage: text("error_message"),

  // Credits consumed for this video
  creditsUsed: real("credits_used").notNull().default(0),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

// Type exports
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
