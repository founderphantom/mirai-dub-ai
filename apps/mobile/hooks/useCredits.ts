import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { creditsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import type { CreditBalance, CreditPackage, CreditTransaction } from "@/lib/api/credits";
import * as WebBrowser from "expo-web-browser";

/**
 * Hook to fetch current credit balance
 */
export function useCredits() {
  return useQuery({
    queryKey: QUERY_KEYS.credits,
    queryFn: creditsApi.getBalance,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch available credit packages
 */
export function useCreditPackages() {
  return useQuery({
    queryKey: ["credit-packages"],
    queryFn: creditsApi.getPackages,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch transaction history with pagination
 */
export function useTransactionHistory(type?: CreditTransaction["type"]) {
  return useInfiniteQuery({
    queryKey: ["transactions", type],
    queryFn: async ({ pageParam = 1 }) => {
      return creditsApi.getHistory({ page: pageParam, limit: 20, type });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to create a checkout session and open payment page
 */
export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packageId: string) => {
      const result = await creditsApi.createCheckout(packageId);
      // Open checkout URL in browser
      await WebBrowser.openBrowserAsync(result.checkoutUrl);
      return result;
    },
    onSuccess: () => {
      // Invalidate credits to refetch after payment
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.credits });
    },
  });
}

/**
 * Helper hook to check if user has enough credits for a duration
 */
export function useHasCredits(minutesNeeded: number) {
  const { data: credits } = useCredits();

  if (!credits) return { hasCredits: false, canUseTrial: false, canUseBonus: false };

  // Check trial (anonymous users get 1 free video)
  if (credits.trialVideosRemaining > 0) {
    return { hasCredits: true, canUseTrial: true, canUseBonus: false };
  }

  // Check bonus videos
  if (credits.bonusVideosAvailable > 0) {
    return { hasCredits: true, canUseTrial: false, canUseBonus: true };
  }

  // Check credit balance
  return {
    hasCredits: credits.balance >= minutesNeeded,
    canUseTrial: false,
    canUseBonus: false,
  };
}

/**
 * Helper to format credit balance for display
 */
export function formatCredits(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}

export default useCredits;

// Re-export types for convenience
export type { CreditBalance, CreditPackage, CreditTransaction };
