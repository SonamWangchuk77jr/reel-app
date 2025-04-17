import { StatusBar } from "react-native";
import "./global.css";
import { router, Stack } from "expo-router";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function RootLayout() {
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const loggedIn = !!token;

        if (loggedIn) {
          router.replace("/");
        } else {
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.replace("/(auth)/login");
      }
    };
    checkToken();
  }, []);
  return (
    <>
      <StatusBar hidden={false} />
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            presentation: 'modal'
          }}
        />
      </Stack>
      <Toast />
    </>

  );
}
