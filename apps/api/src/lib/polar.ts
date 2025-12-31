import { Polar } from "@polar-sh/sdk";

/**
 * Credit packages configuration
 * These should match the products configured in Polar dashboard
 */
export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    seconds: 160,
    priceUsd: 9,
    polarProductId: "e4f7d80d-6c8a-4994-a077-fcecfc4f20bd",
  },
  {
    id: "creator",
    name: "Creator",
    seconds: 520,
    priceUsd: 29,
    polarProductId: "debe3fe0-1442-4df6-a506-2c279585ba05",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    seconds: 1100,
    priceUsd: 59,
    polarProductId: "ccf85a20-eaf1-48a9-a3ca-e29433723958",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    seconds: 3000,
    priceUsd: 149,
    polarProductId: "08c271ef-59b5-4b81-a333-950accd488fc",
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
    products: [params.productId], // SDK 0.42.1 expects products array
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
