import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "../../constants";
import { router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import { useTheme } from "../../context/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_CONFIG = {
  BASE_URL: "https://crm-s1.amiigo.in/api",
  ENDPOINTS: {
    PROFILE: "/users/profile",
  },
};

const InfoItem = ({ label, value }) => (
  <View className="mb-6">
    <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
      {label}
    </Text>
    <Text className="text-base text-gray-900 dark:text-white">
      {value || "Not provided"}
    </Text>
  </View>
);

const Profile = () => {
  const { user, logout } = useGlobalContext();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const fetchProfileData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log("Profile Data Response:", data);

      if (!response.ok) throw new Error(data.message);
      
      if (data.success && data.user) {
        const mergedData = {
          ...user,
          ...data.user,
          phone: data.user.phone || user?.phone,
          status: data.user.status || user?.status,
        };
        console.log("Merged user data:", mergedData);
        setProfileData(mergedData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfileData(user);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={colors.isDark ? "light" : "dark"} />
      
      {/* Add header with logout button */}
      <View className="flex-row justify-between items-center p-6 bg-white dark:bg-gray-800">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </Text>
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center px-4 py-2 bg-red-500 rounded-full"
        >
          <Image
            source={icons.logout}
            className="w-4 h-4 mr-2"
            style={{ tintColor: "white" }}
          />
          <Text className="text-white font-semibold">
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View className="bg-white dark:bg-gray-800 p-6 rounded-b-3xl shadow-sm">
          <View className="items-center">
            <View className="w-32 h-32 rounded-full border-4 border-blue-500 dark:border-blue-400 overflow-hidden mb-4">
              <Image
                source={profileData?.profilePicture ? { uri: profileData.profilePicture } : icons.profile}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {profileData?.name || user?.name}
            </Text>

            <View className="flex-row items-center space-x-2 mb-2">
              <View className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Text className="text-blue-700 dark:text-blue-400 font-medium">
                  {profileData?.role || user?.role}
                </Text>
              </View>
              
              <View 
                className={`px-3 py-1 rounded-full ${
                  (profileData?.status || user?.status) === "active"
                    ? "bg-green-100 dark:bg-green-900/20"
                    : "bg-red-100 dark:bg-red-900/20"
                }`}
              >
                <Text
                  className={`font-medium ${
                    (profileData?.status || user?.status) === "active"
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {(profileData?.status || user?.status) === "active" ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Information */}
        <View className="p-6 mt-4 bg-white dark:bg-gray-800 rounded-3xl mx-4">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Profile Information
          </Text>
          
          <InfoItem label="Email" value={profileData?.email || user?.email} />
          <InfoItem label="User ID" value={profileData?.userId || user?.userId} />
          <InfoItem label="Phone" value={profileData?.phone || user?.phone} />
          <InfoItem 
            label="Role" 
            value={profileData?.role || user?.role} 
          />
          <InfoItem 
            label="Status" 
            value={profileData?.status || user?.status} 
          />
          <InfoItem 
            label="Joined At" 
            value={profileData?.createdAt ? 
              new Date(profileData.createdAt).toLocaleDateString() : 
              undefined
            } 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
