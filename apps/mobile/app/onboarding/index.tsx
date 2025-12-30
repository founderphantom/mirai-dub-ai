import { useState, useRef } from "react";
import { View, Text, Pressable, Dimensions, Image, FlatList, Animated, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Sparkles, Upload, Languages, Download, Users, Gift, ArrowRight } from "lucide-react-native";
import { useAuthStore } from "@/stores/authStore";
import { CarouselWrapper } from "@/components/onboarding/CarouselWrapper";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type OnboardingSlide = {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  backgroundColor: string;
};

const slides: OnboardingSlide[] = [
  {
    id: "1",
    icon: Sparkles,
    title: "What if you spoke",
    subtitle: "every language?",
    description:
      "Mirai Dub AI translates your videos with lip sync so real, viewers can't tell it's AI.",
    cta: "See the magic",
    backgroundColor: "bg-primary-50",
  },
  {
    id: "2",
    icon: Upload,
    title: "Create once.",
    subtitle: "Reach the world.",
    description:
      "Upload your video, select your language, and download your dubbed video. It's that simple.",
    cta: "Try it free",
    backgroundColor: "bg-info-50",
  },
  {
    id: "3",
    icon: Users,
    title: "Join 10,000+",
    subtitle: "creators going global",
    description:
      "Content creators, educators, and businesses are reaching new audiences worldwide.",
    cta: "Get started",
    backgroundColor: "bg-success-50",
  },
  {
    id: "4",
    icon: Gift,
    title: "Your first video",
    subtitle: "is on us",
    description:
      "Try Mirai Dub AI free — no account needed. Sign up for 2 more free videos.",
    cta: "Translate my first video",
    backgroundColor: "bg-warning-50",
  },
];

// How it works steps for slide 2
const steps = [
  { icon: Upload, label: "Upload" },
  { icon: Languages, label: "Select" },
  { icon: Download, label: "Download" },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingComplete } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleWebScroll = (offsetX: number) => {
    const currentSlide = Math.round(offsetX / SCREEN_WIDTH);
    if (currentSlide !== currentIndex && currentSlide >= 0 && currentSlide < slides.length) {
      setCurrentIndex(currentSlide);
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      if (Platform.OS === 'web') {
        // Web-specific scroll using scrollTo
        flatListRef.current?.scrollTo({
          x: nextIndex * SCREEN_WIDTH,
          animated: true
        });
      } else {
        // Native platforms use scrollToIndex
        flatListRef.current?.scrollToIndex({ index: nextIndex });
      }
      setCurrentIndex(nextIndex);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setOnboardingComplete();
    router.replace("/(auth)/login");
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const Icon = item.icon;

    return (
      <View
        className={`flex-1 ${item.backgroundColor}`}
        style={{ width: SCREEN_WIDTH }}
      >
        <View className="flex-1 px-6 justify-center items-center">
          {/* Icon */}
          <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center mb-8 shadow-floating">
            <Icon size={48} color="#3b82f6" />
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-neutral-900 text-center mb-1">
            {item.title}
          </Text>
          <Text className="text-3xl font-bold text-primary-500 text-center mb-4">
            {item.subtitle}
          </Text>

          {/* Steps for slide 2 */}
          {index === 1 && (
            <View className="flex-row items-center justify-center mb-6">
              {steps.map((step, stepIndex) => (
                <View key={step.label} className="flex-row items-center">
                  <View className="items-center">
                    <View className="w-14 h-14 bg-white rounded-xl items-center justify-center shadow-raised mb-2">
                      <step.icon size={24} color="#3b82f6" />
                    </View>
                    <Text className="text-neutral-700 text-sm font-medium">
                      {step.label}
                    </Text>
                  </View>
                  {stepIndex < steps.length - 1 && (
                    <View className="px-3 pt-4">
                      <ArrowRight size={20} color="#94a3b8" />
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          <Text className="text-neutral-600 text-center text-base leading-6 px-4 max-w-sm">
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Skip Button */}
      <View className="absolute top-12 right-6 z-10">
        <Pressable onPress={handleSkip}>
          <Text className="text-neutral-500 font-medium">Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <CarouselWrapper
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onScrollUpdate={Platform.OS === 'web' ? handleWebScroll : undefined}
        onViewableItemsChanged={Platform.OS !== 'web' ? onViewableItemsChanged : undefined}
        viewabilityConfig={Platform.OS !== 'web' ? viewabilityConfig : undefined}
        bounces={false}
      />

      {/* Bottom Section */}
      <View className="px-6 pb-8">
        {/* Pagination Dots */}
        <View className="flex-row justify-center mb-6">
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                className="h-2 bg-primary-500 rounded-full mx-1"
                style={{
                  width: dotWidth,
                  opacity,
                }}
              />
            );
          })}
        </View>

        {/* CTA Button */}
        <Pressable
          className="bg-primary-500 rounded-xl py-4 flex-row items-center justify-center active:bg-primary-600"
          onPress={handleNext}
        >
          <Text className="text-white font-semibold text-base">
            {slides[currentIndex].cta}
          </Text>
          {currentIndex < slides.length - 1 && (
            <Text className="text-white ml-2">→</Text>
          )}
          {currentIndex === slides.length - 1 && (
            <Text className="text-white ml-2">🎬</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
