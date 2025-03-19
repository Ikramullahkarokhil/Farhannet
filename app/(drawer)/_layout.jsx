import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Drawer } from "expo-router/drawer";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import apiStore from "../../components/api/apiStore";

const colors = {
  primary: "#0066FF",
  secondary: "#F0F4F8",
  text: "#1A202C",
  textMuted: "#6B7280",
  background: "#FFFFFF",
  accent: "#2C9E9A",
  danger: "#E53E3E",
  border: "#DDE4EB",
};

// HeaderRight with Reanimated 3
const HeaderRight = () => {
  const navigation = useNavigation();
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const onPressIn = () => {
    scaleValue.value = withSpring(0.9);
  };

  const onPressOut = () => {
    scaleValue.value = withSpring(1);
    navigation.toggleDrawer();
  };

  return (
    <TouchableOpacity
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.headerButton}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons name="menu" size={28} color={colors.text} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const CustomDrawerContent = (props) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { showActionSheetWithOptions } = useActionSheet();
  const { user, logout } = apiStore();

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem("language", lng);
  };

  const handleChangePassword = async () => {
    router.navigate("/screens/ChangePassword");
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userSession");
    router.replace("Login");
    await logout();
  };

  const handleLanguageChange = () => {
    const options = [t("english"), t("pashto"), t("dari")];
    const cancelButtonIndex = 3;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            changeLanguage("en");
            break;
          case 1:
            changeLanguage("pa");
            break;
          case 2:
            changeLanguage("da");
            break;
          case cancelButtonIndex:
            break;
        }
      }
    );
  };

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={60} color={colors.primary} />
          </View>
          <View>
            {user ? (
              <>
                <Text style={styles.drawerHeaderText} numberOfLines={1}>
                  {user.first_name}
                </Text>
                <Text style={styles.drawerSubText}>@{user.username}</Text>
              </>
            ) : (
              <Text style={styles.drawerHeaderText}>farhanict.com</Text>
            )}
          </View>
        </View>

        <View style={styles.seperator} />

        <DrawerItemList {...props} />

        <View style={styles.seperator} />

        <DrawerItem
          label={t("language")}
          icon={({ size, color }) => (
            <Ionicons name="language" size={size} color={color} />
          )}
          onPress={handleLanguageChange}
          style={styles.languageButton}
          labelStyle={styles.languageLabel}
        />

        <DrawerItem
          label={t("change-password")}
          icon={({ size, color }) => (
            <Ionicons name="lock-closed-outline" size={size} color={color} />
          )}
          onPress={handleChangePassword}
          style={styles.languageButton}
          labelStyle={styles.languageLabel}
        />

        <View style={styles.seperator} />

        <DrawerItem
          label={t("contact-us")}
          icon={({ size, color }) => (
            <Image
              source={require("../../assets/icons/contact-us.png")}
              style={{ width: size, height: size, tintColor: color }}
            />
          )}
          onPress={() => {
            router.navigate("/screens/Contact");
          }}
          style={styles.languageButton}
          labelStyle={styles.languageLabel}
        />

        <DrawerItem
          label={t("about-us")}
          icon={({ size, color }) => (
            <Image
              source={require("../../assets/icons/about-us.png")}
              style={{ width: size, height: size, tintColor: color }}
            />
          )}
          onPress={() => {
            router.navigate("/screens/About");
          }}
          style={styles.languageButton}
          labelStyle={styles.languageLabel}
        />

        <DrawerItem
          label={t("logout")}
          icon={({ size, color }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          )}
          onPress={handleLogout}
          style={styles.logoutItem}
          labelStyle={styles.logoutLabel}
        />
      </DrawerContentScrollView>
    </View>
  );
};

const Layout = () => {
  const { t } = useTranslation();

  const renderIcon = ({ name, focused, color, size }) => (
    <View style={styles.iconContainer}>
      <Ionicons
        name={`${name}${focused ? "" : "-outline"}`}
        size={size}
        color={focused ? colors.primary : colors.textMuted}
      />
    </View>
  );

  return (
    <Drawer
      screenOptions={{
        headerTitleAlign: "center",
        headerTitleStyle: styles.headerTitle,
        drawerPosition: "right",
        drawerType: "slide",
        headerLeft: () => null,
        headerRight: () => <HeaderRight />,
        drawerStyle: styles.drawerStyle,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textMuted,
        drawerItemStyle: styles.drawerItem,
        drawerLabelStyle: styles.drawerLabel,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: t("home"),
          drawerLabel: t("home"),
          drawerIcon: (props) => renderIcon({ name: "home", ...props }),
        }}
      />
      <Drawer.Screen
        name="SpeedTest"
        options={{
          title: t("speed-test"),
          drawerLabel: t("speed-test"),
          drawerIcon: (props) => renderIcon({ name: "speedometer", ...props }),
        }}
      />
    </Drawer>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  drawerStyle: {
    width: 280,
    elevation: 10,
    backgroundColor: colors.background,
  },
  drawerHeader: {
    paddingHorizontal: 5,
    flexDirection: "row",
    paddingTop: 10,
  },
  avatarContainer: {
    marginBottom: 15,
    alignItems: "center",
  },
  drawerHeaderText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    width: "90%",
    paddingTop: 5,
  },
  drawerSubText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  seperator: {
    borderWidth: 1,
    borderColor: colors.border,
    margin: 10,
  },
  drawerItem: {
    borderRadius: 10,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  iconContainer: {
    marginRight: 15,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: -10,
    color: colors.text,
  },
  logoutItem: {
    borderRadius: 10,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  logoutLabel: {
    color: colors.danger,
    fontWeight: "500",
  },
  languageButton: {
    borderRadius: 10,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  languageLabel: {
    fontWeight: "500",
    color: colors.text,
  },
});

export default Layout;
