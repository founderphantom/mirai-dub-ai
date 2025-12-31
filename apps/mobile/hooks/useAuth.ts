import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { authClient } from "@/lib/api/auth";
import { apiClient, ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";
import type { Credentials, SignupData, ConvertAccountData } from "@/types/user";
import { QUERY_KEYS } from "@/lib/constants";

/**
 * Hook to get current session from Better Auth
 */
export function useSession() {
  return authClient.useSession();
}

/**
 * Hook for anonymous sign-in (auto sign-in for new users)
 */
export function useAnonymousSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signIn.anonymous();
      if (result.error) {
        throw new ApiError(result.error.code || "AUTH_ERROR", result.error.message || "Failed to sign in", 401);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user });
      router.replace("/home");
    },
  });
}

/**
 * Hook for email/password login
 */
export function useEmailSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: Credentials) => {
      const result = await authClient.signIn.email({
        email: credentials.email,
        password: credentials.password,
      });
      if (result.error) {
        throw new ApiError(result.error.code || "AUTH_ERROR", result.error.message || "Invalid credentials", 401);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user });
      router.replace("/home");
    },
  });
}

/**
 * Hook for email/password signup
 */
export function useEmailSignUp() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SignupData) => {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      if (result.error) {
        throw new ApiError(result.error.code || "AUTH_ERROR", result.error.message || "Failed to create account", 400);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user });
      router.replace("/home");
    },
  });
}

/**
 * Hook for Google OAuth sign-in
 */
export function useGoogleSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/home",
      });
      if (result.error) {
        throw new ApiError(result.error.code || "AUTH_ERROR", result.error.message || "Google sign-in failed", 401);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user });
      router.replace("/home");
    },
  });
}

/**
 * Hook for Apple OAuth sign-in
 */
export function useAppleSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signIn.social({
        provider: "apple",
        callbackURL: "/home",
      });
      if (result.error) {
        throw new ApiError(result.error.code || "AUTH_ERROR", result.error.message || "Apple sign-in failed", 401);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user });
      router.replace("/home");
    },
  });
}

/**
 * Hook to convert anonymous account to full account
 * Uses Better Auth's signUp.email() which automatically detects the anonymous session
 * and triggers the onLinkAccount callback to link the accounts
 */
export function useConvertAccount() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConvertAccountData) => {
      // Use signUp.email() - Better Auth automatically detects anonymous session
      // and triggers onLinkAccount callback to link the accounts
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        console.error("[Convert Account] Error:", result.error);
        throw new ApiError(
          result.error.code || "CONVERSION_ERROR",
          result.error.message || "Failed to convert account",
          400
        );
      }

      return result.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user });
      router.replace("/home");
    },
    onError: (error) => {
      console.error("[Convert Account] Mutation error:", error);
    },
  });
}

/**
 * Hook for sign out
 */
export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const reset = useAuthStore((state) => state.reset);

  return useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      reset();
      queryClient.clear();
      router.replace("/(auth)/login");
    },
  });
}

/**
 * Combined auth hook for common operations
 */
export function useAuth() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const hasCompletedOnboarding = useAuthStore((state) => state.hasCompletedOnboarding);
  const setOnboardingComplete = useAuthStore((state) => state.setOnboardingComplete);

  const anonymousSignIn = useAnonymousSignIn();
  const emailSignIn = useEmailSignIn();
  const emailSignUp = useEmailSignUp();
  const googleSignIn = useGoogleSignIn();
  const appleSignIn = useAppleSignIn();
  const convertAccount = useConvertAccount();
  const signOutMutation = useSignOut();

  const user = session?.user ?? null;
  const isAuthenticated = !!session?.session;
  const isAnonymous = user?.isAnonymous ?? true;

  return {
    // State
    user,
    session,
    isAuthenticated,
    isAnonymous,
    isSessionLoading,
    hasCompletedOnboarding,
    setOnboardingComplete,

    // Auth methods
    signInAnonymous: anonymousSignIn.mutateAsync,
    signInEmail: emailSignIn.mutateAsync,
    signUpEmail: emailSignUp.mutateAsync,
    signInGoogle: googleSignIn.mutateAsync,
    signInApple: appleSignIn.mutateAsync,
    convertAccount: convertAccount.mutateAsync,
    signOut: signOutMutation.mutateAsync,

    // Loading states
    isSigningIn: emailSignIn.isPending || googleSignIn.isPending || appleSignIn.isPending || anonymousSignIn.isPending,
    isSigningUp: emailSignUp.isPending,
    isConvertingAccount: convertAccount.isPending,
    isSigningOut: signOutMutation.isPending,

    // Errors
    signInError: emailSignIn.error || googleSignIn.error || appleSignIn.error || anonymousSignIn.error,
    signUpError: emailSignUp.error,
    convertError: convertAccount.error,
  };
}

export default useAuth;
