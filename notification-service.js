import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {
  let token = null;

  try {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return null;
      }

      // Try to get the token, but handle Firebase initialization errors
      try {
        token = (await Notifications.getDevicePushTokenAsync()).data;
      } catch (error) {
        // Handle Firebase not initialized error
        console.log("Error getting device push token:", error);

        // Try to get Expo push token as fallback
        try {
          token = (await Notifications.getExpoPushTokenAsync()).data;
          console.log("Using Expo push token instead:", token);
        } catch (expoPushError) {
          console.log("Error getting Expo push token:", expoPushError);
        }
      }
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  } catch (error) {
    console.log("Error in registerForPushNotificationsAsync:", error);
    return null;
  }
}
