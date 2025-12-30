import { Tabs } from "expo-router";
import { Home, Upload, Library } from "lucide-react-native";
import { View, Text } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { DesktopNavBar } from "@/components/layout/DesktopNavBar";

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

function TabIcon({ focused, icon: Icon, label }: { focused: boolean; icon: React.ComponentType<any>; label: string }) {
  return (
    <View className="items-center justify-center pt-1" style={{ width: 70 }}>
      <Icon
        size={24}
        color={focused ? "#3b82f6" : "#64748b"}
        strokeWidth={focused ? 2.5 : 2}
      />
      <Text
        numberOfLines={1}
        className={`text-xs mt-1 text-center ${focused ? "text-primary-500 font-semibold" : "text-neutral-500"
          }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { showDesktopLayout } = useResponsive();

  return (
    <View className="flex-1">
      {/* Desktop: Show top nav bar */}
      {showDesktopLayout && <DesktopNavBar />}

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          // Hide tab bar on desktop
          tabBarStyle: showDesktopLayout
            ? { display: "none" }
            : {
                height: 80,
                paddingBottom: 10,
                paddingTop: 8,
                backgroundColor: "#ffffff",
                borderTopWidth: 1,
                borderTopColor: "#e2e8f0",
              },
        }}
      >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Home} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Upload} label="Upload" />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Library} label="Library" />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}
