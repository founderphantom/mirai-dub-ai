import React from "react";
import { View, Text, Image, useWindowDimensions } from "react-native";

interface OnboardingSlideProps {
  illustration: React.ReactNode;
  badge?: string;
  title: string;
  subtitle: string;
  highlight?: string;
}

export function OnboardingSlide({
  illustration,
  badge,
  title,
  subtitle,
  highlight,
}: OnboardingSlideProps) {
  const { width } = useWindowDimensions();

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ width }}>
      {/* Illustration */}
      <View className="w-64 h-64 items-center justify-center mb-8">
        {illustration}
      </View>

      {/* Badge */}
      {badge && (
        <View className="bg-primary-100 px-4 py-1.5 rounded-full mb-4">
          <Text className="text-primary-600 text-sm font-semibold">
            {badge}
          </Text>
        </View>
      )}

      {/* Title */}
      <Text className="text-2xl font-bold text-neutral-900 text-center mb-3">
        {title}
      </Text>

      {/* Highlight (if any) */}
      {highlight && (
        <Text className="text-2xl font-bold text-primary-500 text-center mb-3">
          {highlight}
        </Text>
      )}

      {/* Subtitle */}
      <Text className="text-base text-neutral-600 text-center leading-6">
        {subtitle}
      </Text>
    </View>
  );
}

export default OnboardingSlide;
