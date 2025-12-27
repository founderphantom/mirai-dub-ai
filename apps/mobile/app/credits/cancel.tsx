import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react-native";

export default function PurchaseCancelScreen() {
  const router = useRouter();

  const handleTryAgain = () => {
    router.back(); // Go back to credits screen
  };

  const handleGoBack = () => {
    // Go back to where they came from (before credits screen)
    if (router.canGoBack()) {
      router.back();
      router.back();
    } else {
      router.replace("/(tabs)/home");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        {/* Cancel Icon */}
        <View className="w-24 h-24 bg-neutral-100 rounded-full items-center justify-center mb-6">
          <XCircle size={48} color="#6b7280" />
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-neutral-900 text-center mb-2">
          Purchase Cancelled
        </Text>
        <Text className="text-neutral-500 text-center mb-8">
          No worries! You can try again anytime.
        </Text>

        {/* Info Card */}
        <View className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 w-full mb-8">
          <Text className="text-neutral-600 text-sm text-center">
            Your account has not been charged.{"\n"}
            Credits are still available at the same prices.
          </Text>
        </View>

        {/* Actions */}
        <View className="w-full space-y-3">
          <Pressable
            className="bg-primary-500 rounded-xl py-4 px-6 flex-row items-center justify-center active:bg-primary-600"
            onPress={handleTryAgain}
          >
            <RefreshCw size={18} color="#fff" />
            <Text className="text-white font-semibold text-base ml-2">
              Try Again
            </Text>
          </Pressable>

          <Pressable
            className="bg-neutral-100 rounded-xl py-4 px-6 flex-row items-center justify-center active:bg-neutral-200"
            onPress={handleGoBack}
          >
            <ArrowLeft size={18} color="#374151" />
            <Text className="text-neutral-700 font-medium text-base ml-2">
              Go Back
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
