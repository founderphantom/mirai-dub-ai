import { ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Sparkles, Globe, Zap, Shield, Upload, Languages, Cpu, Download, Play } from "lucide-react-native";

// Feature card data
const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Lip Sync",
    description: "Natural-looking lip synchronization that removes the uncanny valley effect",
  },
  {
    icon: Globe,
    title: "50+ Languages",
    description: "Translate your content into any major language with native-quality dubbing",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get your translated videos in minutes, not days. Perfect for creators on the go",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your content is encrypted and secure. We never share your videos",
  },
];

// How it works steps
const steps = [
  {
    icon: Upload,
    number: 1,
    title: "Upload Your Video",
    description: "Drag and drop or select your video file",
  },
  {
    icon: Languages,
    number: 2,
    title: "Choose Languages",
    description: "Select source and target languages",
  },
  {
    icon: Cpu,
    number: 3,
    title: "AI Processing",
    description: "Our AI translates and syncs in minutes",
  },
  {
    icon: Download,
    number: 4,
    title: "Download & Share",
    description: "Get your dubbed video ready to publish",
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Hero Section */}
        <View className="px-4 pt-8 pb-6">
          {/* Badge */}
          <View className="flex-row items-center self-start bg-primary-50 rounded-full px-3 py-1.5 mb-4">
            <Sparkles size={14} color="#3b82f6" />
            <Text className="text-primary-600 text-xs font-medium ml-1.5">
              AI-Powered Video Translation
            </Text>
          </View>

          {/* Headline */}
          <Text className="text-4xl font-bold text-neutral-900 mb-3">
            Create once,{" "}
            <Text className="text-primary-500">reach the world</Text>
          </Text>

          {/* Subtext */}
          <Text className="text-base text-neutral-600 leading-6 mb-6">
            Break language barriers with AI-powered video dubbing. Translate your content into 50+ languages with natural lip-sync technology.
          </Text>

          {/* CTAs */}
          <Pressable
            className="bg-primary-500 rounded-lg py-4 px-6 flex-row items-center justify-center mb-3 active:bg-primary-600"
            onPress={() => router.push("/(tabs)/upload")}
          >
            <Text className="text-white font-semibold text-base">
              Start Free Translation
            </Text>
            <Text className="text-white ml-2">→</Text>
          </Pressable>

          <Pressable
            className="bg-white border border-neutral-200 rounded-lg py-4 px-6 flex-row items-center justify-center active:bg-neutral-50"
          >
            <Play size={18} color="#334155" fill="#334155" />
            <Text className="text-neutral-700 font-medium text-base ml-2">
              Watch Demo
            </Text>
          </Pressable>

          {/* Helper text */}
          <Text className="text-neutral-500 text-sm text-center mt-4">
            No credit card required • 1 free video translation
          </Text>
        </View>

        {/* Why Mirai Dub AI Section */}
        <View className="px-4 py-8 bg-neutral-50">
          <Text className="text-2xl font-bold text-neutral-900 text-center mb-2">
            Why Mirai Dub AI?
          </Text>
          <Text className="text-neutral-500 text-center mb-6">
            Professional video translation made simple
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {features.map((feature, index) => (
              <View
                key={index}
                className="bg-white rounded-lg p-4 shadow-raised"
                style={{ width: "48%" }}
              >
                <View className="w-10 h-10 bg-primary-50 rounded-lg items-center justify-center mb-3">
                  <feature.icon size={20} color="#3b82f6" />
                </View>
                <Text className="text-neutral-900 font-semibold text-base mb-1">
                  {feature.title}
                </Text>
                <Text className="text-neutral-500 text-sm leading-5">
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works Section */}
        <View className="px-4 py-8">
          <Text className="text-2xl font-bold text-neutral-900 text-center mb-2">
            How It Works
          </Text>
          <Text className="text-neutral-500 text-center mb-6">
            Four simple steps to global reach
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {steps.map((step, index) => (
              <View
                key={index}
                className="bg-white border border-neutral-200 rounded-lg p-4 mr-3"
                style={{ width: 200 }}
              >
                <View className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center mb-3">
                  <Text className="text-white font-bold text-sm">{step.number}</Text>
                </View>
                <View className="w-10 h-10 bg-neutral-100 rounded-lg items-center justify-center mb-3">
                  <step.icon size={20} color="#334155" />
                </View>
                <Text className="text-neutral-900 font-semibold text-base mb-1">
                  {step.title}
                </Text>
                <Text className="text-neutral-500 text-sm leading-5">
                  {step.description}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* CTA Section */}
        <View className="mx-4 bg-primary-500 rounded-xl p-6 items-center">
          <Text className="text-white text-2xl font-bold text-center mb-2">
            Ready to go global?
          </Text>
          <Text className="text-primary-100 text-center mb-6">
            Join thousands of creators reaching audiences worldwide with Mirai Dub AI
          </Text>
          <Pressable
            className="bg-white rounded-lg py-3 px-6 active:bg-neutral-100"
            onPress={() => router.push("/(tabs)/upload")}
          >
            <Text className="text-primary-600 font-semibold text-base">
              Get Started Free
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View className="px-4 pt-8 items-center">
          <Text className="text-neutral-400 text-sm text-center mb-3">
            © 2024 Mirai Dub AI. Create once, reach the world.
          </Text>
          <View className="flex-row gap-4">
            <Text className="text-neutral-500 text-sm">Privacy</Text>
            <Text className="text-neutral-500 text-sm">Terms</Text>
            <Text className="text-neutral-500 text-sm">Support</Text>
          </View>
        </View>
      </ScrollView>

      {/* TODO: REMOVE BEFORE PRODUCTION - Dev Reset Button */}
      <View className="absolute bottom-6 left-0 right-0 items-center">
        <Pressable
          className="bg-neutral-900/10 px-4 py-2 rounded-full"
          onPress={async () => {
            const { useAuthStore } = await import("@/stores/authStore");
            const { authClient } = await import("@/lib/api/auth");

            // Clear local state
            useAuthStore.getState().reset();

            // Sign out
            await authClient.signOut();

            // Reload app (using expo-updates would be better but this works for now)
            alert("App reset. Please restart the app.");
          }}
        >
          <Text className="text-xs text-neutral-500 font-medium">Dev: Reset App & Onboarding</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
