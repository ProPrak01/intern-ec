import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Pressable,
  StatusBar,
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

const USER_ROLES = {
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SuperAdmin",
  PARTNER: "PARTNER",
  COUNSELLOR: "COUNSELLOR",
};

const SignUp = () => {
  const { colors } = useTheme();
  const { registerUser } = useGlobalContext();
  const [isSubmitted, setSubmitting] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: USER_ROLES.COUNSELLOR,
  });

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
    setShowRoleModal(false);
  };

  const submit = async () => {
    if (!form.name || !form.email || !form.password || !form.phone) {
      return Alert.alert("Error", "Please fill in all fields");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return Alert.alert("Error", "Please enter a valid email address");
    }

    // Basic phone validation (at least 10 digits)
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(form.phone)) {
      return Alert.alert(
        "Error",
        "Please enter a valid phone number (at least 10 digits)"
      );
    }

    // Password strength validation
    if (form.password.length < 8) {
      return Alert.alert(
        "Error",
        "Password must be at least 8 characters long"
      );
    }

    setSubmitting(true);
    try {
      console.log("Submitting registration form:", {
        ...form,
        password: "[REDACTED]",
      });

      const response = await registerUser(form);
      console.log("Registration response:", response);

      Alert.alert(
        "Registration Successful",
        "Your account has been created and is pending admin approval. You will be able to login once approved.",
        [{ text: "OK", onPress: () => router.replace("/sign-in") }]
      );
    } catch (error) {
      console.error("Registration submission error:", error);
      Alert.alert(
        "Registration Failed",
        error.message ||
          "An unexpected error occurred during registration. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style={colors.isDark ? "light" : "dark"} />
      <ScrollView className="flex-1">
        <View className="flex-1 px-6 py-8">
          {/* Logo Section */}
          <View className="mb-10">
            <Image
              source={images.logo}
              resizeMode="contain"
              className="w-[115px] h-[35px]"
            />
          </View>

          {/* Header Section */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-400">
              Please fill in the form to continue
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-5">
            <FormField
              title="Name"
              value={form.name}
              handleChangeText={(e) => setForm({ ...form, name: e })}
              containerStyle="bg-gray-50 dark:bg-gray-800"
              textStyle="text-gray-900 dark:text-white"
            />

            <FormField
              title="Email"
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              keyboardType="email-address"
              containerStyle="bg-gray-50 dark:bg-gray-800"
              textStyle="text-gray-900 dark:text-white"
            />

            <FormField
              title="Phone"
              value={form.phone}
              handleChangeText={(e) => setForm({ ...form, phone: e })}
              keyboardType="phone-pad"
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

            {/* Role Selector */}
            <View>
              <Text className="text-base mb-2 text-gray-700 dark:text-gray-300">
                Role
              </Text>
              <Pressable
                onPress={() => setShowRoleModal(true)}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <Text className="text-gray-900 dark:text-white">
                  {form.role}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Action Button */}
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
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Links */}
          <View className="flex-row justify-center items-center mt-6 space-x-2">
            <Text className="text-gray-600 dark:text-gray-400 text-base">
              Have an account already?
            </Text>
            <Link
              href="/sign-in"
              className="text-blue-600 dark:text-blue-400 font-semibold text-base"
            >
              Sign In
            </Link>
          </View>

          {/* Role Selection Modal */}
          <Modal
            visible={showRoleModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowRoleModal(false)}
          >
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white dark:bg-gray-800 rounded-t-3xl">
                <View className="p-6">
                  <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
                    Select Role
                  </Text>
                  
                  {Object.entries(USER_ROLES).map(([key, value]) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => handleRoleSelect(value)}
                      className="py-4 border-b border-gray-200 dark:border-gray-700"
                    >
                      <Text className="text-center text-lg text-gray-900 dark:text-white">
                        {key}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  
                  <TouchableOpacity
                    onPress={() => setShowRoleModal(false)}
                    className="mt-4 py-4"
                  >
                    <Text className="text-center text-lg font-semibold text-blue-600 dark:text-blue-400">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
