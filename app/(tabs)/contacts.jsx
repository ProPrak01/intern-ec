import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Contacts from "expo-contacts";
import { useTheme } from "../../context/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../../context/GlobalProvider";

const ContactsScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("phone"); // 'phone' or 'leads'
  const { colors } = useTheme();
  const { user } = useGlobalContext();

  // Fetch phone contacts
  const fetchPhoneContacts = async () => {
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
      Alert.alert("Error", "Failed to fetch phone contacts");
    } finally {
      setLoading(false);
    }
  };

  // Fetch leads from backend
  const fetchLeads = async () => {
    try {
      console.log("Fetching leads with user:", user);

      // First check user status
      if (user.status === "inactive") {
        Alert.alert(
          "Account Inactive",
          "Your account is currently inactive. Please contact the administrator.",
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }

      //   const response = await fetch('http://192.168.8.103:6000/api/leads/test-user-leads', {
      //     method: 'GET',
      //     headers: {
      //       'Authorization': `Bearer ${user.token}`
      //     }
      //   });

      //   const testData = await response.json();
      //   console.log('Test endpoint response:', testData);

      // Now fetch actual leads
      const leadsResponse = await fetch("http://192.168.8.103:6000/api/leads", {
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
      console.log("Leads response:", data);

      if (!leadsResponse.ok) throw new Error(data.message);
      setLeads(data.leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      Alert.alert("Error", error.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }   
  };

  useEffect(() => {
    fetchPhoneContacts();
    fetchLeads();
  }, []);

  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 py-2 ${isActive ? "border-b-2 border-blue-500" : ""}`}
    >
      <Text
        className={`text-center font-pmedium ${
          isActive ? "text-blue-500" : ""
        }`}
        style={{ color: isActive ? colors.primary : colors.secondary }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderPhoneContact = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 mb-2 rounded-lg"
      style={{ backgroundColor: colors.card }}
    >
      <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-4">
        <Text className="text-white text-lg font-psemibold">
          {(item.name || "?")[0].toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text
          className="text-base font-pmedium mb-1"
          style={{ color: colors.text }}
        >
          {item.name}
        </Text>
        {item.phoneNumbers && item.phoneNumbers[0] && (
          <Text
            className="text-sm font-pregular"
            style={{ color: colors.secondary }}
          >
            {item.phoneNumbers[0].number}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderLead = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 mb-2 rounded-lg"
      style={{ backgroundColor: colors.card }}
    >
      <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-4">
        <Text className="text-white text-lg font-psemibold">
          {(item.name || "?")[0].toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text
          className="text-base font-pmedium mb-1"
          style={{ color: colors.text }}
        >
          {item.name}
        </Text>
        <Text
          className="text-sm font-pregular"
          style={{ color: colors.secondary }}
        >
          {item.phoneNumber}
        </Text>
        <Text
          className="text-xs font-pregular mt-1"
          style={{ color: colors.secondary }}
        >
          Status: {item.status} • Priority: {item.priority}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <Text
        className="text-2xl font-psemibold px-4 pt-4"
        style={{ color: colors.text }}
      >
        Contacts
      </Text>

      {/* Tab Switcher */}
      <View className="flex-row mx-4 mt-4 mb-2">
        <TabButton
          title="Phone Contacts"
          isActive={activeTab === "phone"}
          onPress={() => setActiveTab("phone")}
        />
        <TabButton
          title="Leads"
          isActive={activeTab === "leads"}
          onPress={() => setActiveTab("leads")}
        />
      </View>

      <FlatList
        data={activeTab === "phone" ? contacts : leads}
        renderItem={activeTab === "phone" ? renderPhoneContact : renderLead}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={{ padding: 16 }}
        className="flex-1"
      />
    </SafeAreaView>
  );
};

export default ContactsScreen;
