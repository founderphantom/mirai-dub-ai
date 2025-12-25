import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { anonymous } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1";
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
          },
        },

        plugins: [
          anonymous({
            emailDomainName: "anonymous.miraidub.ai",
          }),
        ],

        // Database hooks to ensure custom fields are populated when users are created
        databaseHooks: {
          user: {
            create: {
              before: async (user) => {
                // Debug: Log when hook is triggered
                console.log("[Better Auth Hook] Creating user:", user.id, user.email);

                // Detect if user is anonymous based on email domain or explicit flag
                const isAnonymous = user.isAnonymous ?? user.email?.endsWith("@anonymous.miraidub.ai") ?? true;

                // Grant 2 bonus videos if not anonymous
                const initialBonus = !isAnonymous ? 2 : 0;

                // Ensure custom fields have defaults for all user types (anonymous, email, OAuth)
                const userData = {
                  ...user,
                  // Custom fields with defaults (only set if not already provided)
                  isAnonymous,
                  trialVideosUsed: user.trialVideosUsed ?? 0,
                  bonusVideosAvailable: user.bonusVideosAvailable ?? initialBonus,
                  creditsBalance: user.creditsBalance ?? 0,
                  plan: user.plan ?? "free",
                };

                console.log("[Better Auth Hook] User data with defaults:", JSON.stringify(userData, null, 2));

                return {
                  data: userData,
                };
              },
              after: async (user) => {
                // Debug: Confirm user was created
                console.log("[Better Auth Hook] User created successfully:", user.id);
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
          "miraidub://",
          "https://miraidub.ai",
          "http://localhost:8081",
          "http://localhost:19000",
        ],
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
