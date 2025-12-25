import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Mail, Lock, Chrome, Apple } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/types/api";

export default function LoginScreen() {
  const router = useRouter();
  const {
    signInEmail,
    signInGoogle,
    signInApple,
    signInAnonymous,
    isSigningIn,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await signInEmail({ email, password });
      // Navigation is handled in the hook
    } catch (error: unknown) {
      const errorCode = (error as { code?: string })?.code || "UNKNOWN";
      setErrors({ general: getErrorMessage(errorCode) });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInGoogle();
    } catch (error: unknown) {
      const errorCode = (error as { code?: string })?.code || "UNKNOWN";
      setErrors({ general: getErrorMessage(errorCode) });
    }
  };

  const handleAppleLogin = async () => {
    try {
      await signInApple();
    } catch (error: unknown) {
      const errorCode = (error as { code?: string })?.code || "UNKNOWN";
      setErrors({ general: getErrorMessage(errorCode) });
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymous();
      // Navigation is handled in the hook
    } catch (error: unknown) {
      const errorCode = (error as { code?: string })?.code || "UNKNOWN";
      setErrors({ general: getErrorMessage(errorCode) });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-neutral-900 mb-2">
              Welcome back
            </Text>
            <Text className="text-neutral-500 text-base">
              Sign in to continue creating amazing content
            </Text>
          </View>

          {/* General Error */}
          {errors.general && (
            <View className="bg-error-50 border border-error-200 rounded-lg p-3 mb-4">
              <Text className="text-error-700 text-sm">{errors.general}</Text>
            </View>
          )}

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-neutral-700 font-medium mb-2">Email</Text>
            <View
              className={`flex-row items-center bg-neutral-50 border rounded-lg px-4 py-3 ${
                errors.email ? "border-error-500" : "border-neutral-200"
              }`}
            >
              <Mail size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-neutral-900"
                placeholder="Enter your email"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isSigningIn}
              />
            </View>
            {errors.email && (
              <Text className="text-error-500 text-sm mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-neutral-700 font-medium mb-2">Password</Text>
            <View
              className={`flex-row items-center bg-neutral-50 border rounded-lg px-4 py-3 ${
                errors.password ? "border-error-500" : "border-neutral-200"
              }`}
            >
              <Lock size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-neutral-900"
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isSigningIn}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#94a3b8" />
                ) : (
                  <Eye size={20} color="#94a3b8" />
                )}
              </Pressable>
            </View>
            {errors.password && (
              <Text className="text-error-500 text-sm mt-1">{errors.password}</Text>
            )}
          </View>

          {/* Forgot Password */}
          <Pressable className="self-end mb-6">
            <Text className="text-primary-500 font-medium">Forgot password?</Text>
          </Pressable>

          {/* Sign In Button */}
          <Pressable
            className={`rounded-lg py-4 items-center mb-6 ${
              isSigningIn ? "bg-primary-400" : "bg-primary-500 active:bg-primary-600"
            }`}
            onPress={handleLogin}
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Sign In</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-neutral-200" />
            <Text className="text-neutral-400 px-4">or continue with</Text>
            <View className="flex-1 h-px bg-neutral-200" />
          </View>

          {/* Social Login Buttons */}
          <View className="flex-row gap-4 mb-8">
            <Pressable
              className="flex-1 flex-row items-center justify-center bg-white border border-neutral-200 rounded-lg py-3.5 active:bg-neutral-50"
              onPress={handleGoogleLogin}
              disabled={isSigningIn}
            >
              <Chrome size={20} color="#4285F4" />
              <Text className="text-neutral-700 font-medium ml-2">Google</Text>
            </Pressable>
            <Pressable
              className="flex-1 flex-row items-center justify-center bg-black rounded-lg py-3.5 active:bg-neutral-800"
              onPress={handleAppleLogin}
              disabled={isSigningIn}
            >
              <Apple size={20} color="#fff" />
              <Text className="text-white font-medium ml-2">Apple</Text>
            </Pressable>
          </View>

          {/* Continue Anonymously */}
          <Pressable
            className="items-center py-3 mb-6"
            onPress={handleAnonymousLogin}
            disabled={isSigningIn}
          >
            <Text className="text-neutral-600 font-medium">Continue Anonymously</Text>
          </Pressable>

          {/* Sign Up Link */}
          <View className="flex-row justify-center">
            <Text className="text-neutral-500">Don't have an account? </Text>
            <Pressable onPress={() => router.push("/(auth)/signup")} disabled={isSigningIn}>
              <Text className="text-primary-500 font-semibold">Sign up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
