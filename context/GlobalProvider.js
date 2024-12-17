import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Centralize API configuration
const API_CONFIG = {
  BASE_URL: "https://crm-s1.amiigo.in/api",
  ENDPOINTS: {
    LOGIN: "/users/login",
    REGISTER: "/users/register",
    VERIFY_TOKEN: "/users/verify-token",
  },
};

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");

      if (token && userData) {
        // Verify token with backend
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VERIFY_TOKEN}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setUser(JSON.parse(userData));
          setIsLoggedIn(true);
        } else {
          // Token is invalid, clear storage
          await AsyncStorage.multiRemove(["token", "user"]);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    try {
      console.log("Attempting login with email:", email);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      console.log("Server response status:", response.status);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Check if data exists
      if (!data || !data.user) {
        throw new Error("Invalid response: missing user data");
      }

      // Extract token from user object
      const token = data.user.token;
      const userData = { ...data.user };
      delete userData.token; // Remove token from user data before storing

      // Store data
      const storageItems = [
        ["token", token],
        ["user", JSON.stringify(userData)],
      ];

      await AsyncStorage.multiSet(storageItems);
      setUser(userData);
      setIsLoggedIn(true);

      return {
        ...data,
        token,
        user: userData,
      };
    } catch (error) {
      console.error("Login error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  };

  const registerUser = async (formData) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            role: formData.role || "COUNSELLOR",
            status: "inactive",
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      // Don't store token or set user state since account needs approval
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        isLoading,
        loginUser,
        registerUser,
        logout,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
