import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { ChevronLeft, Bell, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  showSettings?: boolean;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  onBackPress?: () => void;
}

export function Header({
  title,
  showBack = false,
  showNotifications = false,
  showSettings = false,
  rightAction,
  transparent = false,
  onBackPress,
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      className={`
        flex-row items-center justify-between
        px-4 pb-3
        ${transparent ? "" : "bg-white border-b border-neutral-100"}
      `}
      style={{ paddingTop: insets.top + 12 }}
    >
      {/* Left Section */}
      <View className="w-12">
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 items-center justify-center -ml-2"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ChevronLeft size={28} color="#111827" />
          </TouchableOpacity>
        )}
      </View>

      {/* Center Section - Title */}
      {title && (
        <View className="flex-1 items-center">
          <Text
            className="text-lg font-semibold text-neutral-900"
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      )}

      {/* Right Section */}
      <View className="w-12 flex-row items-center justify-end">
        {showNotifications && (
          <TouchableOpacity
            onPress={() => {}}
            className="w-10 h-10 items-center justify-center"
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <Bell size={24} color="#374151" />
          </TouchableOpacity>
        )}
        {showSettings && (
          <TouchableOpacity
            onPress={() => {}}
            className="w-10 h-10 items-center justify-center"
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <Settings size={24} color="#374151" />
          </TouchableOpacity>
        )}
        {rightAction}
      </View>
    </View>
  );
}

export default Header;
