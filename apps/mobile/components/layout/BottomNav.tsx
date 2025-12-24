import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Home, Upload, FolderOpen, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { name: "home", href: "/", icon: Home, label: "Home" },
  { name: "upload", href: "/upload", icon: Upload, label: "Upload" },
  { name: "library", href: "/library", icon: FolderOpen, label: "Library" },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const handlePress = async (href: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(href as any);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/index";
    }
    return pathname.startsWith(href);
  };

  return (
    <View
      className="bg-white border-t border-neutral-200"
      style={{
        paddingBottom: Math.max(insets.bottom, 8),
      }}
    >
      <View className="flex-row items-center justify-around pt-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => handlePress(item.href)}
              className="flex-1 items-center py-2"
              accessibilityLabel={item.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <View
                className={`
                  w-12 h-8 items-center justify-center rounded-full
                  ${active ? "bg-primary-100" : ""}
                `}
              >
                <Icon
                  size={24}
                  color={active ? "#2563EB" : "#6B7280"}
                />
              </View>
              <Text
                className={`
                  text-xs mt-1
                  ${active ? "text-primary-600 font-medium" : "text-neutral-500"}
                `}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default BottomNav;
