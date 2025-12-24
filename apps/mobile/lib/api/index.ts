// API Client
export { apiClient, ApiError } from "./client";
export type { ApiResponse, PaginatedData } from "./client";

// Authentication
export { authClient, useSession, signIn, signUp, signOut } from "./auth";
export type { Session, User } from "./auth";

// Videos
export { videosApi } from "./videos";
export type { VideoListParams, VideoWithJob } from "./videos";

// Upload
export { uploadApi } from "./upload";
export type { UploadInitiateParams, UploadProgressCallback } from "./upload";

// Credits
export { creditsApi } from "./credits";
export type { CreditBalance, CreditPackage, CreditTransaction, CheckoutResponse } from "./credits";

// Jobs
export { jobsApi, STEP_INFO } from "./jobs";
export type { Job, ProcessingStep } from "./jobs";
