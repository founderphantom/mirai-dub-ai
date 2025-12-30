import React from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";

type MaxWidthSize = "sm" | "md" | "lg" | "xl";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  /** Max width on desktop (sm: 640px, md: 768px, lg: 1024px, xl: 1280px) */
  maxWidth?: MaxWidthSize;
  /** Add horizontal padding (default: true) */
  padding?: boolean;
  /** Additional className */
  className?: string;
  /** Additional style */
  style?: StyleProp<ViewStyle>;
}

const maxWidthValues: Record<MaxWidthSize, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/**
 * Responsive container that centers content with max-width on desktop
 * and provides full-width layout on mobile.
 *
 * @example
 * <ResponsiveContainer maxWidth="lg">
 *   <Text>Centered on desktop, full-width on mobile</Text>
 * </ResponsiveContainer>
 */
export function ResponsiveContainer({
  children,
  maxWidth = "lg",
  padding = true,
  className = "",
  style,
}: ResponsiveContainerProps) {
  const { showDesktopLayout } = useResponsive();

  const containerMaxWidth = maxWidthValues[maxWidth];

  // On desktop web, center content with max-width
  // On mobile/native, use full width
  const desktopStyle: ViewStyle = showDesktopLayout
    ? {
        width: "100%",
        maxWidth: containerMaxWidth,
        marginLeft: "auto",
        marginRight: "auto",
      }
    : {};

  return (
    <View
      className={`${padding ? "px-4" : ""} ${className}`}
      style={[desktopStyle, style]}
    >
      {children}
    </View>
  );
}
