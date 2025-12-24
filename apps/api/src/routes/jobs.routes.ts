import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import type { HonoEnv } from "../env";
import { createDb, jobs, videos } from "../db";
import { requireAuth } from "../middleware/auth";
import { successResponse, formatErrorResponse, createError, ErrorCodes } from "../lib/errors";
import { processingSteps } from "../db/schema/jobs";

export const jobRoutes = new Hono<HonoEnv>();

// Apply auth to all job routes
jobRoutes.use("*", requireAuth);

/**
 * Processing step descriptions (matching mobile app)
 */
const STEP_INFO: Record<string, { title: string; description: string }> = {
  upload: {
    title: "Uploading Video",
    description: "Securely uploading your video to our servers",
  },
  analyze: {
    title: "Analyzing Audio",
    description: "Extracting and analyzing speech patterns",
  },
  translate: {
    title: "Translating Content",
    description: "AI-powered translation to target language",
  },
  voice: {
    title: "Generating Voice",
    description: "Creating natural-sounding dubbed audio",
  },
  sync: {
    title: "Syncing Lips",
    description: "Applying AI lip-sync technology",
  },
  finalize: {
    title: "Finalizing Video",
    description: "Rendering and optimizing final output",
  },
};

/**
 * GET /api/jobs/:id
 * Get job status with detailed processing steps
 */
jobRoutes.get("/:id", async (c) => {
  const user = c.get("user")!;
  const jobId = c.req.param("id");
  const db = createDb(c.env.DB);

  try {
    // Get job and verify ownership through video
    const job = await db.select().from(jobs).where(eq(jobs.id, jobId)).get();

    if (!job) {
      const error = createError(ErrorCodes.NOT_FOUND, undefined, "Job not found");
      return c.json(formatErrorResponse(error), error.statusCode);
    }

    // Verify user owns the video
    const video = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, job.videoId), eq(videos.userId, user.id)))
      .get();

    if (!video) {
      const error = createError(ErrorCodes.NOT_FOUND, undefined, "Job not found");
      return c.json(formatErrorResponse(error), error.statusCode);
    }

    // Build processing steps with status
    const currentStepIndex = processingSteps.indexOf(job.currentStep);
    const steps = processingSteps.map((step, index) => {
      const stepInfo = STEP_INFO[step] || { title: step, description: "" };
      let status: "pending" | "in-progress" | "completed" | "failed";

      if (job.status === "failed" && index === currentStepIndex) {
        status = "failed";
      } else if (index < currentStepIndex) {
        status = "completed";
      } else if (index === currentStepIndex) {
        status = job.status === "completed" ? "completed" : "in-progress";
      } else {
        status = "pending";
      }

      return {
        id: step,
        title: stepInfo.title,
        description: stepInfo.description,
        status,
      };
    });

    // Estimate time remaining (rough estimate: 30 seconds per step)
    const remainingSteps = processingSteps.length - currentStepIndex - 1;
    const estimatedSecondsRemaining =
      job.status === "completed" || job.status === "failed"
        ? 0
        : remainingSteps * 30;

    return c.json(
      successResponse({
        id: job.id,
        videoId: job.videoId,
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        steps,
        errorMessage: job.errorMessage,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        estimatedSecondsRemaining,
      })
    );
  } catch (error) {
    console.error("Error fetching job:", error);
    return c.json(formatErrorResponse(error), 500);
  }
});

/**
 * GET /api/jobs/video/:videoId
 * Get latest job for a video
 */
jobRoutes.get("/video/:videoId", async (c) => {
  const user = c.get("user")!;
  const videoId = c.req.param("videoId");
  const db = createDb(c.env.DB);

  try {
    // Verify user owns the video
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
      .orderBy(jobs.createdAt)
      .get();

    if (!job) {
      const error = createError(ErrorCodes.NOT_FOUND, undefined, "No job found for this video");
      return c.json(formatErrorResponse(error), error.statusCode);
    }

    // Build processing steps
    const currentStepIndex = processingSteps.indexOf(job.currentStep);
    const steps = processingSteps.map((step, index) => {
      const stepInfo = STEP_INFO[step] || { title: step, description: "" };
      let status: "pending" | "in-progress" | "completed" | "failed";

      if (job.status === "failed" && index === currentStepIndex) {
        status = "failed";
      } else if (index < currentStepIndex) {
        status = "completed";
      } else if (index === currentStepIndex) {
        status = job.status === "completed" ? "completed" : "in-progress";
      } else {
        status = "pending";
      }

      return {
        id: step,
        title: stepInfo.title,
        description: stepInfo.description,
        status,
      };
    });

    return c.json(
      successResponse({
        id: job.id,
        videoId: job.videoId,
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        steps,
        errorMessage: job.errorMessage,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
      })
    );
  } catch (error) {
    console.error("Error fetching job for video:", error);
    return c.json(formatErrorResponse(error), 500);
  }
});
