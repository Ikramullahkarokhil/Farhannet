"use client";

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
import { Platform } from "react-native";
import apiStore from "../components/api/apiStore";
import colors from "../components/theme";
import Constants from "expo-constants";
import { checkForUpdate } from "../components/utils/VersionUtils";
import UpdateModal from "../components/ui/UpdateModal";
// Import notification service functions
import {
  registerForPushNotificationsAsync,
  registerBackgroundTask,
  unregisterBackgroundTask,
  initializeNotificationChannels,
  addNotificationListeners,
  removeNotificationListeners,
  storeActivePackage,
  checkAndShowNotification,
} from "../notification-service";

SplashScreen.preventAutoHideAsync();

const Layout = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [appIsReady, setAppIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const notificationListeners = useRef(null);
  const appInitialized = useRef(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  const [versionData, setVersionData] = useState([]);
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationsInitialized = useRef(false);

  const currentVersion = Constants.expoConfig?.version || "1.0.0";

  const {
    fetchAllPakages,
    fetchCustomerPackage,
    fetchCustomerComplaints,
    fetchUpdates,
    fetchAppVersions,
    activePackage,
    user,
  } = apiStore();

  // Initialize notification system
  useEffect(() => {
    if (notificationsInitialized.current) return;

    const initNotifications = async () => {
      try {
        // Initialize notification channels
        await initializeNotificationChannels();

        // Register for push notifications
        const token = await registerForPushNotificationsAsync();
        if (token) setExpoPushToken(token);

        // Register background task
        await registerBackgroundTask();

        notificationsInitialized.current = true;
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    };

    initNotifications();

    return () => {
      unregisterBackgroundTask();
    };
  }, []);

  // Setup notification listeners
  useEffect(() => {
    // Define handlers
    const handleNotificationReceived = (notification) => {
      console.log("Notification received:", notification);
    };

    const handleNotificationResponse = (response) => {
      const data = response.notification.request.content.data;
      console.log("Notification response received:", data);

      if (data.type === "expiry") {
        // Navigate to package details or renewal page
        router.push("/(drawer)/packages");
      }
    };

    // Add listeners
    notificationListeners.current = addNotificationListeners(
      handleNotificationReceived,
      handleNotificationResponse
    );

    return () => {
      // Remove listeners on cleanup
      if (notificationListeners.current) {
        removeNotificationListeners(notificationListeners.current);
      }
    };
  }, [router]);

  // Handle active package changes for notifications
  useEffect(() => {
    const handlePackageUpdate = async () => {
      if (isLoggedIn && activePackage && activePackage.status === "Active") {
        // Store the active package for background tasks
        await storeActivePackage(activePackage);

        // Check and show notification if needed
        await checkAndShowNotification();
      }
    };

    // Use a small delay to prevent multiple executions
    const timeoutId = setTimeout(() => {
      handlePackageUpdate();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [activePackage, isLoggedIn]);

  // Fetch data
  useEffect(() => {
    const getData = async () => {
      try {
        const netState = await NetInfo.fetch();
        if (netState.isConnected) {
          const [versions, packages] = await Promise.all([
            fetchAppVersions(),
            fetchAllPakages(),
          ]);
          setVersionData(versions);
          if (versions && versions.length > 0) {
            const updateNeeded = checkForUpdate(currentVersion, versions);
            if (updateNeeded) {
              setLatestVersion(updateNeeded);
              setUpdateModalVisible(true);
            }
          }

          if (user) {
            await Promise.all([
              fetchCustomerPackage(user.id),
              fetchUpdates(),
              fetchCustomerComplaints(user.id),
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getData();
  }, [
    fetchAllPakages,
    fetchCustomerPackage,
    fetchCustomerComplaints,
    fetchUpdates,
    user,
  ]);

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
  }, [i18n, user]);

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

            {/* Render the modal inside PaperProvider */}
            {latestVersion && (
              <UpdateModal
                visible={updateModalVisible}
                onClose={() => setUpdateModalVisible(false)}
                latestVersion={latestVersion.version}
                currentVersion={currentVersion}
                versionData={versionData}
              />
            )}
          </PaperProvider>
        </ActionSheetProvider>
      </GestureHandlerRootView>
    </I18nextProvider>
  );
};

export default Layout;
