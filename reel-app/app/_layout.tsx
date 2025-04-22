import { StatusBar } from "react-native";
import "./global.css";
import { Stack } from "expo-router";
import React from "react";
import Toast from "react-native-toast-message";
import { AuthProvider } from "@/context/AuthContext";
import { ReelsProvider } from '@/context/ReelsContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ReelsProvider>
          <StatusBar hidden={false} backgroundColor={"#0C1319"} barStyle="light-content" />
          <Stack>
            <Stack.Screen
              name="(initial)/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth)"
              options={{ headerShown: false, presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
            />
          </Stack>
        </ReelsProvider>
        <Toast />
      </AuthProvider>
    </QueryClientProvider>
  );
}
