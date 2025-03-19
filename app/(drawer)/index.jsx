import React, {
  useLayoutEffect,
  useEffect,
  useState,
  useCallback,
  memo,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { availablePackages, updates } from "../../data";
import { useTranslation } from "react-i18next";
import { setBackgroundColorAsync } from "expo-navigation-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import apiStore from "../../components/api/apiStore";
import colors from "../../components/theme";

// Reusable Full-Row Tile Component, memoized for performance
const FullRowTile = memo(
  ({ icon, title, count, onPress, color, index = 0 }) => {
    const { t } = useTranslation();
    const scaleAnim = useSharedValue(1);

    const handlePressIn = useCallback(() => {
      scaleAnim.value = withSpring(0.97);
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      scaleAnim.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, [scaleAnim]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleAnim.value }],
    }));

    return (
      <Animated.View entering={FadeIn.delay(300 + index * 100)}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          activeOpacity={0.9}
        >
          <Animated.View style={[styles.fullRowTile, animatedStyle]}>
            <View
              style={[
                styles.tileContent,
                { borderLeftColor: color, borderLeftWidth: 4 },
              ]}
            >
              <View
                style={[
                  styles.tileIconContainer,
                  { backgroundColor: `${color}15` },
                ]}
              >
                <Feather name={icon} size={22} color={color} />
              </View>
              <View style={styles.tileTextContent}>
                <Text style={styles.tileTitle}>{title}</Text>
                {count !== undefined && (
                  <Text style={styles.tileCount}>
                    <Text style={{ color, fontWeight: "600" }}>{count}</Text>{" "}
                    <Text style={styles.tileCountLabel}>{t("available")}</Text>
                  </Text>
                )}
              </View>
              <View style={styles.chevronContainer}>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={colors.textMuted}
                />
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const Index = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { t } = useTranslation();
  const progressAnim = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const [refreshing, setRefreshing] = useState(false);

  const {
    categories,
    activePackage,
    fetchAllPakages,
    fetchCustomerPackage,
    fetchCustomerComplaints,

    user,
  } = apiStore();

  // Memoized list to avoid recalculating on each render
  const numOfCategories = React.useMemo(
    () => categories.map((item) => item.id),
    [categories]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Animated.View entering={FadeIn.duration(800)}>
          <Image
            source={require("../../assets/images/farhannetLogo.png")}
            style={{ width: 110, height: 70, marginLeft: 6 }}
            resizeMode="contain"
          />
        </Animated.View>
      ),
      headerTitle: "",
      headerStyle: {
        backgroundColor: colors.background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
    });
  }, [navigation]);

  useEffect(() => {
    if (activePackage) {
      const totalDuration = Math.ceil(
        (new Date(activePackage.expiry_date) -
          new Date(activePackage.activation_date)) /
          (1000 * 60 * 60 * 24)
      );
      const remainingDays = Math.ceil(
        (new Date(activePackage.expiry_date) - new Date()) /
          (1000 * 60 * 60 * 24)
      );

      // Reset progress for a smooth animation
      progressAnim.value = 0;
      setTimeout(() => {
        progressAnim.value = withTiming(
          (totalDuration - remainingDays) / totalDuration,
          { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }
        );
      }, 300);
    }
  }, [activePackage, progressAnim]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressAnim.value, [0, 1], [0, 100])}%`,
  }));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    headerOpacity.value = withTiming(0.3, { duration: 300 });

    await fetchCustomerPackage(user.id);
    await fetchAllPakages();
    await fetchCustomerComplaints(user.id);

    headerOpacity.value = withTiming(1, { duration: 300 });
    setRefreshing(false);
  }, [fetchCustomerPackage, fetchAllPakages, headerOpacity, user.id]);

  const daysLeft = activePackage
    ? Math.ceil(
        (new Date(activePackage.expiry_date) - new Date()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;
  const isExpired = activePackage?.status === "Expire";
  // New warning condition: when not expired and exactly 3 days remain
  const isWarning =
    activePackage && activePackage.status !== "Expire" && daysLeft <= 3;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
        {/* Current Package Section without Animation */}
        <View
          style={[
            styles.section,
            isExpired && styles.expiredCard,
            isWarning && styles.warningCard,
          ]}
        >
          <Text style={styles.sectionTitle}>{t("current-plan")}</Text>
          {activePackage ? (
            <View style={styles.currentPackageContainer}>
              <View style={styles.currentPackage}>
                <View style={styles.packageHeader}>
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageName} numberOfLines={2}>
                      {activePackage.package}
                    </Text>
                    <Text
                      style={[
                        styles.packageStats,
                        isExpired && styles.expiredText,
                      ]}
                    >
                      {isExpired
                        ? t("expired")
                        : `${daysLeft} ${t("days-left")}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      progressStyle,
                      isExpired && styles.expiredProgressBar,
                      isWarning && styles.warningProgressBar,
                    ]}
                  />
                </View>

                <Text style={styles.expiryDate}>
                  {t("expires")}: {activePackage.expiry_date}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Feather name="alert-circle" size={24} color={colors.textMuted} />
              <Text style={styles.emptyStateText}>
                {t("no-active-package")}
              </Text>
              <TouchableOpacity
                style={styles.getPackageButton}
                onPress={() => router.navigate("screens/CategoriesList")}
              >
                <Text style={styles.getPackageButtonText}>
                  {t("get-package")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tiles Section */}
        <View style={styles.tilesContainer}>
          <FullRowTile
            icon="package"
            title={t("available-pakages")}
            count={numOfCategories.length}
            color={colors.accent}
            onPress={() => router.navigate("screens/CategoriesList")}
            index={0}
          />
          <FullRowTile
            icon="bell"
            title={t("updates")}
            count={updates.length}
            color={colors.primary}
            onPress={() => router.navigate("screens/Updates")}
            index={1}
          />
          <FullRowTile
            icon="message-circle"
            title={t("feedback")}
            color="#6366F1"
            onPress={() => router.navigate("screens/Feadback")}
            index={2}
          />
          <FullRowTile
            icon="help-circle"
            title={t("support")}
            color={colors.secondary2}
            onPress={() => router.navigate("screens/Contact")}
            index={3}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  section: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    backgroundColor: colors.background,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  currentPackage: {
    marginBottom: 8,
  },
  currentPackageContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  expiredCard: {
    borderWidth: 2,
    borderColor: colors.danger,
    borderStyle: "dashed",
  },
  warningCard: {
    borderWidth: 2,
    borderColor: colors.secondary2,
    borderStyle: "solid",
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  packageInfo: {
    flex: 1,
    marginRight: 10,
  },
  packageName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  packageStats: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  expiredText: {
    color: colors.danger,
    fontWeight: "600",
  },
  progressContainer: {
    height: 8,
    backgroundColor: colors.secondary,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  expiredProgressBar: {
    backgroundColor: colors.danger,
  },
  warningProgressBar: {
    backgroundColor: colors.secondary2,
  },
  expiryDate: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "left",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyStateText: {
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 16,
    fontSize: 15,
    textAlign: "center",
  },
  getPackageButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  getPackageButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  tilesContainer: {
    marginBottom: 20,
  },
  fullRowTile: {
    borderRadius: 16,
    marginBottom: 14,
    backgroundColor: colors.background,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tileContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.background,
  },
  tileIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  tileTextContent: {
    flex: 1,
    marginLeft: 16,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  tileCount: {
    fontSize: 14,
    color: colors.text,
  },
  tileCountLabel: {
    color: colors.textMuted,
    fontWeight: "400",
  },
  chevronContainer: {
    backgroundColor: colors.secondary + "40",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Index;
