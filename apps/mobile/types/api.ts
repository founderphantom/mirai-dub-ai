// Re-export API types from lib/api
export type { ApiResponse, PaginatedData } from "@/lib/api/client";
export type { CreditBalance, CreditPackage, CreditTransaction, CheckoutResponse } from "@/lib/api/credits";
export type { Job, ProcessingStep as JobStep } from "@/lib/api/jobs";
export type { VideoWithJob, VideoListParams } from "@/lib/api/videos";
export type { UploadInitiateParams, UploadProgressCallback } from "@/lib/api/upload";

// Legacy types for backwards compatibility
export type Credits = {
  balance: number;
  used: number;
  total: number;
};

export type PurchaseResult = {
  success: boolean;
  transactionId: string;
  creditsAdded: number;
  newBalance: number;
};

// Error codes from the API
export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "ANONYMOUS_REQUIRED"
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "INSUFFICIENT_CREDITS"
  | "FILE_TOO_LARGE"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

// Error code to user-friendly message mapping
export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHORIZED: "Please sign in to continue",
  FORBIDDEN: "You don't have permission to perform this action",
  ANONYMOUS_REQUIRED: "Please create an account to access this feature",
  NOT_FOUND: "The requested resource was not found",
  ALREADY_EXISTS: "This resource already exists",
  INSUFFICIENT_CREDITS: "Not enough credits. Please purchase more to continue.",
  FILE_TOO_LARGE: "The file is too large. Maximum size is 500MB.",
  VALIDATION_ERROR: "Please check your input and try again",
  INTERNAL_ERROR: "Something went wrong. Please try again later.",
  RATE_LIMITED: "Too many requests. Please wait a moment.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  TIMEOUT: "Request timed out. Please try again.",
  UNKNOWN: "An unexpected error occurred",
};

// Helper to get user-friendly error message
export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code as ApiErrorCode] || ERROR_MESSAGES.UNKNOWN;
}
