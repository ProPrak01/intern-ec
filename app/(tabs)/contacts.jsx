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
} from "react-native";
import * as Contacts from "expo-contacts";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Audio } from "expo-av";
import { useGlobalContext } from "../../context/GlobalProvider";
import { useTheme } from "../../context/ThemeProvider";
import { AppState } from "react-native";

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
      if (!leadsResponse.ok) throw new Error(data.message);
      setLeads(data.leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
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

  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tabButton,
        isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
      ]}
    >
      <Text
        style={[
          styles.tabText,
          { color: isActive ? colors.primary : colors.secondary },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderContact = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => makeCall(item.phoneNumbers?.[0]?.number, "contact", item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.name || "?")[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        {item.phoneNumbers?.[0] && (
          <Text style={styles.phoneNumber}>{item.phoneNumbers[0].number}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderLead = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => makeCall(item.phoneNumber, "lead", item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.name || "?")[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
        <Text style={styles.leadDetails}>
          Status: {item.status} • Priority: {item.priority}
        </Text>
        <Text style={styles.leadDetails}>Email: {item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentCall = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => makeCall(item.number, item.contactType, item.contact)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.contact?.name || "?")[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>
          {item.contact?.name || item.number}
        </Text>
        <Text style={styles.phoneNumber}>{item.number}</Text>
        <Text style={styles.callTime}>
          {new Date(item.timestamp).toLocaleString()}
          {item.duration ? ` • ${item.duration}s` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    fetchContacts();
    fetchLeads();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => makeCall(phoneNumber)}
        >
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  inputContainer: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  callButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  contactItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  phoneNumber: {
    color: "#666",
    marginBottom: 2,
  },
  leadDetails: {
    color: "#666",
    fontSize: 12,
  },
  callTime: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },
});
