/**
 * MIME type detection utility for video uploads
 * Handles browser inconsistencies when detecting video MIME types
 */

// Standard MIME types we support
const SUPPORTED_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
  "video/3gpp",
] as const;

// Map file extensions to their standard MIME types
const EXTENSION_TO_MIME: Record<string, string> = {
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".webm": "video/webm",
  ".3gp": "video/3gpp",
  ".3gpp": "video/3gpp",
};

// Map non-standard MIME types to their standard equivalents
const MIME_ALIASES: Record<string, string> = {
  "video/mov": "video/quicktime",
  "video/x-quicktime": "video/quicktime",
  "video/x-m4v": "video/mp4",
  "video/x-msvideo": "video/x-msvideo",
  "video/msvideo": "video/x-msvideo",
  "video/x-ms-video": "video/x-msvideo",
};

/**
 * Normalize a MIME type to its standard form
 * Handles browser-specific variations
 */
export function normalizeMimeType(mime: string): string {
  const normalized = mime.toLowerCase().trim();
  return MIME_ALIASES[normalized] || normalized;
}

/**
 * Check if a MIME type is a valid video format we support
 */
export function isValidVideoMime(mime: string | undefined | null): boolean {
  if (!mime) return false;
  const normalized = normalizeMimeType(mime);
  return (
    SUPPORTED_MIME_TYPES.includes(normalized as typeof SUPPORTED_MIME_TYPES[number]) ||
    Object.keys(MIME_ALIASES).includes(normalized)
  );
}

/**
 * Extract file extension from a filename
 */
function getExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return "";
  return fileName.slice(lastDot).toLowerCase();
}

/**
 * Detect the correct MIME type for a video file
 * Uses browser-provided MIME type when valid, falls back to extension-based detection
 *
 * @param fileName - The name of the file (used for extension-based fallback)
 * @param browserMime - The MIME type provided by the browser (may be empty or incorrect)
 * @returns The detected MIME type (normalized to standard form)
 */
export function detectMimeType(fileName: string, browserMime?: string | null): string {
  // First, try the browser-provided MIME type
  if (browserMime && isValidVideoMime(browserMime)) {
    return normalizeMimeType(browserMime);
  }

  // Fall back to extension-based detection
  const ext = getExtension(fileName);
  if (ext && EXTENSION_TO_MIME[ext]) {
    return EXTENSION_TO_MIME[ext];
  }

  // Default fallback
  return "video/mp4";
}

/**
 * Get the file extension for a given MIME type
 */
export function getExtensionFromMime(mimeType: string): string {
  const normalized = normalizeMimeType(mimeType);
  switch (normalized) {
    case "video/mp4":
      return ".mp4";
    case "video/quicktime":
      return ".mov";
    case "video/x-msvideo":
      return ".avi";
    case "video/webm":
      return ".webm";
    case "video/3gpp":
      return ".3gp";
    default:
      return ".mp4";
  }
}
