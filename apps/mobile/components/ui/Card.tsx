import React from "react";
import { View, type ViewProps } from "react-native";

type CardVariant = "flat" | "raised" | "floating" | "overlay";

interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  flat: "bg-white border border-neutral-200",
  raised: "bg-white shadow-sm",
  floating: "bg-white shadow-md",
  overlay: "bg-white shadow-lg",
};

const paddingStyles: Record<string, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  variant = "raised",
  padding = "md",
  children,
  className,
  ...props
}: CardProps) {
  return (
    <View
      className={`
        rounded-xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: ViewProps & { children: React.ReactNode }) {
  return (
    <View className={`mb-3 ${className || ""}`} {...props}>
      {children}
    </View>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: ViewProps & { children: React.ReactNode }) {
  return (
    <View className={className || ""} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: ViewProps & { children: React.ReactNode }) {
  return (
    <View className={`mt-4 ${className || ""}`} {...props}>
      {children}
    </View>
  );
}

export default Card;
