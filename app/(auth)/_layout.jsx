import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../context/ThemeProvider";

const AuthLayout = () => {
  const { theme, colors } = useTheme();
  
  return (
    <>
      <Stack>
        <Stack.Screen
          name="sign-in"  
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar
        backgroundColor={colors.background}
        style={theme === "dark" ? "light" : "dark"}
      />
    </>
  );
};

export default AuthLayout;
