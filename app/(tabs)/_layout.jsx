import React from "react";
import { View, Text } from "react-native";
import { Tabs } from "expo-router";
import { Home, User, Users } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const TabIcon = ({ Icon, color, name, focused }) => {
  return (
    <View className="items-center justify-center min-w-[80px]">
      <View className={`${focused ? "mb-1" : "mb-1"}`}>
        {focused ? (
         
          <View className="p-2.5">
            <Icon size={20} color={color} strokeWidth={2} />
          </View>
          
        ) : (
          <View className="p-2.5">
            <Icon size={20} color={color} strokeWidth={2} />
          </View>
        )}
      </View>
      <Text
        numberOfLines={1}
        className={`${
          focused
            ? "font-psemibold text-primary"
            : "font-pregular text-gray-400"
        } text-[11px]`}
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#3b82f6",
          tabBarInactiveTintColor: "#94A3B8",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#F1F5F9",
            height: 85,
            paddingBottom: 8,
            paddingTop: 8,
            elevation: 8,
            shadowColor: "#3b82f6",
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
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                Icon={Home}
                color={color}
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
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                Icon={Users}
                color={color}
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
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                Icon={User}
                color={color}
                name="Profile"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
