import React from "react";
import { View, Animated } from "react-native";

interface OnboardingPaginationProps {
  totalSlides: number;
  currentIndex: number;
  scrollX: Animated.Value;
  slideWidth: number;
}

export function OnboardingPagination({
  totalSlides,
  currentIndex,
  scrollX,
  slideWidth,
}: OnboardingPaginationProps) {
  return (
    <View className="flex-row items-center justify-center py-4">
      {Array.from({ length: totalSlides }).map((_, index) => {
        const inputRange = [
          (index - 1) * slideWidth,
          index * slideWidth,
          (index + 1) * slideWidth,
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
            className="h-2 rounded-full bg-primary-500 mx-1"
            style={{
              width: dotWidth,
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}

export default OnboardingPagination;
