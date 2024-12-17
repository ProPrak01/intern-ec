import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/customButton";
import { Link, router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import { useTheme } from "../../context/ThemeProvider";

const SignIn = () => {
  const { colors } = useTheme();
  const { loginUser } = useGlobalContext();
  const [isSubmitted, setisSubmitted] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    // Validate fields
    if (!form.email || !form.password) {
      return Alert.alert("Error", "Please fill in all fields");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return Alert.alert("Error", "Please enter a valid email address");
    }

    setisSubmitted(true);
    try {
      const response = await loginUser(form.email, form.password);

      if (!response || !response.user) {
        console.error("Invalid response structure:", response);
        throw new Error("Received invalid response from server");
      }

      // if (response.user.status === "inactive") {
      //   Alert.alert(
      //     "Account Inactive",
      //     "Your account is pending approval. Please contact the administrator.",
      //     [{ text: "OK" }]
      //   );
      //   return;
      // }

      Alert.alert("Success", "Signed in successfully", [
        { text: "OK", onPress: () => router.replace("/home") },
      ]);
    } catch (error) {
      console.error("Sign in error:", {
        message: error.message,
        stack: error.stack,
      });

      let errorMessage = error.message;
      if (error.message.includes("401")) {
        errorMessage = "Invalid email or password";
      } else if (error.message.includes("403")) {
        errorMessage = "Account is inactive. Please contact administrator.";
      } else if (error.message.includes("missing user data")) {
        errorMessage = "Invalid server response. Please try again.";
      } else if (
        !error.message ||
        error.message === "Invalid response from server"
      ) {
        errorMessage = "Unable to connect to server. Please try again later.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setisSubmitted(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style={colors.isDark ? "light" : "dark"} />
      <ScrollView className="flex-1">
        <View className="flex-1 px-6 py-8 min-h-screen">
          {/* Logo Section */}
          <View className="mb-12">
            <Image
              source={images.logo}
              resizeMode="contain"
              className="w-[170px] h-[70px]"
            />
          </View>

          {/* Header Section */}
          <View className="mb-10">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-400">
              Please sign in to continue
            </Text>
          </View>

          {/* Form Section */}
          <View className="space-y-6">
            <FormField
              title="Email"
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle="bg-gray-50 dark:bg-gray-800"
              textStyle="text-gray-900 dark:text-white"
            />

            <FormField
              title="Password"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              secureTextEntry
              containerStyle="bg-gray-50 dark:bg-gray-800"
              textStyle="text-gray-900 dark:text-white"
            />
          </View>

          {/* Action Buttons */}
          <View className="mt-8">
            <TouchableOpacity
              onPress={submit}
              disabled={isSubmitted}
              className="w-full bg-blue-600 dark:bg-blue-500 py-4 rounded-xl active:opacity-80"
            >
              {isSubmitted ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Links */}
          <View className="flex-row justify-center items-center mt-6 space-x-2">
            <Text className="text-gray-600 dark:text-gray-400 text-base">
              Don't have an account?
            </Text>
            <Link
              href="/sign-up"
              className="text-blue-600 dark:text-blue-400 font-semibold text-base"
            >
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
