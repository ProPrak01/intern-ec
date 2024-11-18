import { View, Text, Image } from "react-native";
import React from "react";
import { Tabs, Redirect } from "expo-router";
import { icons } from "../../constants";

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View
      className={`items-center justify-center ${
        focused ? "opacity-100" : "opacity-70"
      }`}
    >
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className={`w-[24px] h-[24px] ${focused ? "scale-110" : "scale-100"}`}
      />
      <Text
        className={`${
          focused ? "font-semibold text-primary" : "font-regular text-gray-400"
        } text-[10px] mt-1`}
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
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "#8E8E93",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E5E5E5",
            height: 65,
            paddingBottom: 8,
            paddingTop: 8,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Page0",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
                name={"Page0"}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="bookmark"
          options={{
            title: "Page1",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.bookmark}
                color={color}
                name={"Page1"}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Page2",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.plus}
                color={color}
                name={"Page2"}
                focused={focused}
              />
            ),
          }}
        />
        {/* <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.chat}
                color={color}
                name={"Chat"}
                focused={focused}
              />
            ),
          }}
        /> */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Page3",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name={"Page3"}
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
                icon={icons.contacts}
                color={color}
                name={"Contacts"}
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
