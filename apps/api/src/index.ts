import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import type { HonoEnv, CloudflareBindings, VideoProcessingMessage } from "./env";
import { authMiddleware } from "./middleware/auth";
import { createCorsMiddleware } from "./middleware/cors";
import { formatErrorResponse, successResponse } from "./lib/errors";

// Route imports
import { authRoutes } from "./routes/auth.routes";
import { videoRoutes } from "./routes/videos.routes";
import { uploadRoutes } from "./routes/upload.routes";
import { jobRoutes } from "./routes/jobs.routes";
import { creditRoutes } from "./routes/credits.routes";
import { webhookRoutes } from "./routes/webhooks.routes";
import { checkoutRedirectRoutes } from "./routes/checkout-redirect.routes";

// Queue consumer import
import { handleVideoProcessing } from "./consumers/video-processor";

// Create Hono app
const app = new Hono<HonoEnv>();

// Global middleware
app.use("*", logger());
app.use("*", secureHeaders());
app.use("*", async (c, next) => {
  const corsHandler = createCorsMiddleware(c.env);
  return corsHandler(c, next);
});

// Apply auth context to API routes (not webhooks)
app.use("/api/auth/*", authMiddleware);
app.use("/api/videos/*", authMiddleware);
app.use("/api/upload/*", authMiddleware);
app.use("/api/jobs/*", authMiddleware);
app.use("/api/credits/*", authMiddleware);

// Health check (no auth required)
app.get("/", (c) => {
  return c.json(
    successResponse({
      name: "Mirai Dub API",
      version: "1.0.0",
      status: "ok",
      timestamp: new Date().toISOString(),
    })
  );
});

app.get("/health", (c) => {
  return c.json(
    successResponse({
      status: "ok",
      timestamp: new Date().toISOString(),
    })
  );
});

// Mount routes
app.route("/api/auth", authRoutes);
app.route("/api/videos", videoRoutes);
app.route("/api/upload", uploadRoutes);
app.route("/api/jobs", jobRoutes);
app.route("/api/credits", creditRoutes);
app.route("/api/webhooks", webhookRoutes);

// Checkout redirect routes (public, no auth - for Polar payment callbacks)
app.route("/checkout", checkoutRedirectRoutes);

// Global error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(formatErrorResponse(err), 500);
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: `Endpoint not found: ${c.req.method} ${c.req.path}`,
      },
    },
    404
  );
});

// Export for Cloudflare Workers
export default {
  // HTTP request handler
  fetch: app.fetch,

  // Queue consumer handler
  async queue(
    batch: MessageBatch<VideoProcessingMessage>,
    env: CloudflareBindings
  ): Promise<void> {
    await handleVideoProcessing(batch, env);
  },
};
