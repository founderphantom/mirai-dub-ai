import type { D1Database, R2Bucket, KVNamespace, Queue } from "@cloudflare/workers-types";

/**
 * Queue message types for video processing
 */
export interface VideoProcessingMessage {
  type: "PROCESS_VIDEO";
  videoId: string;
  jobId: string;
  userId: string;
}

/**
 * Cloudflare bindings available in Workers
 */
export interface CloudflareBindings {
  // Database
  DB: D1Database;

  // Object Storage
  STORAGE: R2Bucket;

  // KV for sessions and rate limiting
  KV: KVNamespace;

  // Queues
  VIDEO_QUEUE: Queue<VideoProcessingMessage>;

  // Environment variables
  ENVIRONMENT: "development" | "production";
  API_BASE_URL: string;

  // Secrets (set via wrangler secret put)
  BETTER_AUTH_SECRET: string;
  POLAR_ACCESS_TOKEN: string;
  POLAR_WEBHOOK_SECRET: string;
  REPLICATE_API_TOKEN: string;
  R2_PUBLIC_URL: string;

  // OAuth providers
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  APPLE_CLIENT_ID: string;
  APPLE_CLIENT_SECRET: string;
}

/**
 * Hono app environment type
 */
export type HonoEnv = {
  Bindings: CloudflareBindings;
  Variables: {
    user: AuthUser | null;
    session: AuthSession | null;
  };
};

/**
 * Auth types (will be properly typed after Better Auth setup)
 */
export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
