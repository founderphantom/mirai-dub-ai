import React from "react";
import { View, Text } from "react-native";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "outline";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  default: {
    container: "bg-neutral-100",
    text: "text-neutral-700",
  },
  success: {
    container: "bg-success-100",
    text: "text-success-700",
  },
  warning: {
    container: "bg-warning-100",
    text: "text-warning-700",
  },
  error: {
    container: "bg-error-100",
    text: "text-error-700",
  },
  info: {
    container: "bg-info-100",
    text: "text-info-700",
  },
  outline: {
    container: "bg-transparent border border-neutral-300",
    text: "text-neutral-700",
  },
};

const sizeStyles: Record<BadgeSize, { container: string; text: string }> = {
  sm: {
    container: "px-2 py-0.5",
    text: "text-xs",
  },
  md: {
    container: "px-2.5 py-1",
    text: "text-sm",
  },
};

export function Badge({
  variant = "default",
  size = "sm",
  children,
  icon,
  className,
}: BadgeProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <View
      className={`
        flex-row items-center self-start
        rounded-full
        ${variantStyle.container}
        ${sizeStyle.container}
        ${className || ""}
      `}
    >
      {icon && <View className="mr-1">{icon}</View>}
      <Text
        className={`
          font-medium
          ${variantStyle.text}
          ${sizeStyle.text}
        `}
      >
        {children}
      </Text>
    </View>
  );
}

export default Badge;
