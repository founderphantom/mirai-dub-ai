import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, desc, and, sql } from "drizzle-orm";
import type { HonoEnv } from "../env";
import { createDb, users, transactions } from "../db";
import { requireAuth, requireFullAuth } from "../middleware/auth";
import {
  successResponse,
  paginatedResponse,
  formatErrorResponse,
  createError,
  ErrorCodes,
} from "../lib/errors";
import {
  CREDIT_PACKAGES,
  getCreditPackage,
  createPolarClient,
  createCheckoutSession,
} from "../lib/polar";
import { checkoutSchema, transactionHistoryQuerySchema } from "../validators/schemas";

export const creditRoutes = new Hono<HonoEnv>();

// Apply auth to all credit routes
creditRoutes.use("*", requireAuth);

/**
 * GET /api/credits/balance
 * Get user's credit balance and usage info
 */
creditRoutes.get("/balance", async (c) => {
  const user = c.get("user")!;
  const db = createDb(c.env.DB);

  try {
    const dbUser = await db
      .select({
        creditsBalance: users.creditsBalance,
        trialVideosUsed: users.trialVideosUsed,
        bonusVideosAvailable: users.bonusVideosAvailable,
        plan: users.plan,
        isAnonymous: users.isAnonymous,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .get();

    if (!dbUser) {
      const error = createError(ErrorCodes.NOT_FOUND, undefined, "User not found");
      return c.json(formatErrorResponse(error), error.statusCode);
    }

    // Calculate trial videos remaining (only for anonymous users)
    const trialVideosRemaining = dbUser.isAnonymous
      ? Math.max(0, 1 - dbUser.trialVideosUsed)
      : 0;

    return c.json(
      successResponse({
        balance: dbUser.creditsBalance,
        trialVideosRemaining,
        bonusVideosAvailable: dbUser.bonusVideosAvailable,
        plan: dbUser.plan,
        isAnonymous: dbUser.isAnonymous,
      })
    );
  } catch (error) {
    console.error("Error fetching balance:", error);
    return c.json(formatErrorResponse(error), 500);
  }
});

/**
 * GET /api/credits/packages
 * Get available credit packages for purchase
 */
creditRoutes.get("/packages", async (c) => {
  // Return available packages (no auth required for viewing)
  const packages = CREDIT_PACKAGES.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    seconds: pkg.seconds,
    price: pkg.priceUsd,
    popular: "popular" in pkg ? pkg.popular : false,
  }));

  return c.json(successResponse(packages));
});

/**
 * GET /api/credits/history
 * Get user's credit transaction history
 */
creditRoutes.get(
  "/history",
  zValidator("query", transactionHistoryQuerySchema),
  async (c) => {
    const user = c.get("user")!;
    const { page, limit, type } = c.req.valid("query");
    const db = createDb(c.env.DB);

    try {
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [eq(transactions.userId, user.id)];
      if (type) {
        conditions.push(eq(transactions.type, type));
      }

      // Get transactions
      const txns = await db
        .select()
        .from(transactions)
        .where(and(...conditions))
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(and(...conditions));

      const total = countResult?.count || 0;

      return c.json(paginatedResponse(txns, total, page, limit));
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      return c.json(formatErrorResponse(error), 500);
    }
  }
);

/**
 * POST /api/credits/checkout
 * Create a Polar checkout session for credit purchase
 * Requires full account (non-anonymous)
 */
creditRoutes.post(
  "/checkout",
  requireFullAuth,
  zValidator("json", checkoutSchema),
  async (c) => {
    const user = c.get("user")!;
    const { packageId, successUrl, cancelUrl } = c.req.valid("json");
    const db = createDb(c.env.DB);

    try {
      // Get credit package
      const creditPackage = getCreditPackage(packageId);
      if (!creditPackage) {
        const error = createError(ErrorCodes.INVALID_PACKAGE);
        return c.json(formatErrorResponse(error), error.statusCode);
      }

      // Get user's email
      const dbUser = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, user.id))
        .get();

      if (!dbUser?.email) {
        const error = createError(
          ErrorCodes.INVALID_REQUEST,
          undefined,
          "Email required for purchase"
        );
        return c.json(formatErrorResponse(error), error.statusCode);
      }

      // Create Polar client (uses sandbox server in development, production server in production)
      const polar = createPolarClient(c.env.POLAR_ACCESS_TOKEN, c.env.ENVIRONMENT);

      // Build success URL - Polar requires HTTP/HTTPS, so we always use our redirect endpoint
      // (ignore client-provided successUrl which may be a deep link like miraidub://)
      const apiBaseUrl = c.env.API_BASE_URL;
      const checkoutSuccessUrl = `${apiBaseUrl}/checkout/success`;

      // Create checkout session
      const { checkoutUrl, checkoutId } = await createCheckoutSession(polar, {
        productId: creditPackage.polarProductId,
        customerEmail: dbUser.email,
        metadata: {
          userId: user.id,
          packageId: creditPackage.id,
          creditsAmount: creditPackage.seconds,
        },
        successUrl: checkoutSuccessUrl,
      });

      return c.json(
        successResponse({
          checkoutUrl,
          checkoutId,
          packageId: creditPackage.id,
          creditsAmount: creditPackage.seconds,
        })
      );
    } catch (error) {
      console.error("Error creating checkout:", error);
      return c.json(formatErrorResponse(error), 500);
    }
  }
);
