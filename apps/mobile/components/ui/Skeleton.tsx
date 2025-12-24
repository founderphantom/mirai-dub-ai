import React, { useEffect, useRef } from "react";
import { View, Animated, type ViewProps } from "react-native";

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  className,
  style,
  ...props
}: SkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#E5E7EB",
          opacity,
        },
        style,
      ]}
      className={className}
      {...props}
    />
  );
}

// Common skeleton patterns
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <View className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? "70%" : "100%"}
          height={16}
          className={i > 0 ? "mt-2" : ""}
        />
      ))}
    </View>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <View className={`bg-white rounded-xl p-4 ${className || ""}`}>
      <Skeleton width="100%" height={160} borderRadius={12} />
      <Skeleton width="60%" height={20} className="mt-3" />
      <Skeleton width="40%" height={16} className="mt-2" />
    </View>
  );
}

export default Skeleton;
