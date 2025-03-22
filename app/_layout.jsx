import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import NetInfo from "@react-native-community/netinfo";
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
import colors from "../components/theme";

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

  // Destructure only what's needed from the store
  const {
    fetchAllPakages,
    fetchCustomerPackage,
    fetchCustomerComplaints,
    user,
  } = apiStore();

  // Check internet connection before fetching data
  useEffect(() => {
    const getData = async () => {
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        await fetchAllPakages().catch((error) =>
          console.warn("Failed to fetch packages:", error)
        );
        if (user) {
          await Promise.all([
            fetchCustomerPackage(user.id),
            fetchCustomerComplaints(user.id),
          ]);
        }
      }
    };

    getData();
  }, [fetchAllPakages, fetchCustomerPackage, fetchCustomerComplaints, user]);

  // Setup notification handlers
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
          // Handle navigation if needed
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // App initialization logic
  useEffect(() => {
    const prepare = async () => {
      try {
        // Set background color
        await setBackgroundColorAsync(colors.background);

        // Load saved language
        const savedLanguage = await AsyncStorage.getItem("language");
        if (savedLanguage) {
          i18n.changeLanguage(savedLanguage);
        }

        // Check user session
        const sessionData = await AsyncStorage.getItem("userSession");
        if (sessionData && user) {
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
        setAppIsReady(true);
      }
    };

    prepare();
  }, [i18n, fetchCustomerPackage, fetchCustomerComplaints, user]);

  // Handle navigation after app is ready
  useEffect(() => {
    if (appIsReady && !appInitialized.current) {
      appInitialized.current = true;
      router.replace(isLoggedIn ? "/(drawer)" : "/Login");
    }
  }, [appIsReady, isLoggedIn, router]);

  // Memoize the onLayoutRootView callback
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // Memoize the Stack component configuration
  const stackScreenOptions = useMemo(
    () => ({
      headerTitleAlign: "center",
      animation: "simple_push",
    }),
    []
  );

  // Don't render until app is ready
  if (!appIsReady) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18next}>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <ActionSheetProvider>
          <PaperProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={stackScreenOptions}>
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
