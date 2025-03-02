import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
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

// Custom header button with animation
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

// Custom drawer content with modern design
const CustomDrawerContent = (props) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <LinearGradient
      colors={["#ffffff", "#f8f9fa"]}
      style={styles.gradientBackground}
    >
      <DrawerContentScrollView {...props}>
        <Animated.View style={[styles.drawerHeader, { opacity: fadeAnim }]}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={60} color="#007bff" />
          </View>
          <View>
            <Text style={styles.drawerHeaderText}>Ikramullah</Text>
            <Text style={styles.drawerSubText}>ikram@example.com</Text>
          </View>
        </Animated.View>

        <View style={styles.seperator} />

        <View style={styles.drawerItemsContainer}>
          <DrawerItemList {...props} />

          <View style={styles.seperator} />

          <DrawerItem
            label="Language"
            icon={({ size, color }) => (
              <Ionicons name="language" size={size} color={color} />
            )}
            onPress={() => {
              /* Add logout logic */
            }}
            style={styles.languageButton}
            labelStyle={styles.languageLabel}
          />

          <DrawerItem
            label="About us"
            icon={({ size, color }) => (
              <MaterialIcons name="details" size={size} color={color} />
            )}
            onPress={() => {
              /* Add logout logic */
            }}
            style={styles.languageButton}
            labelStyle={styles.languageLabel}
          />

          <View style={styles.seperator} />

          <DrawerItem
            label="Logout"
            icon={({ size, color }) => (
              <Ionicons name="log-out-outline" size={size} color={color} />
            )}
            onPress={() => {
              /* Add logout logic */
            }}
            style={styles.logoutItem}
            labelStyle={styles.logoutLabel}
          />
        </View>
      </DrawerContentScrollView>
    </LinearGradient>
  );
};

const Layout = () => {
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
          title: "Home",
          drawerLabel: "Home",
          drawerIcon: (props) => renderIcon({ name: "home", ...props }),
        }}
      />
      <Drawer.Screen
        name="SpeedTest"
        options={{
          title: "Speed Test",
          drawerLabel: "Speed Test",
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
    borderLeftWidth: 0,
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
  drawerItemsContainer: {
    // paddingHorizontal: 10,
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
  seperator: {
    borderWidth: 1,
    borderColor: "#eee",
    margin: 10,
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
