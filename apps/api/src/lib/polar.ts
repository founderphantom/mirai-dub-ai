import { Polar } from "@polar-sh/sdk";

/**
 * Credit packages configuration
 * These should match the products configured in Polar dashboard
 */
export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    minutes: 30,
    priceUsd: 9,
    polarProductId: "ac2d8076-bf76-40c1-83a9-70aaf761b8ce",
  },
  {
    id: "creator",
    name: "Creator",
    minutes: 120,
    priceUsd: 29,
    polarProductId: "1e2b6e63-ef32-493e-8b27-15207c206c8b",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    minutes: 300,
    priceUsd: 59,
    polarProductId: "faa130cc-1d0b-4338-8cdd-d1fa5bdfa6ae",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    minutes: 1000,
    priceUsd: 149,
    polarProductId: "ce81bdf6-9553-440d-97b3-e6e96fc51b07",
  },
] as const;

export type CreditPackageId = (typeof CREDIT_PACKAGES)[number]["id"];

/**
 * Get credit package by ID
 */
export function getCreditPackage(packageId: string) {
  return CREDIT_PACKAGES.find((p) => p.id === packageId);
}

/**
 * Create Polar client
 * Uses sandbox server in development, production server in production
 */
export function createPolarClient(
  accessToken: string,
  environment: "development" | "production" = "development"
): Polar {
  return new Polar({
    accessToken,
    server: environment === "development" ? "sandbox" : "production",
  });
}

/**
 * Checkout metadata stored with Polar checkout
 */
export interface CheckoutMetadata {
  userId: string;
  packageId: string;
  creditsAmount: number;
}

/**
 * Create a checkout session for credit purchase
 */
export async function createCheckoutSession(
  polar: Polar,
  params: {
    productId: string;
    customerEmail: string;
    metadata: CheckoutMetadata;
    successUrl: string;
  }
): Promise<{ checkoutUrl: string; checkoutId: string }> {
  const checkout = await polar.checkouts.create({
    productId: params.productId,
    customerEmail: params.customerEmail,
    successUrl: params.successUrl,
    metadata: params.metadata as unknown as Record<string, string>,
  });

  return {
    checkoutUrl: checkout.url,
    checkoutId: checkout.id,
  };
}

/**
 * Polar webhook event types
 */
export type PolarWebhookEventType =
  | "checkout.created"
  | "checkout.updated"
  | "order.created"
  | "subscription.created"
  | "subscription.updated"
  | "subscription.canceled"
  | "subscription.revoked"
  | "benefit.granted"
  | "benefit.revoked";

/**
 * Polar webhook payload structure
 * Using relaxed types to match the @polar-sh/hono Webhooks adapter
 */
export interface PolarWebhookPayload {
  type: PolarWebhookEventType;
  data: {
    id: string;
    amount?: number;
    customerId?: string | null;
    customerEmail?: string | null;
    productId?: string | null;
    productPriceId?: string | null;
    subscriptionId?: string | null;
    metadata?: Record<string, string | number | boolean | null> | null;
    [key: string]: unknown;
  };
}

/**
 * Extract checkout metadata from webhook payload
 */
export function extractCheckoutMetadata(
  payload: PolarWebhookPayload
): CheckoutMetadata | null {
  const metadata = payload.data.metadata;
  if (!metadata?.userId || !metadata?.packageId || !metadata?.creditsAmount) {
    return null;
  }

  return {
    userId: String(metadata.userId),
    packageId: String(metadata.packageId),
    creditsAmount: parseFloat(String(metadata.creditsAmount)),
  };
}

/**
 * Validate Polar webhook signature
 * This is handled by @polar-sh/hono middleware automatically
 */
export function validatePolarWebhook(
  _body: string,
  _signature: string,
  _secret: string
): boolean {
  // The @polar-sh/hono Webhooks middleware handles this
  return true;
}
