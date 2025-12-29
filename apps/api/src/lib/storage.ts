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
 * Initiate a multipart upload to R2
 * Returns uploadId needed for subsequent part uploads
 */
export async function initiateMultipartUpload(
  bucket: R2Bucket,
  key: string,
  contentType: string
): Promise<string> {
  const multipartUpload = await bucket.createMultipartUpload(key, {
    httpMetadata: { contentType },
  });
  return multipartUpload.uploadId;
}

/**
 * Upload a single part of a multipart upload
 * Returns etag needed for completion
 */
export async function uploadPart(
  bucket: R2Bucket,
  key: string,
  uploadId: string,
  partNumber: number,
  body: ArrayBuffer
): Promise<string> {
  const multipartUpload = bucket.resumeMultipartUpload(key, uploadId);
  const uploadedPart = await multipartUpload.uploadPart(partNumber, body);
  return uploadedPart.etag;
}

/**
 * Complete a multipart upload
 * Assembles all parts into final object
 */
export async function completeMultipartUpload(
  bucket: R2Bucket,
  key: string,
  uploadId: string,
  parts: Array<{ partNumber: number; etag: string }>
): Promise<void> {
  const multipartUpload = bucket.resumeMultipartUpload(key, uploadId);
  await multipartUpload.complete(parts);
}

/**
 * Abort a multipart upload and cleanup
 * Use when upload fails or is cancelled
 */
export async function abortMultipartUpload(
  bucket: R2Bucket,
  key: string,
  uploadId: string
): Promise<void> {
  const multipartUpload = bucket.resumeMultipartUpload(key, uploadId);
  await multipartUpload.abort();
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
 * Supported video MIME types (standard)
 */
export const SUPPORTED_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/3gpp",
] as const;

/**
 * MIME type aliases - maps non-standard MIME types to their standard equivalents
 * Different browsers return different MIME types for the same file format
 */
const MIME_ALIASES: Record<string, string> = {
  "video/mov": "video/quicktime",
  "video/x-quicktime": "video/quicktime",
  "video/x-m4v": "video/mp4",
  "video/msvideo": "video/x-msvideo",
  "video/x-ms-video": "video/x-msvideo",
};

/**
 * Normalize a MIME type to its standard form
 * Handles browser-specific variations
 */
export function normalizeMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase().trim();
  return MIME_ALIASES[normalized] || normalized;
}

/**
 * Check if MIME type is supported (including aliases)
 */
export function isSupportedMimeType(mimeType: string): boolean {
  const normalized = normalizeMimeType(mimeType);
  return (
    SUPPORTED_MIME_TYPES.includes(normalized as (typeof SUPPORTED_MIME_TYPES)[number]) ||
    Object.keys(MIME_ALIASES).includes(mimeType.toLowerCase())
  );
}

/**
 * Get file extension from MIME type (handles aliases)
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const normalized = normalizeMimeType(mimeType);
  switch (normalized) {
    case "video/mp4":
      return "mp4";
    case "video/quicktime":
      return "mov";
    case "video/webm":
      return "webm";
    case "video/x-msvideo":
      return "avi";
    case "video/3gpp":
      return "3gp";
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
