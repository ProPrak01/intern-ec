import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeProvider";
import { useGlobalContext } from "../../context/GlobalProvider";
import { router } from "expo-router";
import { icons } from "../../constants";
import { LinearGradient } from "expo-linear-gradient";

const Home = () => {
  const { colors } = useTheme();
  const { user } = useGlobalContext();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    converted: 0,
  });

  const fetchLeadsStats = async () => {
    try {
      if (user.status === "inactive") return;

      const leadsResponse = await fetch("http://10.42.186.126:6000/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          page: 1,
          limit: 50,
          unassigned: false,
        }),
      });

      const data = await leadsResponse.json();

      if (leadsResponse.ok && data.leads) {
        // Calculate stats from leads data
        const totalLeads = data.leads.length;
        const activeLeads = data.leads.filter(
          (lead) => lead.status === "pending"
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
    }
  };

  useEffect(() => {
    fetchLeadsStats();
  }, []);

  const navigationCards = [
    {
      title: "Contacts",
      description: "Manage your contacts and leads",
      icon: icons.chat,
      route: "/contacts",
      gradientColors: ["#4ade80", "#22c55e"],
      bgColor: "#4ade80" + "15",
    },
    {
      title: "Profile",
      description: "View and edit your profile",
      icon: icons.profile,
      route: "/profile",
      gradientColors: ["#818cf8", "#6366f1"],
      bgColor: "#6366f1" + "15",
    },
  ];

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1"
    >
      {/* Enhanced Header Section */}
      <View className="p-6">
        <Text
          className="text-base font-pmedium mb-1 opacity-80"
          style={{ color: colors.text }}
        >
          Welcome back,
        </Text>
        <Text className="text-3xl font-pbold" style={{ color: colors.primary }}>
          {user?.name}
        </Text>
      </View>

      {/* Status Card with Gradient */}
      <View className="mx-6 rounded-2xl shadow-sm overflow-hidden">
        <LinearGradient
          colors={["#3b82f6", "#1d4ed8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-5"
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text
                className="text-lg font-psemibold"
                style={{ color: "white" }}
              >
                Account Status
              </Text>
              <Text
                className="text-sm font-pmedium mt-1"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                {user?.role}
              </Text>
            </View>
            <View
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
            >
              <Text className="font-pmedium" style={{ color: "white" }}>
                {user?.status === "active" ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Actions Header */}
      <Text
        className="text-xl font-psemibold px-6 mt-8 mb-4"
        style={{ color: colors.text }}
      >
        Quick Actions
      </Text>

      <ScrollView className="px-6 flex-1" showsVerticalScrollIndicator={false}>
        {/* Navigation Cards with Gradients */}
        <View className="flex-row flex-wrap justify-between">
          {navigationCards.map((card, index) => (
            <TouchableOpacity
              key={index}
              className="w-[48%] rounded-2xl mb-4 overflow-hidden"
              style={{
                shadowColor: card.gradientColors[0],
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={() => router.push(card.route)}
            >
              <LinearGradient
                colors={card.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-5"
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  <Image
                    source={card.icon}
                    className="w-6 h-6"
                    style={{ tintColor: "white" }}
                  />
                </View>
                <Text
                  className="text-lg font-psemibold mb-1"
                  style={{ color: "white" }}
                >
                  {card.title}
                </Text>
                <Text
                  className="text-sm font-pmedium"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {card.description}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Preview with Soft Background */}
        <View
          className="p-6 rounded-2xl mb-6 mt-4"
          style={{
            backgroundColor: "#f0f9ff", // Light blue background
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            className="text-lg font-psemibold mb-6"
            style={{ color: colors.text }}
          >
            Quick Stats
          </Text>
          <View className="flex-row justify-between">
            {[
              {
                label: "Fetched Leads",
                value: stats.total,
                color: "#3b82f6", // blue
              },
              {
                label: "Pending",
                value: stats.active,
                color: "#f59e0b", // amber
              },
              {
                label: "Converted",
                value: stats.converted,
                color: "#10b981", // emerald
              },
            ].map((stat, index) => (
              <View key={index} className="items-center">
                <Text
                  className="text-3xl font-pbold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </Text>
                <Text
                  className="text-sm font-pmedium mt-2"
                  style={{ color: colors.secondary }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
