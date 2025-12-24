import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: ContentfulStatusCode = 400,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Standard error codes with ContentfulStatusCode-compatible status values
 */
export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: { code: "UNAUTHORIZED", status: 401 as ContentfulStatusCode, message: "Authentication required" },
  FORBIDDEN: { code: "FORBIDDEN", status: 403 as ContentfulStatusCode, message: "Access denied" },
  ANONYMOUS_REQUIRED: { code: "ANONYMOUS_REQUIRED", status: 403 as ContentfulStatusCode, message: "Full account required for this action" },
  INVALID_CREDENTIALS: { code: "INVALID_CREDENTIALS", status: 401 as ContentfulStatusCode, message: "Invalid email or password" },

  // Resource errors
  NOT_FOUND: { code: "NOT_FOUND", status: 404 as ContentfulStatusCode, message: "Resource not found" },
  ALREADY_EXISTS: { code: "ALREADY_EXISTS", status: 409 as ContentfulStatusCode, message: "Resource already exists" },

  // Payment/credit errors
  INSUFFICIENT_CREDITS: { code: "INSUFFICIENT_CREDITS", status: 402 as ContentfulStatusCode, message: "Insufficient credits" },
  PAYMENT_FAILED: { code: "PAYMENT_FAILED", status: 402 as ContentfulStatusCode, message: "Payment processing failed" },
  INVALID_PACKAGE: { code: "INVALID_PACKAGE", status: 400 as ContentfulStatusCode, message: "Invalid credit package" },

  // Upload/processing errors
  UPLOAD_FAILED: { code: "UPLOAD_FAILED", status: 500 as ContentfulStatusCode, message: "Upload failed" },
  PROCESSING_FAILED: { code: "PROCESSING_FAILED", status: 500 as ContentfulStatusCode, message: "Video processing failed" },
  FILE_TOO_LARGE: { code: "FILE_TOO_LARGE", status: 413 as ContentfulStatusCode, message: "File exceeds size limit" },
  UNSUPPORTED_FORMAT: { code: "UNSUPPORTED_FORMAT", status: 415 as ContentfulStatusCode, message: "Unsupported file format" },

  // Validation errors
  VALIDATION_ERROR: { code: "VALIDATION_ERROR", status: 400 as ContentfulStatusCode, message: "Invalid request data" },
  INVALID_REQUEST: { code: "INVALID_REQUEST", status: 400 as ContentfulStatusCode, message: "Invalid request" },

  // Server errors
  INTERNAL_ERROR: { code: "INTERNAL_ERROR", status: 500 as ContentfulStatusCode, message: "An unexpected error occurred" },
  EXTERNAL_SERVICE_ERROR: { code: "EXTERNAL_SERVICE_ERROR", status: 502 as ContentfulStatusCode, message: "External service error" },

  // Rate limiting
  RATE_LIMITED: { code: "RATE_LIMITED", status: 429 as ContentfulStatusCode, message: "Too many requests" },
} as const;

/**
 * Create an AppError from a predefined error code
 */
export function createError(
  errorDef: (typeof ErrorCodes)[keyof typeof ErrorCodes],
  details?: Record<string, unknown>,
  customMessage?: string
): AppError {
  return new AppError(
    errorDef.code,
    customMessage || errorDef.message,
    errorDef.status,
    details
  );
}

/**
 * Format an error for API response
 */
export function formatErrorResponse(error: unknown): {
  success: false;
  error: { code: string; message: string; details?: Record<string, unknown> };
} {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  // Zod validation errors
  if (error && typeof error === "object" && "issues" in error) {
    const zodError = error as { issues: Array<{ path: string[]; message: string }> };
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: {
          issues: zodError.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
      },
    };
  }

  return {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    },
  };
}

/**
 * Standard success response format
 */
export function successResponse<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

/**
 * Paginated response format
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): {
  success: true;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
} {
  return {
    success: true,
    data: {
      items,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    },
  };
}
