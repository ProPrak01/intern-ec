import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeProvider";
import { useGlobalContext } from "../../context/GlobalProvider";
import { router } from "expo-router";
import { icons } from "../../constants";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_CONFIG = {
  BASE_URL: "https://crm-s1.amiigo.in/api",
  ENDPOINTS: {
    FETCH_LEADS: "/leads/fetch",
  },
};

const StatCard = ({ title, value, color }) => (
  <View
    className="flex-1 px-4 py-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 mx-1"
    style={{
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    }}
  >
    <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
      {title}
    </Text>
    <Text className={`text-2xl font-semibold ${color}`}>{value}</Text>
  </View>
);

const QuickActionCard = ({
  title,
  description,
  icon,
  onPress,
  gradientColors,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-[48%] rounded-xl overflow-hidden mb-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
      style={{
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5 h-44"
      >
        <View className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-700 items-center justify-center mb-4 border border-gray-100 dark:border-gray-600">
          <Image
            source={icon}
            className="w-6 h-6"
            style={{ tintColor: colors.secondary }}
          />
        </View>
        <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          {title}
        </Text>
        <Text className="text-sm text-gray-600 dark:text-gray-300">
          {description}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const Home = () => {
  const { colors } = useTheme();
  const { user } = useGlobalContext();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    converted: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeadsStats = async () => {
    try {
      // if (!user || user.status === "inactive") return;

      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FETCH_LEADS}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            page: 1,
            limit: 50,
            unassigned: false,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      if (data.leads) {
        // Calculate stats from leads data
        const totalLeads = data.leads.length;
        const activeLeads = data.leads.filter(
          (lead) => lead.status === "pending" || lead.status === "contacted"
        ).length;
        const convertedLeads = data.leads.filter(
          (lead) => lead.status === "converted"
        ).length;

        setStats({
          total: totalLeads,
          active: activeLeads,
          converted: convertedLeads,
        });
      }
    } catch (error) {
      console.error("Error fetching leads stats:", error);
      Alert.alert("Error", "Failed to fetch leads statistics");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeadsStats();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLeadsStats();
  }, [user]);

  const navigationCards = [
    {
      title: "Contacts",
      description: "Manage your contacts and leads",
      icon: icons.chat,
      route: "/contacts",
      gradientColors: [colors.primary + "20", colors.primary + "10"],
    },
    {
      title: "Profile",
      description: "View and edit your profile",
      icon: icons.profile,
      route: "/profile",
      gradientColors: [colors.primary + "20", colors.primary + "10"],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View
          className="px-6 py-8 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 mb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          <Text className="text-base text-gray-500 dark:text-gray-400 mb-2">
            Welcome back,
          </Text>
          <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {user?.name}
          </Text>
          
          {/* Added email and role */}
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {user?.email}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Role: {user?.role}
          </Text>

          {/* Status Badge */}
          <View className="self-start">
            <View
              className={`px-4 py-2 rounded-full ${
                user?.status === "active"
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800"
              }`}
            >
              <Text
                className={`font-medium ${
                  user?.status === "active"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {user?.status === "active" ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View className="px-6 mb-8">
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-5">
            Overview
          </Text>
          <View className="flex-row mx-[-4px]">
            <StatCard
              title="Total Leads"
              value={stats.total}
              color="text-blue-600 dark:text-blue-400"
            />
            <StatCard
              title="Active"
              value={stats.active}
              color="text-amber-600 dark:text-amber-400"
            />
            <StatCard
              title="Converted"
              value={stats.converted}
              color="text-emerald-600 dark:text-emerald-400"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 pb-8">
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-5">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {navigationCards.map((card, index) => (
              <QuickActionCard
                key={index}
                title={card.title}
                description={card.description}
                icon={card.icon}
                onPress={() => router.push(card.route)}
                gradientColors={card.gradientColors}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
