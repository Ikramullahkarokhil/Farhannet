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
import * as Notifications from "expo-notifications";
import apiStore from "../components/api/apiStore";
import colors from "../components/theme";
import Constants from "expo-constants";
import { checkForUpdate } from "../components/utils/VersionUtils";
import UpdateModal from "../components/ui/UpdateModal";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Layout = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [appIsReady, setAppIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const appInitialized = useRef(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  const [versionData, setVersionData] = useState([]);

  const currentVersion = Constants.expoConfig?.version || "1.0.0";

  const {
    fetchAllPakages,
    fetchCustomerPackage,
    fetchCustomerComplaints,
    fetchUpdates,
    fetchAppVersions,
    user,
  } = apiStore();

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

  // Setup notification handlers
  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data; // Fix typo here
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
