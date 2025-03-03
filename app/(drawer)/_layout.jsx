import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { Drawer } from "expo-router/drawer";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useTranslation } from "react-i18next";

// HeaderRight remains the same...
const HeaderRight = () => {
  const navigation = useNavigation();
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    navigation.toggleDrawer();
  };

  return (
    <TouchableOpacity
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.headerButton}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <Ionicons name="menu" size={28} color="#333" />
      </Animated.View>
    </TouchableOpacity>
  );
};

const CustomDrawerContent = (props) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { showActionSheetWithOptions } = useActionSheet();

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem("language", lng);
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
            changeLanguage("en"); // Change to English
            break;
          case 1:
            changeLanguage("pa"); // Change to Pashto
            break;
          case 2:
            changeLanguage("da"); // Change to Dari
            break;
          case cancelButtonIndex:
            // Canceled
            break;
        }
      }
    );
  };

  return (
    <LinearGradient
      colors={["#ffffff", "#f8f9fa"]}
      style={styles.gradientBackground}
    >
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={60} color="#007bff" />
          </View>
          <View>
            <Text style={styles.drawerHeaderText}>Ikramullah</Text>
            <Text style={styles.drawerSubText}>ikram@example.com</Text>
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

        {/* Use your local icon for "Contact Us" */}
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

        {/* Use your local icon for "About Us" */}
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

        <View style={styles.seperator} />

        <DrawerItem
          label={t("logout")}
          icon={({ size, color }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          )}
          onPress={async () => {
            await AsyncStorage.removeItem("userSession");
            router.replace("Login");
          }}
          style={styles.logoutItem}
          labelStyle={styles.logoutLabel}
        />
      </DrawerContentScrollView>
    </LinearGradient>
  );
};

const Layout = () => {
  const { t } = useTranslation();

  const renderIcon = ({ name, focused, color, size }) => (
    <View style={styles.iconContainer}>
      <Ionicons
        name={`${name}${focused ? "" : "-outline"}`}
        size={size}
        color={focused ? "#007bff" : color}
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
        drawerActiveTintColor: "#007bff",
        drawerInactiveTintColor: "#666",
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
    color: "#333",
  },
  gradientBackground: {
    flex: 1,
  },
  drawerStyle: {
    width: 280,
    elevation: 10,
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
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  drawerSubText: {
    fontSize: 14,
    color: "#666",
  },
  seperator: {
    borderWidth: 1,
    borderColor: "#eee",
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
  },
  logoutItem: {
    borderRadius: 10,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  logoutLabel: {
    color: "#dc3545",
    fontWeight: "500",
  },
  languageButton: {
    borderRadius: 10,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  languageLabel: {
    fontWeight: "500",
  },
});

export default Layout;
