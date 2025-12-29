import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { videos, jobs } from "../db/schema";
import type { CloudflareBindings, VideoProcessingMessage } from "../env";
import { createReplicateClient, createTranslationPrediction, mapLanguageCodeToReplicate } from "../lib/replicate";
import { getPublicUrl } from "../lib/storage";

/**
 * Handle video processing queue messages
 */
export async function handleVideoProcessing(
  batch: MessageBatch<VideoProcessingMessage>,
  env: CloudflareBindings
): Promise<void> {
  const db = drizzle(env.DB, { schema });

  for (const message of batch.messages) {
    const { videoId, jobId } = message.body;

    console.log(`Processing video ${videoId}, job ${jobId}, attempt ${message.attempts}`);

    try {
      // Update job status to processing
      await db
        .update(jobs)
        .set({
          status: "processing",
          startedAt: new Date(),
          currentStep: "analyze",
          progress: 10,
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, jobId));

      // Update video status
      await db
        .update(videos)
        .set({
          status: "processing",
          progress: 10,
          updatedAt: new Date(),
        })
        .where(eq(videos.id, videoId));

      // Get video details
      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId))
        .get();

      if (!video) {
        throw new Error(`Video not found: ${videoId}`);
      }

      if (!video.originalKey) {
        throw new Error(`Video has no original file: ${videoId}`);
      }

      // Generate public URL for the video
      const videoUrl = getPublicUrl(env.R2_PUBLIC_URL, video.originalKey);

      // Construct webhook URL
      const webhookUrl = `${env.API_BASE_URL}/api/webhooks/replicate`;

      console.log(`Sending video to Replicate: ${videoUrl}`);
      console.log(`Webhook URL: ${webhookUrl}`);

      // Create Replicate client
      const replicate = createReplicateClient(env.REPLICATE_API_TOKEN);

      // Create translation prediction
      const prediction = await createTranslationPrediction(
        replicate,
        {
          video: videoUrl,
          output_language: mapLanguageCodeToReplicate(video.targetLanguage),
        },
        webhookUrl
      );

      console.log(`Replicate prediction created: ${prediction.id}`);

      // Store Replicate prediction ID and update progress
      await db
        .update(jobs)
        .set({
          replicateId: prediction.id,
          currentStep: "translate",
          progress: 30,
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, jobId));

      await db
        .update(videos)
        .set({
          progress: 30,
          updatedAt: new Date(),
        })
        .where(eq(videos.id, videoId));

      // Note: Thumbnails are now generated on the mobile app before upload
      // and stored via PUT /api/upload/:videoId/thumbnail endpoint

      // Message processed successfully - Replicate will call our webhook when done
      message.ack();

      console.log(`Video ${videoId} queued for processing with Replicate`);
    } catch (error) {
      console.error(`Error processing video ${videoId}:`, error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      // Check if we should retry
      if (message.attempts < 3) {
        // Retry with exponential backoff
        const delaySeconds = 30 * Math.pow(2, message.attempts);
        console.log(`Retrying in ${delaySeconds} seconds (attempt ${message.attempts + 1}/3)`);

        message.retry({ delaySeconds });
      } else {
        // Max retries exceeded - mark as failed
        console.error(`Max retries exceeded for video ${videoId}`);

        await db
          .update(jobs)
          .set({
            status: "failed",
            errorMessage,
            retryCount: message.attempts,
            updatedAt: new Date(),
          })
          .where(eq(jobs.id, jobId));

        await db
          .update(videos)
          .set({
            status: "failed",
            errorMessage,
            updatedAt: new Date(),
          })
          .where(eq(videos.id, videoId));

        // Acknowledge to stop retrying
        message.ack();
      }
    }
  }
}
