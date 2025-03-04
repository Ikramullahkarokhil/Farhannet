import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { setBackgroundColorAsync } from "expo-navigation-bar";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18next from "../locales/languageConfig";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "../notification-service";

SplashScreen.preventAutoHideAsync();

const Layout = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync();
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // You can handle the notification here, e.g., update the UI
        console.log("Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("Notification response received:", data);

        if (data.updateId) {
          // navigation.navigate('UpdateDetails', { id: data.updateId });
        }
      });

    return () => {
      // Clean up the listeners
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    setBackgroundColorAsync("white");
  }, []);

  useEffect(() => {
    const checkSessionAndLanguage = async () => {
      try {
        // Check saved language
        const savedLanguage = await AsyncStorage.getItem("language");
        if (savedLanguage) {
          i18n.changeLanguage(savedLanguage);
        }

        // Check session
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
        console.error("Error checking session or language:", error);
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync();
      }
    };

    checkSessionAndLanguage();
  }, [i18n]);

  useEffect(() => {
    if (!isLoading) {
      router.replace(isLoggedIn ? "/(drawer)" : "/Login");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
        <Text>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18next}>
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
              <Stack.Screen
                name="Login"
                options={{
                  headerShown: false,
                }}
              />
            </Stack>
          </PaperProvider>
        </ActionSheetProvider>
      </GestureHandlerRootView>
    </I18nextProvider>
  );
};

export default Layout;
