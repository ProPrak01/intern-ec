import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Linking,
  ActivityIndicator,
  PermissionsAndroid,
} from "react-native";
import * as Contacts from "expo-contacts";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Audio } from "expo-av";
import { useGlobalContext } from "../../context/GlobalProvider";
import { useTheme } from "../../context/ThemeProvider";
import { AppState } from "react-native";
import CallLog from "react-native-call-log";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const API_CONFIG = {
  BASE_URL: "https://crm-s1.amiigo.in/api",
  ENDPOINTS: {
    FETCH_LEADS: "/leads/fetch",
  },
};

export default function Call() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [recentCalls, setRecentCalls] = useState([]);
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("contacts"); // 'contacts', 'leads', or 'recent'
  const [callStartTime, setCallStartTime] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const [activeCall, setActiveCall] = useState(null);
  const { colors } = useTheme();
  const { user } = useGlobalContext();
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState === "background" &&
        nextAppState === "active" &&
        activeCall
      ) {
        // App came back to foreground, call probably ended
        const endTime = new Date();
        const duration = Math.round((endTime - activeCall.startTime) / 1000); // duration in seconds

        setRecentCalls((prevCalls) => {
          const updatedCalls = [...prevCalls];
          const lastCall = updatedCalls[0];
          if (lastCall && lastCall.number === activeCall.number) {
            lastCall.endTime = endTime;
            lastCall.duration = duration;
          }
          return updatedCalls;
        });

        setActiveCall(null);
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState, activeCall]);
  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.Name,
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Emails,
          ],
        });

        if (data.length > 0) {
          const sortedContacts = data.sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
          );
          setContacts(sortedContacts);
        }
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  // Fetch leads
  const fetchLeads = async () => {
    try {
      console.log("Starting fetchLeads...");
      // if (!user || user.status === "inactive") {
      //   console.log("User is inactive or not logged in:", user);
      //   return;
      // }

      const token = await AsyncStorage.getItem("token");
      console.log(
        "Retrieved token:",
        token ? "Token exists" : "No token found"
      );

      console.log(
        "Making API request to:",
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FETCH_LEADS}`
      );
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

      console.log("API Response status:", response.status);
      const data = await response.json();
      console.log("API Response data:", data);

      if (!response.ok) {
        console.error("API Error:", data.message);
        throw new Error(data.message);
      }

      console.log("Successfully fetched leads:", data.leads.length);
      setLeads(data.leads);
    } catch (error) {
      console.error("Error in fetchLeads:", error);
      console.error("Error stack:", error.stack);
      Alert.alert("Error", "Failed to fetch leads");
    } finally {
      console.log("Finished fetchLeads execution");
      setLoading(false);
    }
  };

  // Make a call
  const makeCall = async (number, contactType, contact) => {
    try {
      if (!number) {
        alert("Please enter a phone number");
        return;
      }

      const startTime = new Date();

      // Create new call record
      const newCall = {
        number,
        startTime,
        timestamp: startTime,
        contactType,
        contact,
        duration: 0,
        endTime: null,
      };

      setActiveCall(newCall);
      setRecentCalls((prev) => [newCall, ...prev].slice(0, 50));

      await Linking.openURL(`tel:${number}`);
    } catch (error) {
      console.error("Call failed", error);
      alert("Failed to make call");
    }
  };

  const TabButton = ({ title, isActive, onPress }) => {
    const { colors } = useTheme();
    
    return (
      <TouchableOpacity
        onPress={onPress}
        className={`flex-1 py-3 px-4 mx-1 rounded-full items-center ${
          isActive 
            ? "bg-white dark:bg-gray-800 border-2 border-primary shadow-sm" 
            : "bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
        }`}
        style={{
          elevation: isActive ? 1 : 0,
        }}
      >
        <Text
          style={{
            color: isActive ? colors.primary : colors.textSecondary,
          }}
          className={`text-base ${isActive ? "font-semibold" : "font-medium"}`}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderContact = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-2xl mb-2 shadow-sm"
      onPress={() => makeCall(item.phoneNumbers?.[0]?.number, "contact", item)}
    >
      <LinearGradient
        colors={[colors.primary + "20", colors.primary + "10"]}
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text className="text-white text-xl font-bold">
          {(item.name || "?")[0].toUpperCase()}
        </Text>
      </LinearGradient>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {item.name}
        </Text>
        {item.phoneNumbers?.[0] && (
          <Text className="text-gray-600 dark:text-gray-400">
            {item.phoneNumbers[0].number}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderLead = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-2xl mb-2 shadow-sm"
      onPress={() => makeCall(item.phoneNumber, "lead", item)}
    >
      <LinearGradient
        colors={[colors.primary + "20", colors.primary + "10"]}
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text className="text-white text-xl font-bold">
          {(item.name || "?")[0].toUpperCase()}
        </Text>
      </LinearGradient>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {item.name}
        </Text>
        <Text className="text-gray-600 dark:text-gray-400">
          {item.phoneNumber}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Status: {item.status} • Priority: {item.priority}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          Email: {item.email}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const fetchCallLogs = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
          {
            title: "Call Log Permission",
            message:
              "This app needs access to your call log to show your recent calls",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          try {
            const callLogs = await CallLog.load(50);
            if (callLogs && Array.isArray(callLogs)) {
              const formattedCalls = callLogs.map((call) => ({
                number: call.phoneNumber,
                timestamp: new Date(call.dateTime),
                duration: call.duration,
                type: call.type, // Incoming, Outgoing, Missed
                contact: contacts.find((contact) =>
                  contact.phoneNumbers?.some(
                    (phone) =>
                      phone.number.replace(/\D/g, "") ===
                      call.phoneNumber.replace(/\D/g, "")
                  )
                ),
              }));
              setRecentCalls(formattedCalls);
            } else {
              console.log("No call logs found or invalid format");
            }
          } catch (error) {
            console.error("Error loading call logs:", error);
          }
        } else {
          console.log("Call Log permission denied");
          alert("Call Log permission is required to show recent calls");
        }
      } catch (error) {
        console.error("Error requesting permission:", error);
      }
    } else {
      // For iOS, we can't access call history due to system limitations
      alert("Call history access is not available on iOS");
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchLeads();
    fetchCallLogs();
  }, []);

  const renderRecentCall = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-2xl mb-2 shadow-sm"
      onPress={() => makeCall(item.number, item.contactType, item.contact)}
    >
      <LinearGradient
        colors={[colors.primary + "20", colors.primary + "10"]}
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text className="text-white text-xl font-bold">
          {(item.contact?.name || "?")[0].toUpperCase()}
        </Text>
      </LinearGradient>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {item.contact?.name || item.number}
        </Text>
        <Text className="text-gray-600 dark:text-gray-400">{item.number}</Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {new Date(item.timestamp).toLocaleString()}
          {item.duration ? ` • ${item.duration}s` : ""}
          {item.type ? ` • ${item.type}` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-6 pb-2">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white">
          Contacts
        </Text>
      </View>

      <View className="px-6 py-4 flex-row items-center space-x-3">
        <TextInput
          className="flex-1 h-12 px-6 bg-white dark:bg-gray-800 rounded-full text-base shadow-sm"
          placeholder="Enter phone number"
          placeholderTextColor={colors.secondary}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <TouchableOpacity
          className="shadow-sm"
          onPress={() => makeCall(phoneNumber)}
        >
          <LinearGradient
            colors={[colors.primary, colors.primary + "DD"]}
            className="px-6 py-3 rounded-full min-w-[100] items-center"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text className="text-white font-semibold text-base">Call</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View className="flex-row px-4 py-3 mb-2 mx-2">
        <TabButton
          title="Contacts"
          isActive={activeTab === "contacts"}
          onPress={() => setActiveTab("contacts")}
        />
        <TabButton
          title="Leads"
          isActive={activeTab === "leads"}
          onPress={() => setActiveTab("leads")}
        />
        <TabButton
          title="Recent"
          isActive={activeTab === "recent"}
          onPress={() => setActiveTab("recent")}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          className="px-6"
          data={
            activeTab === "contacts"
              ? contacts
              : activeTab === "leads"
              ? leads
              : recentCalls
          }
          renderItem={
            activeTab === "contacts"
              ? renderContact
              : activeTab === "leads"
              ? renderLead
              : renderRecentCall
          }
          keyExtractor={(item, index) => item.id || item._id || `${index}`}
        />
      )}
    </SafeAreaView>
  );
}
