import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { anonymous } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import type { CloudflareBindings } from "../env";

// CloudflareGeolocation type from better-auth-cloudflare
interface CloudflareGeolocation {
  colo?: string;
  country?: string;
  city?: string;
  continent?: string;
  latitude?: string;
  longitude?: string;
  postalCode?: string;
  metroCode?: string;
  region?: string;
  regionCode?: string;
  timezone?: string;
}

/**
 * Create Better Auth instance for runtime usage
 * This is called per-request with the Cloudflare bindings
 */
export function createAuth(env: CloudflareBindings, cf?: Record<string, unknown>) {
  const db = drizzle(env.DB, { schema });

  // Extract geolocation from cf properties
  const geo: CloudflareGeolocation | undefined = cf ? {
    colo: cf.colo as string | undefined,
    country: cf.country as string | undefined,
    city: cf.city as string | undefined,
    continent: cf.continent as string | undefined,
    latitude: cf.latitude as string | undefined,
    longitude: cf.longitude as string | undefined,
    postalCode: cf.postalCode as string | undefined,
    region: cf.region as string | undefined,
    regionCode: cf.regionCode as string | undefined,
    timezone: cf.timezone as string | undefined,
  } : undefined;

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.API_BASE_URL,
    ...withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        cf: geo,
        d1: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          db: db as any,
          options: {
            usePlural: true,
            debugLogs: env.ENVIRONMENT === "development",
          },
        },
        kv: env.KV,
      },
      {
        emailAndPassword: {
          enabled: true,
          requireEmailVerification: false,
        },

        socialProviders: {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
          apple: {
            clientId: env.APPLE_CLIENT_ID,
            clientSecret: env.APPLE_CLIENT_SECRET,
            appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER,
          },
        },

        plugins: [
          anonymous({
            emailDomainName: "anonymous.miraidub.ai",
            disableDeleteAnonymousUser: true, // Preserve user data (videos, credits, transactions)
            onLinkAccount: async (params) => {
              // Log params structure for debugging
              console.log("[Better Auth] onLinkAccount called");

              const db = drizzle(env.DB, { schema });

              // Access the correct path: params.newUser.user.id and params.anonymousUser.user.id
              const newUserId = params?.newUser?.user?.id;
              const anonymousUserId = params?.anonymousUser?.user?.id;

              console.log("[Better Auth] Anonymous user ID:", anonymousUserId);
              console.log("[Better Auth] New user ID:", newUserId);

              if (!newUserId) {
                console.error("[Better Auth] onLinkAccount: Could not determine new user ID");
                return;
              }

              try {
                // First, get the anonymous user's trial data to transfer
                let trialVideosUsed = 0;
                if (anonymousUserId) {
                  const anonymousUser = await db
                    .select()
                    .from(schema.users)
                    .where(eq(schema.users.id, anonymousUserId))
                    .get();

                  if (anonymousUser) {
                    trialVideosUsed = anonymousUser.trialVideosUsed || 0;
                    console.log("[Better Auth] Transferring trial data from anonymous user:", {
                      trialVideosUsed,
                    });
                  }
                }

                // Calculate bonus videos:
                // - Base: 2 bonus videos for converting
                // - Plus: any unused trial videos (1 - trialVideosUsed)
                // This ensures converted users get up to 3 free videos total
                const unusedTrialVideos = Math.max(0, 1 - trialVideosUsed);
                const totalBonusVideos = 2 + unusedTrialVideos;

                // Update the new user with:
                // 1. isAnonymous = false
                // 2. trialVideosUsed transferred from anonymous user (for record keeping)
                // 3. bonusVideosAvailable = 2 base + unused trial videos
                await db
                  .update(schema.users)
                  .set({
                    isAnonymous: false,
                    trialVideosUsed: trialVideosUsed, // Transfer from anonymous (for record)
                    bonusVideosAvailable: totalBonusVideos, // 2 + unused trial (up to 3)
                    updatedAt: new Date(),
                  })
                  .where(eq(schema.users.id, newUserId))
                  .execute();

                console.log("[Better Auth] Successfully linked account:", {
                  newUserId,
                  trialVideosUsed,
                  unusedTrialVideos,
                  bonusVideosAvailable: totalBonusVideos,
                });
              } catch (error) {
                console.error("[Better Auth] Error in onLinkAccount:", error);
                // Don't throw - let Better Auth complete the link
                // The bonus can be granted later via reconciliation check
              }
            },
          }),
        ],

        // Database hooks to ensure custom fields are populated when users are created
        // NOTE: Better Auth's Drizzle adapter strips custom fields from `before` hook,
        // so we use `after` hook to update the user with custom fields after creation
        databaseHooks: {
          user: {
            create: {
              before: async (user) => {
                // Debug: Log when hook is triggered
                console.log("[Better Auth Hook] Creating user:", user.id, user.email);
                return { data: user };
              },
              after: async (user) => {
                console.log("[Better Auth Hook] User created, now setting custom fields:", user.id);

                const db = drizzle(env.DB, { schema });

                // Detect if user is anonymous based on email domain
                const isAnonymous = user.email?.endsWith("@anonymous.miraidub.ai") ?? true;

                // Grant 2 bonus videos if not anonymous (direct email signup or OAuth)
                const bonusVideos = isAnonymous ? 0 : 2;

                try {
                  await db
                    .update(schema.users)
                    .set({
                      isAnonymous,
                      trialVideosUsed: 0,
                      bonusVideosAvailable: bonusVideos,
                      creditsBalance: 0,
                      plan: "free",
                      updatedAt: new Date(),
                    })
                    .where(eq(schema.users.id, user.id))
                    .execute();

                  console.log("[Better Auth Hook] Custom fields set for user:", user.id, { isAnonymous, bonusVideos });
                } catch (error) {
                  console.error("[Better Auth Hook] Error setting custom fields:", error);
                }
              },
            },
          },
        },

        rateLimit: {
          enabled: true,
          window: 60,
          max: 100,
          customRules: {
            "/sign-in/email": { window: 60, max: 10 },
            "/sign-up/email": { window: 60, max: 5 },
            "/sign-in/anonymous": { window: 60, max: 20 },
            "/sign-in/social": { window: 60, max: 10 },
          },
        },

        session: {
          expiresIn: 60 * 60 * 24 * 30, // 30 days
          updateAge: 60 * 60 * 24, // Update session every 24 hours
        },

        trustedOrigins: [
          "exp://",
          "exp://**",
          "miraidub://",
          "miraichat://",
          "miraidub://**",
          "miraichat://**",
          "https://miraidub.ai",
          "https://miraichat.app",
          "https://www.miraichat.app",
          "https://appleid.apple.com",
          "http://localhost:8081",
          "http://localhost:19000",
        ],

        // Advanced settings for mobile app support
        // Mobile apps (React Native/Expo) don't send Origin headers like browsers do,
        // so we need to disable the origin check for mobile requests
        advanced: {
          disableCSRFCheck: true, // Mobile apps don't have CSRF vulnerabilities like browsers
        },
      }
    ),
  });
}

/**
 * Auth instance type
 */
export type Auth = ReturnType<typeof createAuth>;

/**
 * Get session and user from request
 */
export async function getSession(auth: Auth, request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    return session;
  } catch {
    return null;
  }
}
