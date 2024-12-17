import React from "react";
import { View, Text } from "react-native";
import { Tabs } from "expo-router";
import { Home, User, Users } from "lucide-react-native";
import { useTheme } from "../../context/ThemeProvider";

const TabIcon = ({ Icon, color, name, focused }) => {
  const { colors } = useTheme();
  
  return (
    <View className="items-center justify-center w-16">
      <View 
        className={`p-2 rounded-full mb-1.5 ${
          focused ? "bg-primary/10" : ""
        }`}
      >
        <Icon 
          size={20} 
          color={focused ? colors.primary : colors.secondary} 
          strokeWidth={focused ? 2.5 : 1.8} 
        />
      </View>
      <Text
        numberOfLines={1}
        className={`text-[11px] ${
          focused
            ? "font-semibold text-primary"
            : "font-medium text-secondary"
        }`}
        style={{
          color: focused ? colors.primary : colors.secondary
        }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 70,
          paddingHorizontal: 8,
          paddingTop: 8,
          paddingBottom: 10,
          elevation: 0,
          shadowColor: colors.primary,
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              Icon={Home}
              name="Home"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              Icon={Users}
              name="Contacts"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              Icon={User}
              name="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
