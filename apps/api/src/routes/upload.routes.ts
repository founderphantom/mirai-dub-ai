import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import type { HonoEnv } from "../env";
import { createDb, videos, jobs, users } from "../db";
import { requireAuth } from "../middleware/auth";
import {
  successResponse,
  formatErrorResponse,
  createError,
  ErrorCodes,
} from "../lib/errors";
import {
  getUploadKey,
  getThumbnailKey,
  getExtensionFromMimeType,
  existsInR2,
  uploadToR2,
  FileLimits,
  initiateMultipartUpload,
  uploadPart,
  completeMultipartUpload,
  abortMultipartUpload,
} from "../lib/storage";
import { uploadInitiateSchema, uploadCompleteSchema } from "../validators/schemas";

export const uploadRoutes = new Hono<HonoEnv>();

// Apply auth to all upload routes
uploadRoutes.use("*", requireAuth);

/**
 * POST /api/upload/initiate
 * Initialize a video upload - validates and creates video record
 */
uploadRoutes.post(
  "/initiate",
  async (c) => {
    const user = c.get("user")!;

    // Log incoming request body for debugging
    const body = await c.req.json();
    console.log("Upload initiate request body:", JSON.stringify(body, null, 2));

    // Validate
    const result = uploadInitiateSchema.safeParse(body);
    if (!result.success) {
      console.error("Validation failed:", JSON.stringify(result.error.flatten(), null, 2));
      return c.json(
        formatErrorResponse(
          createError(ErrorCodes.VALIDATION_ERROR, result.error.flatten())
        ),
        400
      );
    }

    const data = result.data;
    const db = createDb(c.env.DB);

    try {
      // Get user's credit info
      const dbUser = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .get();

      if (!dbUser) {
        const error = createError(ErrorCodes.NOT_FOUND, undefined, "User not found");
        return c.json(formatErrorResponse(error), error.statusCode);
      }

      // Estimate credits needed (1 credit = 1 minute)
      const estimatedMinutes = data.durationSeconds
        ? Math.ceil(data.durationSeconds / 60)
        : Math.ceil(data.fileSize / (10 * 1024 * 1024)); // ~10MB per minute estimate

      // Check if user can process this video
      const hasTrial = dbUser.trialVideosUsed < 1 && dbUser.isAnonymous;
      const hasBonus = dbUser.bonusVideosAvailable > 0;
      const hasCredits = dbUser.creditsBalance >= estimatedMinutes;

      if (!hasTrial && !hasBonus && !hasCredits) {
        const error = createError(ErrorCodes.INSUFFICIENT_CREDITS, {
          required: estimatedMinutes,
          available: dbUser.creditsBalance,
          hasTrial,
          hasBonus,
        });
        return c.json(formatErrorResponse(error), error.statusCode);
      }

      // Enforce 1-minute limit for free videos (using trial or bonus)
      // Only skip this check if the user is paying with credits (hasCredits is true AND they have enough credits)
      // Note: We prioritize using free resources, but they come with limits.
      // If user has credits but also free resources, we might want to let them use credits for longer videos?
      // Logic: If the video is > 1 min, they MUST use credits.
      if (estimatedMinutes > 1) {
        if (!hasCredits) {
          const error = createError(
            ErrorCodes.INVALID_REQUEST,
            undefined,
            "Free videos are limited to 1 minute. Please upgrade to process longer videos."
          );
          return c.json(formatErrorResponse(error), error.statusCode);
        }
        // If they have credits, we'll use credits naturally in the processing step (or deduction logic)
      }

      // Check file size limit
      if (data.fileSize > FileLimits.MAX_SIZE_BYTES) {
        const error = createError(ErrorCodes.FILE_TOO_LARGE, {
          maxSize: FileLimits.MAX_SIZE_BYTES,
          fileSize: data.fileSize,
        });
        return c.json(formatErrorResponse(error), error.statusCode);
      }

      // Generate storage key
      const videoId = createId();
      const extension = getExtensionFromMimeType(data.contentType);
      const storageKey = getUploadKey(user.id, videoId, extension);

      // Initiate R2 multipart upload
      const uploadId = await initiateMultipartUpload(
        c.env.STORAGE,
        storageKey,
        data.contentType
      );

      // Create video record
      const [newVideo] = await db
        .insert(videos)
        .values({
          id: videoId,
          userId: user.id,
          title: data.title || data.fileName.replace(/\.[^/.]+$/, ""),
          sourceLanguage: data.sourceLanguage,
          targetLanguage: data.targetLanguage,
          durationSeconds: data.durationSeconds,
          fileSizeBytes: data.fileSize,
          mimeType: data.contentType,
          originalKey: storageKey,
          uploadId,
          status: "uploading",
        })
        .returning();

      return c.json(
        successResponse({
          videoId: newVideo.id,
          uploadId,
          uploadUrl: `${c.env.API_BASE_URL}/api/upload/${newVideo.id}/chunk`,
          storageKey,
          estimatedCredits: estimatedMinutes,
        })
      );
    } catch (error) {
      console.error("Error initiating upload:", error);
      return c.json(formatErrorResponse(error), 500);
    }
  }
);

/**
 * PUT /api/upload/:videoId/chunk
 * Upload video file chunk to R2 using multipart upload
 */
uploadRoutes.put("/:videoId/chunk", async (c) => {
  const user = c.get("user")!;
  const videoId = c.req.param("videoId");
  const db = createDb(c.env.DB);

  // Get part metadata from headers
  const partNumber = parseInt(c.req.header("X-Part-Number") || "1");
  const totalParts = parseInt(c.req.header("X-Total-Parts") || "1");

  try {
    // Get video record
    const video = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, user.id)))
      .get();

    if (!video) {
      const error = createError(ErrorCodes.NOT_FOUND, undefined, "Video not found");
      return c.json(formatErrorResponse(error), error.statusCode);
    }

    if (video.status !== "uploading") {
      const error = createError(
        ErrorCodes.INVALID_REQUEST,
        undefined,
        "Video is not in uploading state"
      );
      return c.json(formatErrorResponse(error), error.statusCode);
    }

    if (!video.uploadId) {
      const error = createError(
        ErrorCodes.INVALID_REQUEST,
        undefined,
        "Upload not properly initiated"
      );
      return c.json(formatErrorResponse(error), error.statusCode);
    }

    // Get raw binary body (NOT FormData)
    const body = await c.req.arrayBuffer();

    // Upload part to R2
    const etag = await uploadPart(
      c.env.STORAGE,
      video.originalKey!,
      video.uploadId,
      partNumber,
      body
    );

    // Track uploaded part
    const currentParts = video.uploadedParts || [];
    currentParts.push({ partNumber, etag });

    await db
      .update(videos)
      .set({ uploadedParts: currentParts })
      .where(eq(videos.id, videoId));

    return c.json(
      successResponse({
        videoId,
        partNumber,
        uploaded: body.byteLength,
        totalParts: currentParts.length,
      })
    );
  } catch (error: any) {
    console.error("Error uploading chunk:", error);
    const err = createError(
      ErrorCodes.INTERNAL_ERROR,
      undefined,
      `Chunk upload failed: ${error.message}`
    );
    return c.json(formatErrorResponse(err), err.statusCode);
  }
});

/**
 * POST /api/upload/:videoId/complete
 * Complete upload and queue for processing
 */
uploadRoutes.post(
  "/:videoId/complete",
  zValidator("json", uploadCompleteSchema),
  async (c) => {
    const user = c.get("user")!;
    const videoId = c.req.param("videoId");
    const db = createDb(c.env.DB);

    try {
      // Get video record
      const video = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, videoId), eq(videos.userId, user.id)))
        .get();

      if (!video) {
        const error = createError(ErrorCodes.NOT_FOUND, undefined, "Video not found");
        return c.json(formatErrorResponse(error), error.statusCode);
      }

      if (video.status !== "uploading") {
        const error = createError(
          ErrorCodes.INVALID_REQUEST,
          undefined,
          "Video is not in uploading state"
        );
        return c.json(formatErrorResponse(error), error.statusCode);
      }

      // Complete multipart upload if it exists
      if (video.uploadId) {
        const parts = video.uploadedParts || [];

        // Sort parts by partNumber
        const sortedParts = parts.sort((a, b) => a.partNumber - b.partNumber);

        // Complete the multipart upload
        await completeMultipartUpload(
          c.env.STORAGE,
          video.originalKey!,
          video.uploadId,
          sortedParts
        );
      }

      // Verify file exists in R2
      const r2Status = await existsInR2(c.env.STORAGE, video.originalKey!);
      if (!r2Status.exists) {
        const error = createError(
          ErrorCodes.UPLOAD_FAILED,
          undefined,
          "Video file not found in storage"
        );
        return c.json(formatErrorResponse(error), error.statusCode);
      }

      // Update video status and clear upload tracking data
      await db
        .update(videos)
        .set({
          status: "queued",
          fileSizeBytes: r2Status.size || video.fileSizeBytes,
          uploadId: null,
          uploadedParts: null,
          updatedAt: new Date(),
        })
        .where(eq(videos.id, videoId));

      // Create job record
      const [job] = await db
        .insert(jobs)
        .values({
          videoId: video.id,
          status: "pending",
          currentStep: "upload",
        })
        .returning();

      // Queue for processing
      await c.env.VIDEO_QUEUE.send({
        type: "PROCESS_VIDEO",
        videoId: video.id,
        jobId: job.id,
        userId: user.id,
      });

      return c.json(
        successResponse({
          video: {
            id: video.id,
            status: "queued",
          },
          job: {
            id: job.id,
            status: "pending",
          },
          message: "Video queued for processing",
        })
      );
    } catch (error) {
      console.error("Error completing upload:", error);
      return c.json(formatErrorResponse(error), 500);
    }
  }
);

/**
 * PUT /api/upload/:videoId/thumbnail
 * Upload a thumbnail image for a video
 */
uploadRoutes.put("/:videoId/thumbnail", async (c) => {
  const user = c.get("user")!;
  const videoId = c.req.param("videoId");
  const db = createDb(c.env.DB);

  try {
    // Verify video belongs to user
    const video = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, user.id)))
      .get();

    if (!video) {
      const error = createError(ErrorCodes.NOT_FOUND, undefined, "Video not found");
      return c.json(formatErrorResponse(error), error.statusCode);
    }

    // Get image body
    const imageBuffer = await c.req.arrayBuffer();

    if (!imageBuffer || imageBuffer.byteLength === 0) {
      const error = createError(
        ErrorCodes.INVALID_REQUEST,
        undefined,
        "No thumbnail image provided"
      );
      return c.json(formatErrorResponse(error), error.statusCode);
    }

    // Upload to R2
    const thumbnailKey = getThumbnailKey(videoId);
    await uploadToR2(c.env.STORAGE, thumbnailKey, imageBuffer, "image/jpeg");

    // Update video record with thumbnail key
    await db
      .update(videos)
      .set({
        thumbnailKey,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, videoId));

    return c.json(successResponse({ success: true, thumbnailKey }));
  } catch (error: any) {
    console.error("Error uploading thumbnail:", error);
    const err = createError(
      ErrorCodes.INTERNAL_ERROR,
      undefined,
      `Thumbnail upload failed: ${error.message}`
    );
    return c.json(formatErrorResponse(err), err.statusCode);
  }
});

/**
 * DELETE /api/upload/:videoId/abort
 * Abort upload and cleanup
 */
uploadRoutes.delete("/:videoId/abort", async (c) => {
  const user = c.get("user")!;
  const videoId = c.req.param("videoId");
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

    // Abort R2 multipart upload if exists
    if (video.uploadId) {
      await abortMultipartUpload(
        c.env.STORAGE,
        video.originalKey!,
        video.uploadId
      );
    }

    // Delete video record
    await db.delete(videos).where(eq(videos.id, videoId));

    return c.json(successResponse({ message: "Upload aborted" }));
  } catch (error: any) {
    console.error("Error aborting upload:", error);
    const err = createError(
      ErrorCodes.INTERNAL_ERROR,
      undefined,
      `Abort failed: ${error.message}`
    );
    return c.json(formatErrorResponse(err), err.statusCode);
  }
});
