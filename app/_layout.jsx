import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { setBackgroundColorAsync } from "expo-navigation-bar";

SplashScreen.preventAutoHideAsync();

const Layout = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setBackgroundColorAsync("white");
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await AsyncStorage.getItem("userSession");
        if (sessionData) {
          const { timestamp } = JSON.parse(sessionData);
          const oneWeek = 7 * 24 * 60 * 60 * 1000;
          if (Date.now() - timestamp < oneWeek) {
            setIsLoggedIn(true);
          } else {
            await AsyncStorage.removeItem("userSession");
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync();
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      router.replace(isLoggedIn ? "/(drawer)" : "/Login");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ActionSheetProvider>
        <PaperProvider>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerTitleAlign: "center",
              animation: "simple_push",
            }}
          >
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen name="Login" options={{ headerShown: false }} />
          </Stack>
        </PaperProvider>
      </ActionSheetProvider>
    </GestureHandlerRootView>
  );
};

export default Layout;
