import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, desc, and, sql } from "drizzle-orm";
import type { HonoEnv } from "../env";
import { createDb, videos, jobs } from "../db";
import { requireAuth } from "../middleware/auth";
import {
  successResponse,
  paginatedResponse,
  formatErrorResponse,
  createError,
  ErrorCodes,
} from "../lib/errors";
import { getPublicUrl, deleteMultipleFromR2 } from "../lib/storage";
import { videoListQuerySchema } from "../validators/schemas";

export const videoRoutes = new Hono<HonoEnv>();

// Apply auth to all video routes
videoRoutes.use("*", requireAuth);

/**
 * GET /api/videos
 * List user's videos with pagination
 */
videoRoutes.get("/", zValidator("query", videoListQuerySchema), async (c) => {
  const user = c.get("user")!;
  const { page, limit, status } = c.req.valid("query");
  const db = createDb(c.env.DB);

  try {
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(videos.userId, user.id)];
    if (status) {
      conditions.push(eq(videos.status, status));
    }

    // Get videos
    const userVideos = await db
      .select()
      .from(videos)
      .where(and(...conditions))
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(videos)
      .where(and(...conditions));

    const total = countResult?.count || 0;

    // Add thumbnail URLs (placeholder for MVP)
    const videosWithUrls = userVideos.map((video) => ({
      ...video,
      thumbnail: video.thumbnailKey
        ? getPublicUrl(c.env.R2_PUBLIC_URL, video.thumbnailKey)
        : `https://picsum.photos/seed/${video.id}/400/225`, // Placeholder
    }));

    return c.json(paginatedResponse(videosWithUrls, total, page, limit));
  } catch (error) {
    console.error("Error listing videos:", error);
    return c.json(formatErrorResponse(error), 500);
  }
});

/**
 * GET /api/videos/:id
 * Get single video with job status
 */
videoRoutes.get("/:id", async (c) => {
  const user = c.get("user")!;
  const videoId = c.req.param("id");
  const db = createDb(c.env.DB);

  try {
    const video = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, user.id)))
      .get();

    if (!video) {
      const error = createError(ErrorCodes.NOT_FOUND, undefined, "Video not found");
      return c.json(formatErrorResponse(error), error.statusCode);
    }

    // Get latest job for this video
    const job = await db
      .select()
      .from(jobs)
      .where(eq(jobs.videoId, videoId))
      .orderBy(desc(jobs.createdAt))
      .get();

    // Build response with URLs
    const videoWithUrls = {
      ...video,
      thumbnail: video.thumbnailKey
        ? getPublicUrl(c.env.R2_PUBLIC_URL, video.thumbnailKey)
        : `https://picsum.photos/seed/${video.id}/400/225`,
      downloadUrl: video.translatedKey
        ? getPublicUrl(c.env.R2_PUBLIC_URL, video.translatedKey)
        : null,
      job: job
        ? {
            id: job.id,
            status: job.status,
            progress: job.progress,
            currentStep: job.currentStep,
            errorMessage: job.errorMessage,
            startedAt: job.startedAt,
            completedAt: job.completedAt,
          }
        : null,
    };

    return c.json(successResponse(videoWithUrls));
  } catch (error) {
    console.error("Error fetching video:", error);
    return c.json(formatErrorResponse(error), 500);
  }
});

/**
 * DELETE /api/videos/:id
 * Delete video and associated R2 files
 */
videoRoutes.delete("/:id", async (c) => {
  const user = c.get("user")!;
  const videoId = c.req.param("id");
  const db = createDb(c.env.DB);

  try {
    const video = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, user.id)))
      .get();

    if (!video) {
      const error = createError(ErrorCodes.NOT_FOUND, undefined, "Video not found");
      return c.json(formatErrorResponse(error), error.statusCode);
    }

    // Collect R2 keys to delete
    const keysToDelete = [
      video.originalKey,
      video.translatedKey,
      video.thumbnailKey,
      video.previewKey,
    ].filter((key): key is string => Boolean(key));

    // Delete R2 objects
    if (keysToDelete.length > 0) {
      await deleteMultipleFromR2(c.env.STORAGE, keysToDelete);
    }

    // Delete from database (jobs cascade automatically)
    await db.delete(videos).where(eq(videos.id, videoId));

    return c.json(successResponse({ message: "Video deleted successfully" }));
  } catch (error) {
    console.error("Error deleting video:", error);
    return c.json(formatErrorResponse(error), 500);
  }
});

/**
 * GET /api/videos/:id/download
 * Get download URL for translated video
 */
videoRoutes.get("/:id/download", async (c) => {
  const user = c.get("user")!;
  const videoId = c.req.param("id");
  const db = createDb(c.env.DB);

  try {
    const video = await db
      .select()
      .from(videos)
      .where(
        and(
          eq(videos.id, videoId),
          eq(videos.userId, user.id),
          eq(videos.status, "completed")
        )
      )
      .get();

    if (!video || !video.translatedKey) {
      const error = createError(
        ErrorCodes.NOT_FOUND,
        undefined,
        "Video not available for download"
      );
      return c.json(formatErrorResponse(error), error.statusCode);
    }

    const downloadUrl = getPublicUrl(c.env.R2_PUBLIC_URL, video.translatedKey);

    return c.json(
      successResponse({
        downloadUrl,
        fileName: `${video.title}_${video.targetLanguage}.mp4`,
        expiresIn: 3600, // URL valid for 1 hour
      })
    );
  } catch (error) {
    console.error("Error getting download URL:", error);
    return c.json(formatErrorResponse(error), 500);
  }
});
