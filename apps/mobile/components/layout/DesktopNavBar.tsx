import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Sparkles, User as UserIcon, Home, Upload, Library } from "lucide-react-native";
import { useSession } from "@/lib/api/auth";

const navLinks = [
  { label: "Home", path: "/(tabs)/home", icon: Home },
  { label: "Upload", path: "/(tabs)/upload", icon: Upload },
  { label: "Library", path: "/(tabs)/library", icon: Library },
];

/**
 * Desktop navigation bar component
 * Shows logo on left, nav links in center, user menu on right
 * Only rendered on desktop web via _layout.tsx
 */
export function DesktopNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const isSignedIn = user && !user.isAnonymous;

  const isActivePath = (path: string) => {
    // Extract the tab name from the path
    const tabName = path.replace("/(tabs)/", "/");
    return pathname === tabName || pathname.includes(tabName);
  };

  return (
    <View className="bg-white border-b border-neutral-200">
      <View
        className="flex-row items-center justify-between px-6 py-4"
        style={{ maxWidth: 1280, marginLeft: "auto", marginRight: "auto", width: "100%" }}
      >
        {/* Logo */}
        <Pressable
          className="flex-row items-center"
          onPress={() => router.push("/(tabs)/home")}
        >
          <View className="w-8 h-8 bg-primary-500 rounded-lg items-center justify-center mr-2">
            <Sparkles size={18} color="white" />
          </View>
          <Text className="text-lg font-bold text-neutral-900">Mirai Dub AI</Text>
        </Pressable>

        {/* Nav Links */}
        <View className="flex-row items-center gap-2">
          {navLinks.map((link) => {
            const isActive = isActivePath(link.path);
            const Icon = link.icon;
            return (
              <Pressable
                key={link.path}
                className={`flex-row items-center px-4 py-2 rounded-lg ${
                  isActive ? "bg-primary-50" : ""
                }`}
                onPress={() => router.push(link.path as any)}
              >
                <Icon
                  size={18}
                  color={isActive ? "#3b82f6" : "#64748b"}
                  className="mr-2"
                />
                <Text
                  className={`font-medium ${
                    isActive ? "text-primary-600" : "text-neutral-600"
                  }`}
                >
                  {link.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* User Menu */}
        <Pressable
          onPress={() => {
            if (isSignedIn) {
              router.push("/account");
            } else {
              router.push("/(auth)/login");
            }
          }}
          className="flex-row items-center bg-primary-50 px-4 py-2 rounded-full"
        >
          <UserIcon size={16} color="#2563eb" />
          <Text className="text-primary-600 font-semibold text-sm ml-2">
            {isSignedIn ? "Account" : "Sign In"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
