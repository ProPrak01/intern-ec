import React from "react";
import { useGlobalContext } from "../../context/GlobalProvider";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { icons } from "../../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeProvider";

const Profile = () => {
  const { user, logout } = useGlobalContext();
  const { colors } = useTheme();
  console.log("this is user", user);
  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1"
    >
      <View className="items-center p-6">
        {/* Profile Image */}
        <View
          className="w-32 h-32 rounded-full overflow-hidden mb-6 border-2"
          style={{ backgroundColor: colors.card, borderColor: colors.primary }}
        >
          <Image
            source={{ uri: user?.profilePicture || icons.profile }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Name */}
        <Text className="text-3xl font-pbold" style={{ color: colors.text }}>
          {user?.name}
        </Text>

        {/* Role */}
        <Text
          className="text-md font-pregular mt-1 px-3 py-1 rounded-full"
          style={{ backgroundColor: colors.card, color: colors.primary }}
        >
          {user?.role}
        </Text>

        {/* Email */}
        <Text
          className="text-lg font-pregular mt-2"
          style={{ color: colors.secondary }}
        >
          {user?.email}
        </Text>

        {/* Phone Number */}
        <Text
          className="text-lg font-pregular mt-1"
          style={{ color: colors.secondary }}
        >
          {user?.phone || "No phone number"}
        </Text>

        {/* Status indicator */}
        <View className="flex-row items-center mt-2">
          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              user?.status === "active" ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <Text
            className="text-lg font-pregular"
            style={{ color: colors.secondary }}
          >
            {user?.status === "active" ? "Active Account" : "Inactive Account"}
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-20 flex flex-row items-center px-8 py-3 border-black border-[1px] rounded-full active:opacity-80"
          style={{ backgroundColor: colors.error }}
        >
          <Image
            source={icons.logout}
            className="w-5 h-5 mr-2"
            resizeMode="contain"
          />
          <Text className="text-black font-pbold">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
