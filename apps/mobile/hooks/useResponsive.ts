import { useWindowDimensions, Platform } from "react-native";
import { useMemo } from "react";

// Breakpoints matching design_system.pdf
export const BREAKPOINTS = {
  xs: 0, // mobile phones (default)
  sm: 640, // large phones
  md: 768, // tablets
  lg: 1024, // laptops, desktops
  xl: 1280, // desktops
  "2xl": 1536, // large desktops
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export interface ResponsiveInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;

  // Boolean flags for easy conditional rendering
  isMobile: boolean; // < md (768px)
  isTablet: boolean; // >= md && < lg
  isDesktop: boolean; // >= lg (1024px)
  isLargeDesktop: boolean; // >= xl (1280px)

  // Platform detection
  isWeb: boolean;
  isNative: boolean;

  // Utility: should show desktop layout?
  // Only true on web with desktop-sized screen
  showDesktopLayout: boolean;
}

/**
 * Hook for responsive design in React Native/Expo
 *
 * Since NativeWind doesn't support Tailwind breakpoints (sm:, md:, lg:),
 * this hook provides JavaScript-based breakpoint detection.
 *
 * @example
 * const { showDesktopLayout, isMobile, isDesktop } = useResponsive();
 *
 * return showDesktopLayout ? <DesktopLayout /> : <MobileLayout />;
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  return useMemo(() => {
    let breakpoint: Breakpoint = "xs";

    if (width >= BREAKPOINTS["2xl"]) breakpoint = "2xl";
    else if (width >= BREAKPOINTS.xl) breakpoint = "xl";
    else if (width >= BREAKPOINTS.lg) breakpoint = "lg";
    else if (width >= BREAKPOINTS.md) breakpoint = "md";
    else if (width >= BREAKPOINTS.sm) breakpoint = "sm";

    const isMobile = width < BREAKPOINTS.md;
    const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
    const isDesktop = width >= BREAKPOINTS.lg;
    const isLargeDesktop = width >= BREAKPOINTS.xl;

    return {
      width,
      height,
      breakpoint,
      isMobile,
      isTablet,
      isDesktop,
      isLargeDesktop,
      isWeb,
      isNative: !isWeb,
      // Show desktop layout only on web with large enough screen
      showDesktopLayout: isWeb && isDesktop,
    };
  }, [width, height, isWeb]);
}

/**
 * Utility hook for selecting values based on screen size
 *
 * @example
 * const columns = useResponsiveValue({ mobile: 1, tablet: 2, desktop: 3 });
 */
export function useResponsiveValue<T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}): T {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) return values.mobile;
  if (isTablet) return values.tablet ?? values.mobile;
  return values.desktop ?? values.tablet ?? values.mobile;
}
