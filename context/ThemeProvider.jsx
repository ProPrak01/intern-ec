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
    // Check for theme updates
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
      background: "#161622",
      text: "#ECDFCC",
      secondary: "#ECDFCC",
    },
    light: {
      background: "#FFFFFF",
      text: "#1E201E",
      secondary: "#697565",
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, colors: colors[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
