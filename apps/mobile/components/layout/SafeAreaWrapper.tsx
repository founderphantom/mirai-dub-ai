import React from "react";
import { View, type ViewProps, StatusBar, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeAreaWrapperProps extends ViewProps {
  children: React.ReactNode;
  edges?: ("top" | "bottom" | "left" | "right")[];
  backgroundColor?: string;
  statusBarStyle?: "light-content" | "dark-content";
}

export function SafeAreaWrapper({
  children,
  edges = ["top", "bottom"],
  backgroundColor = "#FFFFFF",
  statusBarStyle = "dark-content",
  className,
  style,
  ...props
}: SafeAreaWrapperProps) {
  const insets = useSafeAreaInsets();

  const paddingStyle = {
    paddingTop: edges.includes("top") ? insets.top : 0,
    paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
    paddingLeft: edges.includes("left") ? insets.left : 0,
    paddingRight: edges.includes("right") ? insets.right : 0,
  };

  return (
    <View
      className={`flex-1 ${className || ""}`}
      style={[{ backgroundColor }, paddingStyle, style]}
      {...props}
    >
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={backgroundColor}
        translucent={Platform.OS === "android"}
      />
      {children}
    </View>
  );
}

export default SafeAreaWrapper;
