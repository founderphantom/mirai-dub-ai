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
 * Supported languages - Comprehensive list matching HeyGen API
 */
export const supportedLanguages = [
  "auto",
  // Popular Languages (General)
  "en", "es", "fr", "hi", "it", "de", "pl", "pt", "zh", "ja", "nl", "tr", "ko",
  "da", "ar", "ro", "zh-CN", "fil", "sv", "id", "uk", "el", "cs", "bg", "ms",
  "sk", "hr", "ta", "fi", "ru",
  // Regional Variants
  "af-ZA", "sq-AL", "am-ET",
  "ar-DZ", "ar-BH", "ar-EG", "ar-IQ", "ar-JO", "ar-KW", "ar-LB", "ar-LY",
  "ar-MA", "ar-OM", "ar-QA", "ar-SA", "ar-SY", "ar-TN", "ar-AE", "ar-YE",
  "hy-AM", "az-AZ", "bn-BD", "bn-IN", "eu", "bs-BA", "bg-BG", "my-MM", "ca",
  "zh-HK", "zh-CN-shandong", "zh-CN-mandarin", "zh-CN-liaoning", "zh-CN-sichuan",
  "zh-TW", "zh-CN-shanghai", "zh-CN-henan", "zh-CN-shaanxi",
  "hr-HR", "cs-CZ", "da-DK", "nl-BE", "nl-NL",
  "en-AU", "en-CA", "en-HK", "en-IN", "en-IE", "en-KE", "en-NZ", "en-NG",
  "en-PH", "en-SG", "en-ZA", "en-TZ", "en-GB", "en-US",
  "et-EE", "fil-PH", "fi-FI",
  "fr-BE", "fr-CA", "fr-FR", "fr-CH",
  "gl", "ka-GE",
  "de-AT", "de-DE", "de-CH",
  "el-GR", "gu-IN", "he-IL", "hi-IN", "hu-HU", "is-IS", "id-ID", "ga-IE",
  "it-IT", "ja-JP", "jv-ID", "kn-IN", "kk-KZ", "km-KH", "ko-KR", "lo-LA",
  "lv-LV", "lt-LT", "mk-MK", "ms-MY", "ml-IN", "mt-MT", "mr-IN", "mn-MN",
  "ne-NP", "nb-NO", "ps-AF", "fa-IR", "pl-PL",
  "pt-BR", "pt-PT",
  "ro-RO", "ru-RU", "sr-RS", "si-LK", "sk-SK", "sl-SI", "so-SO",
  "es-AR", "es-BO", "es-CL", "es-CO", "es-CR", "es-CU", "es-DO", "es-EC",
  "es-SV", "es-GQ", "es-GT", "es-HN", "es-MX", "es-NI", "es-PA", "es-PY",
  "es-PE", "es-PR", "es-ES", "es-US", "es-UY", "es-VE",
  "su-ID", "sw-KE", "sw-TZ", "sv-SE",
  "ta-IN", "ta-MY", "ta-SG", "ta-LK",
  "te-IN", "th-TH", "tr-TR", "uk-UA",
  "ur-IN", "ur-PK",
  "uz-UZ", "vi-VN", "cy-GB", "zu-ZA",
  // Special Variants
  "en-accent", "en-US-accent",
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

  // Multipart upload tracking
  uploadId: text("upload_id"),
  uploadedParts: text("uploaded_parts", { mode: "json" })
    .$type<Array<{ partNumber: number; etag: string }>>(),

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
