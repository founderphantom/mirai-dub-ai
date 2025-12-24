import { Tabs } from "expo-router";
import { Home, Upload, Library } from "lucide-react-native";
import { View, Text } from "react-native";

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

function TabIcon({ focused, icon: Icon, label }: { focused: boolean; icon: React.ComponentType<any>; label: string }) {
  return (
    <View className="items-center justify-center pt-2">
      <Icon
        size={24}
        color={focused ? "#3b82f6" : "#64748b"}
        strokeWidth={focused ? 2.5 : 2}
      />
      <Text
        className={`text-xs mt-1 ${
          focused ? "text-primary-500 font-semibold" : "text-neutral-500"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
        },
      }}
    >
      <Tabs.Screen
        name="index"
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
  );
}
