import { useEffect, useState, useRef, useCallback } from "react";
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
import apiStore from "../components/api/apiStore";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Layout = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [appIsReady, setAppIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const appInitialized = useRef(false);
  const { fetchAllPakages, fetchCustomerPackage, user } = apiStore();

  useEffect(() => {
    const getApiData = async () => {
      await fetchAllPakages();
    };
    getApiData();
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await setBackgroundColorAsync("white");
        try {
        } catch (notificationError) {
          console.warn(
            "Failed to register for push notifications:",
            notificationError
          );
        }

        // Check saved language
        const savedLanguage = await AsyncStorage.getItem("language");
        if (savedLanguage) {
          i18n.changeLanguage(savedLanguage);
        }

        // Check session
        const sessionData = await AsyncStorage.getItem("userSession");
        if (sessionData) {
          await fetchCustomerPackage(user.id);
          const { timestamp } = JSON.parse(sessionData);
          const oneMonth = 30 * 24 * 60 * 60 * 1000;

          if (Date.now() - timestamp < oneMonth) {
            setIsLoggedIn(true);
          } else {
            await AsyncStorage.removeItem("userSession");
          }
        }
      } catch (e) {
        console.warn("Error preparing app:", e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, [i18n]);

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
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

  // Handle navigation after app is ready
  useEffect(() => {
    if (appIsReady && !appInitialized.current) {
      appInitialized.current = true;
      router.replace(isLoggedIn ? "/(drawer)" : "/Login");
    }
  }, [appIsReady, isLoggedIn, router]);

  // This callback is triggered when the root view layout is complete
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    // Don't render anything until the app is ready
    return null;
  }

  return (
    <I18nextProvider i18n={i18next}>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
