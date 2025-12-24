import React from "react";
import { View, Text } from "react-native";

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

const sizeStyles = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const variantStyles = {
  default: "bg-primary-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
};

export function Progress({
  value,
  max = 100,
  showLabel = false,
  size = "md",
  variant = "default",
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <View className={className}>
      {showLabel && (
        <View className="flex-row justify-between mb-1">
          <Text className="text-sm text-neutral-600">Progress</Text>
          <Text className="text-sm font-medium text-neutral-900">
            {Math.round(percentage)}%
          </Text>
        </View>
      )}
      <View
        className={`
          w-full rounded-full bg-neutral-200 overflow-hidden
          ${sizeStyles[size]}
        `}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: max, now: value }}
      >
        <View
          className={`
            h-full rounded-full
            ${variantStyles[variant]}
          `}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}

export default Progress;
