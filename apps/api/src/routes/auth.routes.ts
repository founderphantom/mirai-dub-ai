import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import type { HonoEnv } from "../env";
import { createAuth } from "../lib/auth";
import { createDb, users } from "../db";
import { requireAuth } from "../middleware/auth";
import { successResponse, formatErrorResponse, createError, ErrorCodes } from "../lib/errors";
import { convertAccountSchema } from "../validators/schemas";

export const authRoutes = new Hono<HonoEnv>();

/**
 * GET /api/auth/me
 * Get current user with extended info (credits, plan, etc.)
 */
authRoutes.get("/me", requireAuth, async (c) => {
  const user = c.get("user")!;
  const db = createDb(c.env.DB);

  try {
    let dbUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .get();

    if (!dbUser) {
      const error = createError(ErrorCodes.NOT_FOUND, undefined, "User not found");
      return c.json(formatErrorResponse(error), error.statusCode);
    }

    // Reconciliation: Auto-fix users who linked email but didn't get bonus due to callback failure
    if (dbUser.isAnonymous && dbUser.email && !dbUser.email.endsWith("@anonymous.miraidub.ai")) {
      console.log("[RECONCILIATION] Fixing user who linked but isAnonymous flag still true:", dbUser.id);
      await db
        .update(users)
        .set({
          isAnonymous: false,
          bonusVideosAvailable: Math.max(dbUser.bonusVideosAvailable, 2),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Reload user with updated data
      const updated = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .get();

      if (updated) {
        dbUser = updated;
      }
    }

    return c.json(
      successResponse({
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image,
        isAnonymous: dbUser.isAnonymous,
        plan: dbUser.plan,
        creditsBalance: dbUser.creditsBalance,
        trialVideosUsed: dbUser.trialVideosUsed,
        bonusVideosAvailable: dbUser.bonusVideosAvailable,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
      })
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return c.json(formatErrorResponse(error), 500);
  }
});

/**
 * POST /api/auth/convert
 * @deprecated Use Better Auth's authClient.anonymous.linkEmail() instead
 * This endpoint is deprecated and will be removed in a future release.
 */
authRoutes.post(
  "/convert",
  requireAuth,
  zValidator("json", convertAccountSchema),
  async (c) => {
    console.warn("[DEPRECATED] /api/auth/convert endpoint called. Use authClient.anonymous.linkEmail() instead.");

    const error = createError(
      ErrorCodes.INVALID_REQUEST,
      undefined,
      "This endpoint is deprecated. Please update your client to use authClient.anonymous.linkEmail()"
    );
    return c.json(formatErrorResponse(error), 410); // 410 Gone
  }
);

/**
 * Forward all Better Auth routes
 * Handles: sign-in, sign-up, sign-out, session, etc.
 * MUST BE LAST to avoid shadowing specific routes
 */
authRoutes.all("/*", async (c) => {
  const auth = createAuth(c.env, c.req.raw.cf);
  return auth.handler(c.req.raw);
});
