import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "@/lib/queryClient";
import { ToastProvider } from "@/components/ui/Toast";
import { QUERY_KEYS } from "@/lib/constants";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/**
 * Handle deep links for payment callbacks
 */
function useDeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    // Handle deep links when app is already open
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };

    function handleDeepLink(url: string) {
      try {
        const parsed = Linking.parse(url);

        // Handle payment deep links
        if (parsed.path === "credits/success" || parsed.path === "purchase/success") {
          // Refresh credits balance
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.credits });
          router.push("/credits/success");
        } else if (parsed.path === "credits/cancel" || parsed.path === "purchase/cancel") {
          router.push("/credits/cancel");
        }
      } catch (error) {
        console.error("Error handling deep link:", error);
      }
    }
  }, [router]);
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  // Handle deep links
  useDeepLinkHandler();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade",
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding/index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="video/[id]"
                options={{
                  presentation: "card",
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="video/processing"
                options={{
                  presentation: "card",
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="account"
                options={{
                  presentation: "card",
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="credits/index"
                options={{
                  presentation: "card",
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="credits/success"
                options={{
                  presentation: "modal",
                  animation: "fade",
                }}
              />
              <Stack.Screen
                name="credits/cancel"
                options={{
                  presentation: "modal",
                  animation: "fade",
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </ToastProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
