import type { R2Bucket } from "@cloudflare/workers-types";

/**
 * R2 storage key prefixes
 */
export const StoragePrefix = {
  UPLOADS: "uploads",
  PROCESSED: "processed",
  THUMBNAILS: "thumbnails",
  PREVIEWS: "previews",
} as const;

/**
 * Generate storage key for original upload
 */
export function getUploadKey(userId: string, videoId: string, extension: string): string {
  return `${StoragePrefix.UPLOADS}/${userId}/${videoId}/original.${extension}`;
}

/**
 * Generate storage key for processed/translated video
 */
export function getProcessedKey(videoId: string): string {
  return `${StoragePrefix.PROCESSED}/${videoId}/dubbed.mp4`;
}

/**
 * Generate storage key for thumbnail
 */
export function getThumbnailKey(videoId: string): string {
  return `${StoragePrefix.THUMBNAILS}/${videoId}/thumb.jpg`;
}

/**
 * Generate storage key for preview clip
 */
export function getPreviewKey(videoId: string): string {
  return `${StoragePrefix.PREVIEWS}/${videoId}/preview.mp4`;
}

/**
 * Get public URL for an R2 object
 * Requires R2 bucket to have a public domain configured
 */
export function getPublicUrl(r2PublicUrl: string, key: string): string {
  return `${r2PublicUrl.replace(/\/$/, "")}/${key}`;
}

/**
 * Upload file to R2
 */
export async function uploadToR2(
  bucket: R2Bucket,
  key: string,
  body: ArrayBuffer | ReadableStream,
  contentType: string
): Promise<void> {
  await bucket.put(key, body, {
    httpMetadata: { contentType },
  });
}

/**
 * Download file from R2
 */
export async function downloadFromR2(
  bucket: R2Bucket,
  key: string
): Promise<ArrayBuffer | null> {
  const object = await bucket.get(key);
  if (!object) return null;
  return object.arrayBuffer();
}

/**
 * Check if file exists in R2
 */
export async function existsInR2(
  bucket: R2Bucket,
  key: string
): Promise<{ exists: boolean; size?: number }> {
  const head = await bucket.head(key);
  if (!head) return { exists: false };
  return { exists: true, size: head.size };
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  await bucket.delete(key);
}

/**
 * Delete multiple files from R2
 */
export async function deleteMultipleFromR2(
  bucket: R2Bucket,
  keys: string[]
): Promise<void> {
  await Promise.all(keys.map((key) => bucket.delete(key)));
}

/**
 * Supported video MIME types
 */
export const SUPPORTED_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
] as const;

/**
 * Check if MIME type is supported
 */
export function isSupportedMimeType(mimeType: string): boolean {
  return SUPPORTED_MIME_TYPES.includes(mimeType as (typeof SUPPORTED_MIME_TYPES)[number]);
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case "video/mp4":
      return "mp4";
    case "video/quicktime":
      return "mov";
    case "video/webm":
      return "webm";
    case "video/x-msvideo":
      return "avi";
    default:
      return "mp4";
  }
}

/**
 * File size limits
 */
export const FileLimits = {
  MAX_SIZE_BYTES: 500 * 1024 * 1024, // 500MB
  MAX_DURATION_SECONDS: 60 * 60, // 60 minutes
} as const;
