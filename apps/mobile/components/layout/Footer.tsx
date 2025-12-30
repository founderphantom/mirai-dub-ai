import React from "react";
import { View, Text, Pressable } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";

const footerLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Support", href: "/support" },
];

/**
 * Footer component with copyright and links
 * Adapts layout for desktop (horizontal) vs mobile (centered)
 */
export function Footer() {
  const { showDesktopLayout } = useResponsive();

  return (
    <View
      className={`py-8 ${showDesktopLayout ? "border-t border-neutral-200 mt-8" : ""}`}
    >
      <View
        style={
          showDesktopLayout
            ? {
                maxWidth: 1024,
                marginLeft: "auto",
                marginRight: "auto",
                width: "100%",
                paddingHorizontal: 16,
              }
            : { paddingHorizontal: 16 }
        }
      >
        <View
          className={`${
            showDesktopLayout
              ? "flex-row justify-between items-center"
              : "items-center"
          }`}
        >
          <Text className="text-neutral-400 text-sm text-center mb-3">
            &copy; 2024 Mirai Dub AI. Create once, reach the world.
          </Text>
          <View className={`flex-row ${showDesktopLayout ? "" : "gap-4"}`}>
            {footerLinks.map((link, index) => (
              <Pressable
                key={link.label}
                className={showDesktopLayout ? "ml-6" : ""}
              >
                <Text className="text-neutral-500 text-sm">{link.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
