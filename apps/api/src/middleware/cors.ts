import { cors } from "hono/cors";

/**
 * CORS configuration for the API
 * Allows requests from mobile app and development environments
 */
export const corsMiddleware = cors({
  origin: [
    // Expo development
    "exp://",
    "http://localhost:8081",
    "http://localhost:19000",
    "http://localhost:19006",

    // Production mobile app deep links
    "miraidub://",

    // Production web domains
    "https://miraidub.ai",
    "https://www.miraidub.ai",
    "https://api.miraidub.ai",

    // Cloudflare Workers web app
    "https://mirai-dub-web.founder-968.workers.dev",
  ],
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-Part-Number",
    "X-Total-Parts",
  ],
  exposeHeaders: ["Content-Length", "Content-Type"],
  maxAge: 86400, // 24 hours
});
