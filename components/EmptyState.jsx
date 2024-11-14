import { View, Text, Image } from "react-native";
import React from "react";
import { router } from "expo-router";
import { images } from "../constants";
import CustomButton from "./customButton";
const EmptyState = ({ title, subtitle }) => {
  return (
    <View className="justfy-center items-center px-4">
      <Image
        source={images.empty}
        className="w-[270px] h-[215px]"
        resizeMode="contain"
      />
      <Text className="text-xl font-psemibold text-center text-white mt-2">
        {title}
      </Text>
      <Text className="font-pmedium text-sm text-gray-100">{subtitle}</Text>
      <CustomButton
        title="Create PDF"
        handlePress={() => router.push("/bookmark")}
        containerSyles="w-full my-5"
      />
    </View>
  );
};

export default EmptyState;
