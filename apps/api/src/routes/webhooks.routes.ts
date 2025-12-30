import { Hono } from "hono";
import { Webhooks } from "@polar-sh/hono";
import { eq } from "drizzle-orm";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { HonoEnv } from "../env";
import { createDb, users, transactions, videos, jobs } from "../db";
import { formatErrorResponse, successResponse } from "../lib/errors";
import {
  validateReplicateWebhook,
  type ReplicatePredictionWebhook,
} from "../lib/replicate";
import { getProcessedKey, uploadToR2 } from "../lib/storage";

export const webhookRoutes = new Hono<HonoEnv>();

/**
 * POST /api/webhooks/polar
 * Handle Polar payment webhooks
 */
webhookRoutes.post("/polar", async (c) => {
  const db = createDb(c.env.DB);

  try {
    // Use Polar Hono adapter for webhook handling
    return Webhooks({
      webhookSecret: c.env.POLAR_WEBHOOK_SECRET,
      onPayload: async (payload) => {
        console.log("Polar webhook received:", payload.type);

        // Type guard for order.created event
        if (payload.type === "order.created") {
          const data = payload.data;
          const metadata = data.metadata as Record<string, string> | null | undefined;

          if (!metadata?.userId || !metadata?.packageId || !metadata?.creditsAmount) {
            console.error("Invalid webhook metadata:", metadata);
            return;
          }

          const userId = metadata.userId;
          const creditsAmount = parseFloat(metadata.creditsAmount);

          // Get current user balance
          const dbUser = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .get();

          if (!dbUser) {
            console.error("User not found:", userId);
            return;
          }

          // Calculate new balance
          const newBalance = (dbUser.creditsBalance || 0) + creditsAmount;

          // Update user credits
          await db
            .update(users)
            .set({
              creditsBalance: newBalance,
              polarCustomerId: (data as { customerId?: string | null }).customerId ?? dbUser.polarCustomerId,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          // Record transaction
          await db.insert(transactions).values({
            userId,
            type: "purchase",
            creditsAmount,
            balanceAfter: newBalance,
            polarPaymentId: data.id,
            description: `Purchased ${creditsAmount} minutes`,
            metadata: data as unknown as Record<string, unknown>,
          });

          console.log(
            `Credited ${creditsAmount} minutes to user ${userId}. New balance: ${newBalance}`
          );
        }

        // Handle subscription events
        if (
          payload.type === "subscription.created" ||
          payload.type === "subscription.updated"
        ) {
          const data = payload.data;
          const metadata = data.metadata as Record<string, string> | null | undefined;
          const userId = metadata?.userId;

          if (userId) {
            const subscriptionId = (data as { subscriptionId?: string }).subscriptionId || data.id;
            await db
              .update(users)
              .set({
                polarSubscriptionId: subscriptionId,
                plan: "pro", // Determine from subscription tier
                updatedAt: new Date(),
              })
              .where(eq(users.id, userId));

            console.log(`Updated subscription for user ${userId}`);
          }
        }

        if (payload.type === "subscription.canceled") {
          const data = payload.data;
          const metadata = data.metadata as Record<string, string> | null | undefined;
          const userId = metadata?.userId;

          if (userId) {
            await db
              .update(users)
              .set({
                polarSubscriptionId: null,
                plan: "free",
                updatedAt: new Date(),
              })
              .where(eq(users.id, userId));

            console.log(`Canceled subscription for user ${userId}`);
          }
        }
      },
    })(c);
  } catch (error) {
    console.error("Polar webhook error:", error);
    return c.json(formatErrorResponse(error), 500 as ContentfulStatusCode);
  }
});

/**
 * POST /api/webhooks/replicate
 * Handle Replicate AI processing webhooks
 */
webhookRoutes.post("/replicate", async (c) => {
  const db = createDb(c.env.DB);

  try {
    // Validate webhook signature (if provided by Replicate)
    const signature = c.req.header("webhook-signature");
    const body = await c.req.text();

    if (!validateReplicateWebhook(body, signature)) {
      console.error("Invalid Replicate webhook signature");
      return c.json({ error: "Invalid signature" }, 401 as ContentfulStatusCode);
    }

    const prediction: ReplicatePredictionWebhook = JSON.parse(body);
    console.log("Replicate webhook received:", prediction.id, prediction.status);

    // Find job by replicate ID
    const job = await db
      .select()
      .from(jobs)
      .where(eq(jobs.replicateId, prediction.id))
      .get();

    if (!job) {
      console.error("Job not found for replicate ID:", prediction.id);
      return c.json({ error: "Job not found" }, 404 as ContentfulStatusCode);
    }

    // Get associated video
    const video = await db
      .select()
      .from(videos)
      .where(eq(videos.id, job.videoId))
      .get();

    if (!video) {
      console.error("Video not found:", job.videoId);
      return c.json({ error: "Video not found" }, 404 as ContentfulStatusCode);
    }

    if (prediction.status === "succeeded" && prediction.output) {
      // Get output URL
      const outputUrl = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;

      if (outputUrl && typeof outputUrl === "string") {
        console.log("Downloading translated video from:", outputUrl);

        // Download output from Replicate
        const response = await fetch(outputUrl);
        if (!response.ok) {
          throw new Error(`Failed to download video: ${response.statusText}`);
        }

        const videoBuffer = await response.arrayBuffer();

        // Generate output key
        const outputKey = getProcessedKey(video.id);

        // Upload to R2
        await uploadToR2(c.env.STORAGE, outputKey, videoBuffer, "video/mp4");

        console.log("Uploaded translated video to R2:", outputKey);

        // Update video record
        await db
          .update(videos)
          .set({
            translatedKey: outputKey,
            status: "completed",
            progress: 100,
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(videos.id, video.id));

        // Update job record
        await db
          .update(jobs)
          .set({
            status: "completed",
            progress: 100,
            currentStep: "finalize",
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(jobs.id, job.id));

        // Deduct credits from user
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, video.userId))
          .get();

        if (user) {
          // Credits are now in seconds (1 credit = 1 second of video)
          const creditsToDeduct = video.durationSeconds || 60;
          let newBalance = user.creditsBalance;
          let creditSource = "credits";

          // Determine credit source
          if (user.isAnonymous && user.trialVideosUsed < 1) {
            // Use trial video
            await db
              .update(users)
              .set({
                trialVideosUsed: user.trialVideosUsed + 1,
                updatedAt: new Date(),
              })
              .where(eq(users.id, user.id));
            creditSource = "trial";
          } else if (user.bonusVideosAvailable > 0) {
            // Use bonus video
            await db
              .update(users)
              .set({
                bonusVideosAvailable: user.bonusVideosAvailable - 1,
                updatedAt: new Date(),
              })
              .where(eq(users.id, user.id));
            creditSource = "bonus";
          } else {
            // Deduct from credits balance
            newBalance = Math.max(0, user.creditsBalance - creditsToDeduct);
            await db
              .update(users)
              .set({
                creditsBalance: newBalance,
                updatedAt: new Date(),
              })
              .where(eq(users.id, user.id));
          }

          // Record transaction
          await db.insert(transactions).values({
            userId: video.userId,
            type: "usage",
            creditsAmount: -creditsToDeduct,
            balanceAfter: newBalance,
            videoId: video.id,
            description: `Processed: ${video.title} (${creditSource})`,
          });

          // Update video with credits used
          await db
            .update(videos)
            .set({ creditsUsed: creditsToDeduct })
            .where(eq(videos.id, video.id));

          console.log(
            `Deducted ${creditsToDeduct} credits (${creditSource}) for video ${video.id}`
          );
        }
      }
    } else if (prediction.status === "failed") {
      console.error("Replicate processing failed:", prediction.error);

      // Update job and video status
      await db
        .update(jobs)
        .set({
          status: "failed",
          errorMessage: prediction.error || "Processing failed",
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, job.id));

      await db
        .update(videos)
        .set({
          status: "failed",
          errorMessage: prediction.error || "Processing failed",
          updatedAt: new Date(),
        })
        .where(eq(videos.id, video.id));
    } else if (prediction.status === "processing") {
      // Update progress based on step
      let progress = 30;
      let currentStep: "translate" | "voice" | "sync" = "translate";

      // Estimate progress from logs or time
      if (prediction.logs) {
        if (prediction.logs.includes("voice")) {
          progress = 50;
          currentStep = "voice";
        }
        if (prediction.logs.includes("sync") || prediction.logs.includes("lip")) {
          progress = 70;
          currentStep = "sync";
        }
      }

      await db
        .update(jobs)
        .set({
          progress,
          currentStep,
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, job.id));

      await db
        .update(videos)
        .set({ progress, updatedAt: new Date() })
        .where(eq(videos.id, video.id));
    }

    return c.json(successResponse({ received: true }));
  } catch (error) {
    console.error("Replicate webhook error:", error);
    return c.json(formatErrorResponse(error), 500 as ContentfulStatusCode);
  }
});

/**
 * GET /api/webhooks/health
 * Health check for webhook endpoints
 */
webhookRoutes.get("/health", (c) => {
  return c.json(successResponse({ status: "ok", timestamp: new Date().toISOString() }));
});
