"use client";

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Image,
  Platform,
} from "react-native";
import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { currentPackage, availablePackages, updates } from "../../data";
import { useTranslation } from "react-i18next";
import { setBackgroundColorAsync } from "expo-navigation-bar";

const colors = {
  primary: "#007AFF",
  secondary: "#F7FAFC",
  backgroundStart: "white",
  backgroundEnd: "white",
  textPrimary: "#1A202C",
  textSecondary: "#718096",
  cardBackground: "#FFFFFF",
  accent: "#38B2AC",
  danger: "#F56565",
  success: "#48BB78",
  warning: "#ECC94B",
  border: "#E2E8F0",
  progressBg: "#EDF2F7",
};

// Reusable Full-Row Tile Component
const FullRowTile = ({ icon, title, count, onPress, color }) => {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[styles.fullRowTile, { transform: [{ scale: scaleAnim }] }]}
      >
        <View
          style={[
            styles.tileContent,
            { borderLeftColor: color, borderLeftWidth: 4 },
          ]}
        >
          <View style={styles.tileIconContainer}>
            <Feather name={icon} size={22} color={color} />
          </View>
          <View style={styles.tileTextContent}>
            <Text style={styles.tileTitle}>{title}</Text>
            {count !== undefined && (
              <Text style={styles.tileCount}>
                {count}{" "}
                <Text style={styles.tileCountLabel}>{t("available")}</Text>
              </Text>
            )}
          </View>
          <Feather
            name="chevron-right"
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const Index = () => {
  const navigation = useNavigation();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Image
          source={require("../../assets/images/farhannetLogo.png")}
          style={{ width: 100, height: 70, marginLeft: 6 }}
          resizeMode="contain"
        />
      ),
      headerTitle: "",
      headerStyle: {
        backgroundColor: colors.backgroundStart,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
    });
    setBackgroundColorAsync("white");
  }, [navigation]);

  useEffect(() => {
    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue:
        (currentPackage.totalDuration - currentPackage.remainingDays) /
        currentPackage.totalDuration,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]); // Removed currentPackage from dependencies

  const progressInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundEnd]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("current-plan")}</Text>
          {currentPackage ? (
            <View style={styles.currentPackage}>
              <View style={styles.packageHeader}>
                <View>
                  <Text style={styles.packageName}>{currentPackage.name}</Text>
                  <Text style={styles.packageStats}>
                    {currentPackage.bandwidth} • {currentPackage.remainingDays}{" "}
                    {t("days-left")}
                  </Text>
                </View>
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Feather name="zap" size={20} color={colors.primary} />
                </View>
              </View>

              <View style={styles.progressContainer}>
                <Animated.View
                  style={[styles.progressBar, { width: progressInterpolate }]}
                />
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Feather
                name="alert-circle"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyStateText}>
                {t("no-active-package")}
              </Text>
            </View>
          )}
        </View>

        {/* Full-Row Tiles for Other Sections */}
        <View style={styles.tilesContainer}>
          <FullRowTile
            icon="package"
            title={t("available-pakages")}
            count={availablePackages.length}
            color={colors.accent}
            onPress={() => router.navigate("screens/Pakages")}
          />
          <FullRowTile
            icon="bell"
            title={t("updates")}
            count={updates.length}
            color={colors.warning}
            onPress={() => router.navigate("screens/Updates")}
          />
          <FullRowTile
            icon="message-circle"
            title={t("feedback")}
            color={colors.primary}
            onPress={() => router.navigate("screens/Feadback")}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    backgroundColor: colors.cardBackground,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  currentPackage: {
    marginBottom: 8,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  packageName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  packageStats: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    height: 6,
    backgroundColor: colors.progressBg,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  renewButton: {
    backgroundColor: colors.success,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  renewButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyStateText: {
    color: colors.textSecondary,
    marginLeft: 8,
    fontSize: 14,
  },
  tilesContainer: {
    marginBottom: 20,
  },
  fullRowTile: {
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: colors.cardBackground,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  tileContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.cardBackground,
  },
  tileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
  tileTextContent: {
    flex: 1,
    marginLeft: 16,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  tileCount: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  tileCountLabel: {
    color: colors.textSecondary,
    fontWeight: "400",
  },
});

export default Index;
