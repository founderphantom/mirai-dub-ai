import { createMiddleware } from "hono/factory";
import type { HonoEnv, AuthUser, AuthSession } from "../env";
import { createAuth, getSession } from "../lib/auth";
import { createError, ErrorCodes, formatErrorResponse } from "../lib/errors";
import { createDb, users } from "../db";
import { eq } from "drizzle-orm";

/**
 * Middleware to attach auth context to all requests
 * Sets user and session in context variables
 */
export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const auth = createAuth(c.env, c.req.raw.cf as Record<string, unknown> | undefined);
  const session = await getSession(auth, c.req.raw);

  // Map better-auth user to our AuthUser type
  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image ?? null,
        emailVerified: session.user.emailVerified,
        isAnonymous: (session.user as { isAnonymous?: boolean }).isAnonymous ?? false,
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
      }
    : null;

  // Fallback: If session exists but user doesn't exist in our database, create them
  if (user) {
    const db = createDb(c.env.DB);
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .get();

    if (!existingUser) {
      console.log("[Auth Middleware] User exists in session but not in DB, creating:", user.id);

      // Create user with defaults for custom fields
      await db.insert(users).values({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
        isAnonymous: user.isAnonymous,
        trialVideosUsed: 0,
        bonusVideosAvailable: 0,
        creditsBalance: 0,
        plan: "free",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

      console.log("[Auth Middleware] User created successfully:", user.id);
    }
  }

  // Map better-auth session to our AuthSession type
  const authSession: AuthSession | null = session?.session
    ? {
        id: session.session.id,
        userId: session.session.userId,
        token: session.session.token,
        expiresAt: session.session.expiresAt,
        ipAddress: session.session.ipAddress,
        userAgent: session.session.userAgent,
        createdAt: session.session.createdAt,
        updatedAt: session.session.updatedAt,
      }
    : null;

  c.set("user", user);
  c.set("session", authSession);

  await next();
});

/**
 * Middleware requiring authentication (any user type)
 * Use this for routes that anonymous users can access
 */
export const requireAuth = createMiddleware<HonoEnv>(async (c, next) => {
  const user = c.get("user");

  if (!user) {
    const error = createError(ErrorCodes.UNAUTHORIZED);
    return c.json(formatErrorResponse(error), error.statusCode);
  }

  await next();
});

/**
 * Middleware requiring full authentication (non-anonymous)
 * Use this for routes that require a real account (e.g., payments)
 */
export const requireFullAuth = createMiddleware<HonoEnv>(async (c, next) => {
  const user = c.get("user");

  if (!user) {
    const error = createError(ErrorCodes.UNAUTHORIZED);
    return c.json(formatErrorResponse(error), error.statusCode);
  }

  if (user.isAnonymous) {
    const error = createError(ErrorCodes.ANONYMOUS_REQUIRED);
    return c.json(formatErrorResponse(error), error.statusCode);
  }

  await next();
});
