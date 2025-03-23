import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Drawer } from "expo-router/drawer";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useTranslation } from "react-i18next";
import apiStore from "../../components/api/apiStore";
import colors from "../../components/theme";
import { MaterialIcons } from "@expo/vector-icons";

const HeaderRight = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.headerRightContainer}>
      <TouchableOpacity
        onPress={() => navigation.toggleDrawer()}
        style={styles.headerButton}
      >
        <Ionicons name="menu" size={28} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const CustomDrawerContent = (props) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { showActionSheetWithOptions } = useActionSheet();
  const { user, logout } = apiStore();

  const isRTL = useMemo(() => {
    return i18n.language === "pa" || i18n.language === "da";
  }, [i18n.language]);

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem("language", lng);
  };

  const handleChangePassword = async () => {
    if (user) {
      router.navigate("/screens/ChangePassword");
    }
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

  // Custom drawer item renderer for RTL support
  const renderDrawerItem = (route, index) => {
    const { options } = props.descriptors[route.key];
    const label =
      options.drawerLabel !== undefined
        ? options.drawerLabel
        : options.title !== undefined
        ? options.title
        : route.name;

    const isFocused = props.state.index === index;

    const onPress = () => {
      const event = props.navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        props.navigation.navigate(route.name);
      }
    };

    return (
      <DrawerItem
        key={route.key}
        label={label}
        icon={({ size, color }) => {
          if (options.drawerIcon) {
            return options.drawerIcon({ size, color, focused: isFocused });
          }
          return null;
        }}
        onPress={onPress}
        focused={isFocused}
        activeTintColor={props.activeTintColor}
        inactiveTintColor={props.inactiveTintColor}
        activeBackgroundColor={props.activeBackgroundColor}
        inactiveBackgroundColor={props.inactiveBackgroundColor}
        style={styles.drawerItem}
        labelStyle={[styles.drawerLabel, isRTL && styles.rtlText]}
      />
    );
  };

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props}>
        <View style={[styles.drawerHeader, isRTL && styles.rtlFlexRow]}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={60} color={colors.primary} />
          </View>
          <View style={isRTL ? { alignItems: "flex-end" } : {}}>
            {user ? (
              <>
                <Text
                  style={[styles.drawerHeaderText, isRTL && styles.rtlText]}
                  numberOfLines={1}
                >
                  {user.first_name} {user.last_name}
                </Text>

                <Text style={[styles.drawerSubText, isRTL && styles.rtlText]}>
                  @{user.username}
                </Text>
              </>
            ) : (
              <Text
                style={[styles.drawerHeaderText, isRTL && styles.rtlText]}
                numberOfLines={1}
              >
                farhanict.com
              </Text>
            )}
          </View>
        </View>

        <View style={styles.seperator} />

        <View>
          {props.state.routes.map((route, index) =>
            renderDrawerItem(route, index)
          )}
        </View>

        <DrawerItem
          label={({ color, focused }) => (
            <Text
              style={[
                styles.languageLabel,
                isRTL && styles.rtlText,
                focused && { color: props.activeTintColor },
              ]}
            >
              {t("speed-test")}
            </Text>
          )}
          icon={({ size, color }) => (
            <Ionicons name="speedometer-outline" size={size} color={color} />
          )}
          onPress={() => router.navigate("/screens/SpeedTest")}
          style={styles.languageButton}
        />

        <View style={styles.seperator} />

        <DrawerItem
          label={({ color, focused }) => (
            <Text
              style={[
                styles.languageLabel,
                isRTL && styles.rtlText,
                focused && { color: props.activeTintColor },
              ]}
            >
              {t("language")}
            </Text>
          )}
          icon={({ size, color }) => (
            <Ionicons name="language" size={size} color={color} />
          )}
          onPress={handleLanguageChange}
          style={styles.languageButton}
        />

        <DrawerItem
          label={({ color, focused }) => (
            <Text
              style={[
                styles.languageLabel,
                isRTL && styles.rtlText,
                !user && styles.disabledLabel,
                focused && !user
                  ? {}
                  : focused && { color: props.activeTintColor },
              ]}
            >
              {t("change-password")}
            </Text>
          )}
          icon={({ size, color }) => (
            <Ionicons name="lock-closed-outline" size={size} color={color} />
          )}
          onPress={handleChangePassword}
          style={[styles.languageButton, !user && styles.disabledButton]}
          disabled={!user}
        />
        <View style={styles.seperator} />

        <DrawerItem
          label={({ color, focused }) => (
            <Text
              style={[
                styles.languageLabel,
                isRTL && styles.rtlText,
                focused && { color: props.activeTintColor },
              ]}
            >
              {t("internet-usage")}
            </Text>
          )}
          icon={({ size, color }) => (
            <MaterialIcons name="data-usage" size={size} color={color} />
          )}
          onPress={() => router.navigate("/screens/InternetUsage")}
          style={styles.languageButton}
        />

        <View style={styles.seperator} />

        <DrawerItem
          label={({ color, focused }) => (
            <Text
              style={[
                styles.languageLabel,
                isRTL && styles.rtlText,
                focused && { color: props.activeTintColor },
              ]}
            >
              {t("contact-us")}
            </Text>
          )}
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
        />

        <DrawerItem
          label={({ color, focused }) => (
            <Text
              style={[
                styles.languageLabel,
                isRTL && styles.rtlText,
                focused && { color: props.activeTintColor },
              ]}
            >
              {t("about-us")}
            </Text>
          )}
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
        />

        <View style={styles.seperator} />

        <DrawerItem
          label={({ color, focused }) => (
            <Text
              style={[
                styles.logoutLabel,
                isRTL && styles.rtlText,
                focused && { color: colors.danger },
              ]}
            >
              {t("logout")}
            </Text>
          )}
          icon={({ size, color }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          )}
          onPress={handleLogout}
          style={styles.logoutItem}
        />
      </DrawerContentScrollView>
    </View>
  );
};

const Layout = () => {
  const { t, i18n } = useTranslation();

  const isRTL = useMemo(() => {
    return i18n.language === "pa" || i18n.language === "da";
  }, [i18n.language]);

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
        headerTitleStyle: [styles.headerTitle, isRTL && styles.rtlText],
        drawerPosition: "right", // Always keep drawer on right side
        drawerType: "slide",
        headerLeft: () => null,
        headerRight: () => <HeaderRight />,
        drawerStyle: styles.drawerStyle,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textMuted,
        drawerItemStyle: styles.drawerItem,
        drawerLabelStyle: [styles.drawerLabel, isRTL && styles.rtlText],
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
    </Drawer>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    padding: 5,
    marginRight: 15,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  rtlFlexRow: {
    flexDirection: "row-reverse",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  avatarContainer: {
    marginBottom: 15,
    alignItems: "center",
    marginHorizontal: 10,
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
  disabledButton: {
    opacity: 0.5,
  },
  disabledLabel: {
    color: colors.textMuted,
  },
});

export default Layout;
