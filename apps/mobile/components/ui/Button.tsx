import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";
import * as Haptics from "expo-haptics";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: "bg-primary-500 active:bg-primary-600",
    text: "text-white",
  },
  secondary: {
    container: "bg-neutral-100 active:bg-neutral-200",
    text: "text-neutral-900",
  },
  ghost: {
    container: "bg-transparent active:bg-neutral-100",
    text: "text-neutral-700",
  },
  destructive: {
    container: "bg-error-500 active:bg-error-600",
    text: "text-white",
  },
  outline: {
    container: "bg-transparent border border-neutral-300 active:bg-neutral-50",
    text: "text-neutral-700",
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: {
    container: "h-8 px-3 rounded-md",
    text: "text-sm",
  },
  md: {
    container: "h-10 px-4 rounded-lg",
    text: "text-base",
  },
  lg: {
    container: "h-12 px-6 rounded-lg",
    text: "text-base",
  },
  xl: {
    container: "h-14 px-8 rounded-xl",
    text: "text-lg",
  },
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  onPress,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = async (event: any) => {
    if (isDisabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`
        flex-row items-center justify-center
        ${sizeStyle.container}
        ${variantStyle.container}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-50" : ""}
        ${className || ""}
      `}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" || variant === "destructive" ? "#fff" : "#374151"}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            className={`
              font-semibold
              ${sizeStyle.text}
              ${variantStyle.text}
              ${leftIcon ? "ml-2" : ""}
              ${rightIcon ? "mr-2" : ""}
            `}
          >
            {children}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
}

export default Button;
