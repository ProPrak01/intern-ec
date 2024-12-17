import { View, Text, TextInput } from "react-native";
import React from "react";
import { useTheme } from "../context/ThemeProvider";

const FormField = ({
  title,
  value,
  handleChangeText,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "sentences",
  containerStyle = "",
  textStyle = "",
}) => {
  const { colors } = useTheme();

  return (
    <View className="w-full">
      <Text 
        className={`text-base mb-2 text-gray-700 dark:text-gray-300 ${textStyle}`}
      >
        {title}
      </Text>
      <TextInput
        value={value}
        onChangeText={handleChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className={`w-full px-4 py-3.5 rounded-xl border border-gray-200 
          dark:border-gray-700 text-base text-gray-900 dark:text-white 
          ${containerStyle}`}
        placeholderTextColor={colors.isDark ? "#9ca3af" : "#6b7280"}
        style={{
          fontFamily: "Poppins-Regular",
        }}
      />
    </View>
  );
};

export default FormField;