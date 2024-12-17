import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import * as Updates from "expo-updates";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState(deviceTheme);

  useEffect(() => {
    setTheme(deviceTheme);
    console.log("this is device theme", deviceTheme);

    async function checkForUpdates() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.log("Error checking for updates:", error);
      }
    }

    checkForUpdates();
  }, [deviceTheme]);

  const colors = {
    dark: {
      primary: "#6366f1", // Indigo-500
      secondary: "#94a3b8", // Slate-400
      background: "#0f172a", // Slate-900
      surface: "#1e293b", // Slate-800
      text: "#f8fafc", // Slate-50
      textSecondary: "#cbd5e1", // Slate-300
      border: "#334155", // Slate-700
      error: "#ef4444", // Red-500
      success: "#22c55e", // Green-500
      warning: "#f59e0b", // Amber-500
      info: "#3b82f6", // Blue-500
      card: "#1e293b", // Slate-800
      divider: "#334155", // Slate-700
      active: "#818cf8", // Indigo-400
      inactive: "#475569", // Slate-600
    },
    light: {
      primary: "#4f46e5", // Indigo-600
      secondary: "#64748b", // Slate-500
      background: "#f8fafc", // Slate-50
      surface: "#ffffff", // White
      text: "#0f172a", // Slate-900
      textSecondary: "#475569", // Slate-600
      border: "#e2e8f0", // Slate-200
      error: "#dc2626", // Red-600
      success: "#16a34a", // Green-600
      warning: "#d97706", // Amber-600
      info: "#2563eb", // Blue-600
      card: "#ffffff", // White
      divider: "#e2e8f0", // Slate-200
      active: "#4f46e5", // Indigo-600
      inactive: "#94a3b8", // Slate-400
    },
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: colors[theme],
        isDark: theme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
