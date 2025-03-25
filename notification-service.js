import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Define a background task name
const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND_NOTIFICATION_TASK";
const NOTIFICATION_SCHEDULED_KEY = "PACKAGE_NOTIFICATIONS_SCHEDULED";

const timeLimitPackage = 3;

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register the background task
if (!TaskManager.isTaskDefined(BACKGROUND_NOTIFICATION_TASK)) {
  TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
    try {
      console.log("Background task running...");

      const notificationsScheduled = await AsyncStorage.getItem(
        NOTIFICATION_SCHEDULED_KEY
      );
      if (notificationsScheduled === "true") {
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      const storedPackageData = await AsyncStorage.getItem("activePackage");
      if (!storedPackageData) {
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      const packageData = JSON.parse(storedPackageData);

      if (packageData && packageData.status === "Active") {
        await checkAndShowNotification();
        return BackgroundFetch.BackgroundFetchResult.NewData;
      }

      return BackgroundFetch.BackgroundFetchResult.NoData;
    } catch (error) {
      console.error("Background task error:", error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

// Improved push notification registration with FCM fallback
export async function registerForPushNotificationsAsync() {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: false,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: false,
          allowProvisional: false,
          allowAnnouncements: false,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Push notification permission not granted");
      return null;
    }

    // Get project ID from various possible locations
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.manifest2?.extra?.eas?.projectId ||
      Constants.manifest?.extra?.eas?.projectId;

    if (!projectId) {
      console.warn("No project ID found for push notifications");
      return null;
    }

    // Get push token with project ID
    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data;
    console.log("Push token:", token);
    return token;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}

// Function to schedule package expiry notifications
export async function schedulePackageExpiryNotification(packageData) {
  if (!packageData || !packageData.expiry_date) return;

  const notificationsScheduled = await AsyncStorage.getItem(
    NOTIFICATION_SCHEDULED_KEY
  );
  if (notificationsScheduled === "true") {
    console.log("Notifications already scheduled, skipping");
    return;
  }

  await cancelAllPackageNotifications();

  const expiryDate = new Date(packageData.expiry_date);
  const today = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiryDate - today) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry <= timeLimitPackage && daysUntilExpiry > 0) {
    const notificationTitle =
      daysUntilExpiry === 1
        ? "Package Expires Tomorrow"
        : "Package Expiring Soon";

    const notificationBody =
      daysUntilExpiry === 1
        ? `Your ${packageData.package} package will expire tomorrow. Please renew now.`
        : `Your ${packageData.package} package will expire in ${daysUntilExpiry} days. Please renew soon.`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationTitle,
        body: notificationBody,
        data: {
          packageName: packageData.package,
          type: "expiry",
          daysLeft: daysUntilExpiry,
        },
      },
      trigger: null, // Show immediately
    });

    console.log(`Scheduled notification for package ${packageData.package}`);
    await AsyncStorage.setItem(NOTIFICATION_SCHEDULED_KEY, "true");
    scheduleResetAtMidnight();
  }
}

function scheduleResetAtMidnight() {
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    1
  );
  const timeToMidnight = night.getTime() - now.getTime();

  setTimeout(async () => {
    await AsyncStorage.removeItem(NOTIFICATION_SCHEDULED_KEY);
    console.log("Notification scheduled flag reset for new day");
  }, timeToMidnight);
}

export async function cancelAllPackageNotifications() {
  const scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduledNotifications) {
    if (notification.content.data?.type === "expiry") {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier
      );
    }
  }
  await Notifications.dismissAllNotificationsAsync();
}

export async function registerBackgroundTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_NOTIFICATION_TASK
    );
    if (isRegistered) return true;

    await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
      minimumInterval: 60 * 60, // 1 hour
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log("Background task registered");
    return true;
  } catch (err) {
    console.error("Background task registration failed:", err);
    return false;
  }
}

export async function unregisterBackgroundTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_NOTIFICATION_TASK
    );
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    }
    return true;
  } catch (err) {
    console.error("Background task unregistration failed:", err);
    return false;
  }
}

export async function initializeNotificationChannels() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}

export function addNotificationListeners(onReceive, onResponse) {
  const receivedListener =
    Notifications.addNotificationReceivedListener(onReceive);
  const responseListener =
    Notifications.addNotificationResponseReceivedListener(onResponse);
  return { receivedListener, responseListener };
}

export function removeNotificationListeners(listeners) {
  if (listeners?.receivedListener) {
    Notifications.removeNotificationSubscription(listeners.receivedListener);
  }
  if (listeners?.responseListener) {
    Notifications.removeNotificationSubscription(listeners.responseListener);
  }
}

export async function storeActivePackage(packageData) {
  if (packageData) {
    await AsyncStorage.setItem("activePackage", JSON.stringify(packageData));
    return true;
  }
  return false;
}

export async function checkAndShowNotification() {
  try {
    const storedPackageData = await AsyncStorage.getItem("activePackage");
    if (!storedPackageData) return false;

    const packageData = JSON.parse(storedPackageData);
    if (!packageData || packageData.status !== "Active") return false;

    const notificationsScheduled = await AsyncStorage.getItem(
      NOTIFICATION_SCHEDULED_KEY
    );
    if (notificationsScheduled === "true") return false;

    await schedulePackageExpiryNotification(packageData);
    return true;
  } catch (error) {
    console.error("Error checking notifications:", error);
    return false;
  }
}
