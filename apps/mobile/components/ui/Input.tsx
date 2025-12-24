import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  type TextInputProps,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  secureTextEntry,
  containerClassName,
  className,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry !== undefined;

  const hasError = !!error;

  return (
    <View className={containerClassName}>
      {label && (
        <Text className="text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </Text>
      )}
      <View
        className={`
          flex-row items-center
          h-11 px-3
          bg-white
          border rounded-lg
          ${hasError ? "border-error-500" : "border-neutral-300"}
          focus-within:border-primary-500
        `}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className={`
            flex-1 h-full
            text-base text-neutral-900
            ${className || ""}
          `}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !showPassword}
          accessibilityLabel={label}
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="ml-2 p-1"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            accessibilityRole="button"
          >
            {showPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        ) : (
          rightIcon && <View className="ml-2">{rightIcon}</View>
        )}
      </View>
      {error && (
        <Text className="text-sm text-error-500 mt-1">{error}</Text>
      )}
      {hint && !error && (
        <Text className="text-sm text-neutral-500 mt-1">{hint}</Text>
      )}
    </View>
  );
}

export default Input;
