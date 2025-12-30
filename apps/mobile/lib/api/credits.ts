import { apiClient, PaginatedData } from "./client";

export type CreditBalance = {
  balance: number;
  trialVideosUsed: number;
  trialVideosRemaining: number;
  bonusVideosAvailable: number;
  plan: "free" | "pro" | "enterprise";
  isAnonymous: boolean;
};

export type CreditPackage = {
  id: string;
  name: string;
  seconds: number;
  price: number;
  popular?: boolean;
};

export type CreditTransaction = {
  id: string;
  type: "purchase" | "usage" | "refund" | "bonus" | "subscription";
  creditsAmount: number;
  balanceAfter: number;
  description: string | null;
  videoId: string | null;
  createdAt: string;
};

export type TransactionHistoryParams = {
  page?: number;
  limit?: number;
  type?: CreditTransaction["type"];
};

export type CheckoutResponse = {
  checkoutUrl: string;
  checkoutId: string;
};

export const creditsApi = {
  /**
   * Get current credit balance and usage info
   */
  async getBalance(): Promise<CreditBalance> {
    return apiClient.get<CreditBalance>("/api/credits/balance");
  },

  /**
   * Get available credit packages
   */
  async getPackages(): Promise<CreditPackage[]> {
    return apiClient.get<CreditPackage[]>("/api/credits/packages");
  },

  /**
   * Get transaction history
   */
  async getHistory(params: TransactionHistoryParams = {}): Promise<PaginatedData<CreditTransaction>> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.type) query.set("type", params.type);

    const queryString = query.toString();
    const endpoint = `/api/credits/history${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<PaginatedData<CreditTransaction>>(endpoint);
  },

  /**
   * Create a checkout session for purchasing credits
   * Returns a Polar checkout URL to open in browser
   */
  async createCheckout(
    packageId: string,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<CheckoutResponse> {
    return apiClient.post<CheckoutResponse>("/api/credits/checkout", {
      packageId,
      successUrl,
      cancelUrl,
    });
  },
};
