import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react-native";
import { useCredits, formatCredits } from "@/hooks";
import { QUERY_KEYS } from "@/lib/constants";

export default function PurchaseSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ checkout_id?: string }>();
  const queryClient = useQueryClient();
  const { data: credits, refetch } = useCredits();

  // Refresh credits when screen loads
  useEffect(() => {
    // Invalidate and refetch credits
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.credits });
    refetch();
  }, [queryClient, refetch]);

  const handleContinue = () => {
    // Go back to the previous screen or home
    if (router.canGoBack()) {
      router.back();
      router.back(); // Go back twice to skip the credits screen
    } else {
      router.replace("/(tabs)/home");
    }
  };

  const handleTranslateNow = () => {
    router.replace("/(tabs)/upload");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        {/* Success Icon */}
        <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
          <CheckCircle size={48} color="#22c55e" />
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-neutral-900 text-center mb-2">
          Purchase Complete!
        </Text>
        <Text className="text-neutral-500 text-center mb-8">
          Your credits have been added to your account
        </Text>

        {/* Balance Card */}
        <View className="bg-primary-50 border border-primary-200 rounded-xl p-6 w-full mb-8">
          <View className="flex-row items-center justify-center mb-2">
            <Sparkles size={20} color="#3b82f6" />
            <Text className="text-primary-600 font-medium ml-2">
              New Balance
            </Text>
          </View>
          <Text className="text-4xl font-bold text-primary-700 text-center">
            {formatCredits(credits?.balance || 0)}
          </Text>
          <Text className="text-primary-600/70 text-sm text-center mt-1">
            {credits?.balance || 0} minutes available
          </Text>
        </View>

        {/* Actions */}
        <View className="w-full space-y-3">
          <Pressable
            className="bg-primary-500 rounded-xl py-4 px-6 flex-row items-center justify-center active:bg-primary-600"
            onPress={handleTranslateNow}
          >
            <Text className="text-white font-semibold text-base">
              Translate a Video Now
            </Text>
            <ArrowRight size={18} color="#fff" className="ml-2" />
          </Pressable>

          <Pressable
            className="bg-neutral-100 rounded-xl py-4 px-6 items-center active:bg-neutral-200"
            onPress={handleContinue}
          >
            <Text className="text-neutral-700 font-medium text-base">
              Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
