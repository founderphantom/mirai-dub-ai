import { z } from "zod";
import { supportedLanguages } from "../db/schema/videos";

/**
 * Supported language codes
 */
export const languageCodeSchema = z.enum(supportedLanguages);

/**
 * Upload initiation request
 */
export const uploadInitiateSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive().max(500 * 1024 * 1024), // 500MB max
  contentType: z.enum([
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "video/x-msvideo",
  ]),
  sourceLanguage: languageCodeSchema,
  targetLanguage: languageCodeSchema,
  title: z.string().min(1).max(255).optional(),
  durationSeconds: z.number().positive().max(3600).optional(), // 60 min max
});

export type UploadInitiateInput = z.infer<typeof uploadInitiateSchema>;

/**
 * Upload complete request
 */
export const uploadCompleteSchema = z.object({
  uploadId: z.string().optional(),
  fileSize: z.number().positive().optional(),
});

export type UploadCompleteInput = z.infer<typeof uploadCompleteSchema>;

/**
 * Video list query params
 */
export const videoListQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  status: z.enum(["uploading", "queued", "processing", "completed", "failed"]).optional(),
});

export type VideoListQuery = z.infer<typeof videoListQuerySchema>;

/**
 * Credit checkout request
 */
export const checkoutSchema = z.object({
  packageId: z.enum(["starter", "creator", "pro", "enterprise"]),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/**
 * Account conversion request (anonymous to full account)
 */
export const convertAccountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100),
});

export type ConvertAccountInput = z.infer<typeof convertAccountSchema>;

/**
 * Transaction history query params
 */
export const transactionHistoryQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  type: z.enum(["purchase", "usage", "refund", "bonus", "subscription"]).optional(),
});

export type TransactionHistoryQuery = z.infer<typeof transactionHistoryQuerySchema>;
