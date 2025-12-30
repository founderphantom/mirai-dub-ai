import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Mail, Lock, User, Chrome, Apple, Check, ChevronLeft } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { useResponsive } from "@/hooks";
import { ResponsiveContainer } from "@/components/layout";
import { getErrorMessage } from "@/types/api";

export default function SignupScreen() {
  const router = useRouter();
  const { showDesktopLayout } = useResponsive();
  const {
    signUpEmail,
    signInGoogle,
    signInApple,
    convertAccount,
    isSigningUp,
    isSigningIn,
    isAnonymous,
  } = useAuth();

  const isLoading = isSigningUp || isSigningIn;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});

  // Password strength
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: "", color: "bg-neutral-200" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 1) return { strength, label: "Weak", color: "bg-error-500" };
    if (strength === 2) return { strength, label: "Fair", color: "bg-warning-500" };
    if (strength === 3) return { strength, label: "Good", color: "bg-success-400" };
    return { strength, label: "Strong", color: "bg-success-500" };
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!acceptTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      if (isAnonymous) {
        // If user is anonymous, we want to convert their account instead of creating a new one
        await convertAccount({ name, email, password });
      } else {
        await signUpEmail({ name, email, password });
      }
      // Navigation is handled in the hook
    } catch (error: unknown) {
      const errorCode = (error as { code?: string })?.code;
      if (errorCode === "ALREADY_EXISTS") {
        setErrors({ email: "An account with this email already exists" });
      } else {
        setErrors({ general: getErrorMessage(errorCode || "UNKNOWN") });
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInGoogle();
    } catch (error: unknown) {
      const errorCode = (error as { code?: string })?.code || "UNKNOWN";
      setErrors({ general: getErrorMessage(errorCode) });
    }
  };

  const handleAppleSignup = async () => {
    try {
      await signInApple();
    } catch (error: unknown) {
      const errorCode = (error as { code?: string })?.code || "UNKNOWN";
      setErrors({ general: getErrorMessage(errorCode) });
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={showDesktopLayout ? [] : ["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Back Button */}
        <ResponsiveContainer maxWidth="sm" padding={false} className={showDesktopLayout ? "" : "px-4"}>
          <Pressable
            className="py-2 flex-row items-center"
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <ChevronLeft size={24} color="#334155" />
            <Text className="text-neutral-700 font-medium ml-1">Back</Text>
          </Pressable>
        </ResponsiveContainer>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <ResponsiveContainer maxWidth="sm" className={showDesktopLayout ? "py-4" : "px-6"}>
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-neutral-900 mb-2">
              Create account
            </Text>
            <Text className="text-neutral-500 text-base">
              Start translating your videos to the world
            </Text>
          </View>

          {/* General Error */}
          {errors.general && (
            <View className="bg-error-50 border border-error-200 rounded-lg p-3 mb-4">
              <Text className="text-error-700 text-sm">{errors.general}</Text>
            </View>
          )}

          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-neutral-700 font-medium mb-2">Full Name</Text>
            <View
              className={`flex-row items-center bg-neutral-50 border rounded-lg px-4 py-3 ${errors.name ? "border-error-500" : "border-neutral-200"
                }`}
            >
              <User size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-neutral-900"
                placeholder="Enter your full name"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                autoCapitalize="words"
                autoComplete="name"
                editable={!isLoading}
              />
            </View>
            {errors.name && (
              <Text className="text-error-500 text-sm mt-1">{errors.name}</Text>
            )}
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-neutral-700 font-medium mb-2">Email</Text>
            <View
              className={`flex-row items-center bg-neutral-50 border rounded-lg px-4 py-3 ${errors.email ? "border-error-500" : "border-neutral-200"
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
                editable={!isLoading}
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
              className={`flex-row items-center bg-neutral-50 border rounded-lg px-4 py-3 ${errors.password ? "border-error-500" : "border-neutral-200"
                }`}
            >
              <Lock size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-neutral-900"
                placeholder="Create a password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#94a3b8" />
                ) : (
                  <Eye size={20} color="#94a3b8" />
                )}
              </Pressable>
            </View>
            {/* Password Strength */}
            {password && (
              <View className="mt-2">
                <View className="flex-row gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      className={`flex-1 h-1 rounded-full ${i <= passwordStrength.strength
                        ? passwordStrength.color
                        : "bg-neutral-200"
                        }`}
                    />
                  ))}
                </View>
                <Text className="text-neutral-500 text-xs">
                  Password strength: {passwordStrength.label}
                </Text>
              </View>
            )}
            {errors.password && (
              <Text className="text-error-500 text-sm mt-1">{errors.password}</Text>
            )}
          </View>

          {/* Confirm Password */}
          <View className="mb-4">
            <Text className="text-neutral-700 font-medium mb-2">Confirm Password</Text>
            <View
              className={`flex-row items-center bg-neutral-50 border rounded-lg px-4 py-3 ${errors.confirmPassword ? "border-error-500" : "border-neutral-200"
                }`}
            >
              <Lock size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-neutral-900"
                placeholder="Confirm your password"
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            {errors.confirmPassword && (
              <Text className="text-error-500 text-sm mt-1">{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Terms Checkbox */}
          <Pressable
            className="flex-row items-start mb-6"
            onPress={() => setAcceptTerms(!acceptTerms)}
            disabled={isLoading}
          >
            <View
              className={`w-5 h-5 rounded border mr-3 mt-0.5 items-center justify-center ${acceptTerms
                ? "bg-primary-500 border-primary-500"
                : errors.terms
                  ? "border-error-500"
                  : "border-neutral-300"
                }`}
            >
              {acceptTerms && <Check size={14} color="#fff" strokeWidth={3} />}
            </View>
            <Text className="flex-1 text-neutral-600 text-sm">
              I agree to the{" "}
              <Text className="text-primary-500">Terms of Service</Text> and{" "}
              <Text className="text-primary-500">Privacy Policy</Text>
            </Text>
          </Pressable>
          {errors.terms && (
            <Text className="text-error-500 text-sm mb-4 -mt-4">{errors.terms}</Text>
          )}

          {/* Sign Up Button */}
          <Pressable
            className={`rounded-lg py-4 items-center mb-6 ${isLoading ? "bg-primary-400" : "bg-primary-500 active:bg-primary-600"
              }`}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Create Account</Text>
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
              onPress={handleGoogleSignup}
              disabled={isLoading}
            >
              <Chrome size={20} color="#4285F4" />
              <Text className="text-neutral-700 font-medium ml-2">Google</Text>
            </Pressable>
            <Pressable
              className="flex-1 flex-row items-center justify-center bg-black rounded-lg py-3.5 active:bg-neutral-800"
              onPress={handleAppleSignup}
              disabled={isLoading}
            >
              <Apple size={20} color="#fff" />
              <Text className="text-white font-medium ml-2">Apple</Text>
            </Pressable>
          </View>

          {/* Sign In Link */}
          <View className="flex-row justify-center">
            <Text className="text-neutral-500">Already have an account? </Text>
            <Pressable onPress={() => router.push("/(auth)/login")} disabled={isLoading}>
              <Text className="text-primary-500 font-semibold">Sign in</Text>
            </Pressable>
          </View>
          </ResponsiveContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
