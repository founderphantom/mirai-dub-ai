import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Home, AlertCircle } from "lucide-react-native";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-20 h-20 bg-neutral-100 rounded-full items-center justify-center mb-6">
          <AlertCircle size={40} color="#94a3b8" />
        </View>
        <Text className="text-2xl font-bold text-neutral-900 mb-2 text-center">
          Page Not Found
        </Text>
        <Text className="text-neutral-500 text-center mb-8">
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Pressable
          className="bg-primary-500 rounded-xl py-4 px-8 flex-row items-center active:bg-primary-600"
          onPress={() => router.replace("/(tabs)")}
        >
          <Home size={20} color="#fff" />
          <Text className="text-white font-semibold ml-2">Go to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
