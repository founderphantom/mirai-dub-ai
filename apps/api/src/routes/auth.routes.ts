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
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .get();

    if (!dbUser) {
      const error = createError(ErrorCodes.NOT_FOUND, undefined, "User not found");
      return c.json(formatErrorResponse(error), error.statusCode);
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
 * Convert anonymous account to full account
 */
authRoutes.post(
  "/convert",
  requireAuth,
  zValidator("json", convertAccountSchema),
  async (c) => {
    const user = c.get("user")!;
    const { email, name } = c.req.valid("json");
    // Note: password is validated but handled by Better Auth internally
    const db = createDb(c.env.DB);

    try {
      // Check if already a full account
      if (!user.isAnonymous) {
        const error = createError(
          ErrorCodes.INVALID_REQUEST,
          undefined,
          "Account is already a full account"
        );
        return c.json(formatErrorResponse(error), error.statusCode);
      }

      // Check if email already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .get();

      if (existingUser) {
        const error = createError(
          ErrorCodes.ALREADY_EXISTS,
          undefined,
          "Email already registered"
        );
        return c.json(formatErrorResponse(error), error.statusCode);
      }

      // Update user to full account with bonus videos
      await db
        .update(users)
        .set({
          email,
          name,
          isAnonymous: false,
          bonusVideosAvailable: 2, // Grant 2 bonus videos on signup
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Get updated user
      const updatedUser = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .get();

      return c.json(
        successResponse({
          message: "Account converted successfully",
          user: {
            id: updatedUser!.id,
            email: updatedUser!.email,
            name: updatedUser!.name,
            isAnonymous: updatedUser!.isAnonymous,
            bonusVideosAvailable: updatedUser!.bonusVideosAvailable,
          },
        })
      );
    } catch (error) {
      console.error("Error converting account:", error);
      return c.json(formatErrorResponse(error), 500);
    }
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
