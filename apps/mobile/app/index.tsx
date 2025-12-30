import { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/hooks/useAuth";
import { authClient } from "@/lib/api/auth";

export default function Index() {
  const hasCompletedOnboarding = useAuthStore((state) => state.hasCompletedOnboarding);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const [hasAttemptedAnonymous, setHasAttemptedAnonymous] = useState(false);

  const { isAuthenticated, isSessionLoading, signInAnonymous, isSigningIn, session } = useAuth();

  // Auto sign-in anonymously after onboarding if not authenticated
  useEffect(() => {
    const initAuth = async () => {
      // Wait for session to load
      if (isSessionLoading) {
        console.log("[Auth Init] Session loading...");
        return;
      }

      // If already authenticated, mark as initialized
      if (isAuthenticated) {
        console.log("[Auth Init] Already authenticated, skipping anonymous sign-in");
        console.log("[Auth Init] Session:", JSON.stringify(session, null, 2));
        console.log("[Auth Init] Cookies:", authClient.getCookie());
        setInitialized(true);
        return;
      }

      // If onboarding completed but not authenticated, try anonymous sign-in once
      if (hasCompletedOnboarding && !isAuthenticated && !isSigningIn && !hasAttemptedAnonymous) {
        console.log("[Auth Init] Attempting anonymous sign-in...");
        setHasAttemptedAnonymous(true);
        try {
          const result = await signInAnonymous();
          console.log("[Auth Init] Anonymous sign-in successful:", result);
        } catch (error) {
          console.error("[Auth Init] Anonymous sign-in failed:", error);
          // Silent fail - anonymous sign-in is optional
          // User will be redirected to login screen instead
        } finally {
          setInitialized(true);
        }
      } else if (!hasCompletedOnboarding) {
        console.log("[Auth Init] Onboarding not completed");
        // If onboarding not completed, mark as initialized so we can show onboarding
        setInitialized(true);
      }
    };

    initAuth();
  }, [hasCompletedOnboarding, isAuthenticated, isSessionLoading, isSigningIn, hasAttemptedAnonymous, signInAnonymous, setInitialized]);

  // Show loading while session is loading or trying anonymous sign-in
  if (isSessionLoading || (isSigningIn && !hasAttemptedAnonymous)) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // If user hasn't completed onboarding, show onboarding (skip on web)
  if (!hasCompletedOnboarding && Platform.OS !== 'web') {
    return <Redirect href="/onboarding" />;
  }

  // If not authenticated after onboarding (anonymous sign-in failed or skipped), show login
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Otherwise, go to main app
  return <Redirect href="/home" />;
}
