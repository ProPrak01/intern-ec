import { Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";

const CustomButton = ({
  title,
  handlePress,
  isLoading = false,
  disabled = false,
  className = "",
  textClassName = "",
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading || disabled}
      className={`w-full items-center justify-center 
        ${isLoading || disabled ? 'opacity-70' : 'active:opacity-80'} 
        ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text 
          className={`text-center ${textClassName}`}
          style={{ fontFamily: "Poppins-SemiBold" }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;