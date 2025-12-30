import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  CreditCard,
  Sparkles,
  Check,
  Zap,
} from "lucide-react-native";
import { useSession } from "@/lib/api/auth";
import { useCredits, useCreditPackages, formatCredits } from "@/hooks";
import { creditsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

export default function CreditsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: credits, isLoading: isLoadingCredits } = useCredits();
  const { data: packages, isLoading: isLoadingPackages } = useCreditPackages();
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);

  const user = session?.user;
  const isAnonymous = user?.isAnonymous !== false;

  const handlePurchase = async (packageId: string) => {
    // Require full account
    if (isAnonymous) {
      Alert.alert(
        "Account Required",
        "Please sign up for an account to purchase credits.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign Up", onPress: () => router.push("/(auth)/signup") },
        ]
      );
      return;
    }

    try {
      setPurchasingPackageId(packageId);

      // Create checkout session
      const { checkoutUrl } = await creditsApi.createCheckout(
        packageId,
        "miraidub://credits/success",
        "miraidub://credits/cancel"
      );

      // Open in-app browser
      const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
        dismissButtonStyle: "cancel",
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        toolbarColor: "#3b82f6",
        controlsColor: "#ffffff",
      });

      // Refresh balance after browser closes
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.credits });

      // If dismissed (not redirected via deep link), show message
      if (result.type === "cancel") {
        // User closed the browser without completing
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      Alert.alert("Error", "Failed to start checkout. Please try again.");
    } finally {
      setPurchasingPackageId(null);
    }
  };

  const getPricePerSecond = (price: number, seconds: number) => {
    return (price / seconds).toFixed(3);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-4 flex-row items-center border-b border-neutral-100">
        <Pressable
          className="mr-2 -ml-2 p-2"
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-neutral-900">Buy Credits</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {/* Current Balance */}
        <View className="bg-gradient-to-r from-primary-500 to-primary-600 bg-primary-500 rounded-xl p-5 mb-6">
          <View className="flex-row items-center mb-2">
            <CreditCard size={20} color="#fff" />
            <Text className="text-white/80 ml-2 font-medium">Current Balance</Text>
          </View>
          {isLoadingCredits ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text className="text-white text-4xl font-bold">
                {formatCredits(credits?.balance || 0)}
              </Text>
              <Text className="text-white/70 text-sm mt-1">
                {credits?.balance || 0} seconds of video translation
              </Text>
              {(credits?.trialVideosRemaining ?? 0) > 0 && (
                <View className="mt-3 bg-white/20 rounded-lg px-3 py-2">
                  <Text className="text-white text-sm">
                    + {credits?.trialVideosRemaining} free trial video available
                  </Text>
                </View>
              )}
              {(credits?.bonusVideosAvailable ?? 0) > 0 && (
                <View className="mt-2 bg-white/20 rounded-lg px-3 py-2">
                  <Text className="text-white text-sm">
                    + {credits?.bonusVideosAvailable} bonus videos available
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Anonymous User Banner */}
        {isAnonymous && (
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <Zap size={20} color="#d97706" />
              <View className="flex-1 ml-3">
                <Text className="text-amber-800 font-semibold mb-1">
                  Create an account to purchase
                </Text>
                <Text className="text-amber-700 text-sm mb-3">
                  Sign up to unlock credit purchases and get 2 bonus free videos!
                </Text>
                <Pressable
                  className="bg-amber-500 rounded-lg py-2.5 px-4 self-start active:bg-amber-600"
                  onPress={() => router.push("/(auth)/signup")}
                >
                  <Text className="text-white font-semibold">Sign Up Now</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Packages Header */}
        <View className="mb-4">
          <Text className="text-lg font-bold text-neutral-900">
            Choose a Package
          </Text>
          <Text className="text-neutral-500 text-sm mt-1">
            More credits = better value per second
          </Text>
        </View>

        {/* Package Cards */}
        {isLoadingPackages ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <View className="space-y-4">
            {packages?.map((pkg) => {
              const isPurchasing = purchasingPackageId === pkg.id;
              const isPopular = pkg.popular;

              return (
                <Pressable
                  key={pkg.id}
                  className={`relative rounded-xl border-2 p-4 ${
                    isPopular
                      ? "border-primary-500 bg-primary-50"
                      : "border-neutral-200 bg-white"
                  } ${isPurchasing ? "opacity-70" : ""}`}
                  onPress={() => handlePurchase(pkg.id)}
                  disabled={isPurchasing || purchasingPackageId !== null}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <View className="absolute -top-3 left-4 bg-primary-500 rounded-full px-3 py-1 flex-row items-center">
                      <Sparkles size={12} color="#fff" />
                      <Text className="text-white text-xs font-semibold ml-1">
                        Most Popular
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-neutral-900">
                        {pkg.name}
                      </Text>
                      <Text className="text-neutral-500 text-sm">
                        {pkg.seconds} seconds of video
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-2xl font-bold text-neutral-900">
                        ${pkg.price}
                      </Text>
                      <Text className="text-neutral-400 text-xs">
                        ${getPricePerSecond(pkg.price, pkg.seconds)}/sec
                      </Text>
                    </View>
                  </View>

                  {/* Features */}
                  <View className="mt-3 pt-3 border-t border-neutral-100">
                    <View className="flex-row flex-wrap gap-2">
                      <View className="flex-row items-center">
                        <Check size={14} color="#22c55e" />
                        <Text className="text-neutral-600 text-xs ml-1">
                          Never expires
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Check size={14} color="#22c55e" />
                        <Text className="text-neutral-600 text-xs ml-1">
                          All languages
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Check size={14} color="#22c55e" />
                        <Text className="text-neutral-600 text-xs ml-1">
                          HD quality
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Buy Button */}
                  <Pressable
                    className={`mt-4 rounded-lg py-3 items-center ${
                      isPopular
                        ? "bg-primary-500 active:bg-primary-600"
                        : "bg-neutral-900 active:bg-neutral-800"
                    }`}
                    onPress={() => handlePurchase(pkg.id)}
                    disabled={isPurchasing || purchasingPackageId !== null}
                  >
                    {isPurchasing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-semibold">
                        Buy {pkg.name}
                      </Text>
                    )}
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Info Footer */}
        <View className="mt-6 bg-neutral-50 rounded-xl p-4">
          <Text className="text-neutral-600 text-sm text-center">
            Payments are securely processed by Polar.{"\n"}
            Credits are added instantly after purchase.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
