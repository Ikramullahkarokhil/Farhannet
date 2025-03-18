import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
} from "react-native";
import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { updates } from "../../data";
import { useTranslation } from "react-i18next";
import { setBackgroundColorAsync } from "expo-navigation-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import apiStore from "../../components/api/apiStore";
import { color } from "@rneui/base";
import colors from "../../components/theme";

// Reusable Full-Row Tile Component
const FullRowTile = ({ icon, title, count, onPress, color }) => {
  const { t } = useTranslation();
  const scaleAnim = useSharedValue(1);

  const handlePressIn = () => {
    scaleAnim.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1, { damping: 5, stiffness: 40 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
    };
  });

  return (
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
  const progressAnim = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const { categories, activePackage } = apiStore();

  const numOfCategories = categories.map((item) => item.id);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Image
          source={require("../../assets/images/farhannetLogo.png")}
          style={{ width: 110, height: 70, marginLeft: 6 }}
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
      progressAnim.value = withTiming(
        (totalDuration - remainingDays) / totalDuration,
        { duration: 1200 }
      );
    }
  }, [activePackage]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${interpolate(progressAnim.value, [0, 1], [0, 100])}%`,
    };
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
        <View
          style={[
            styles.section,
            activePackage.status === "Expire" && styles.expiredCard,
          ]}
        >
          <Text style={styles.sectionTitle}>{t("current-plan")}</Text>
          {activePackage ? (
            <View style={[styles.currentPackageContainer]}>
              <View style={styles.currentPackage}>
                <View style={styles.packageHeader}>
                  <View>
                    <Text style={styles.packageName} numberOfLines={2}>
                      {activePackage.package}
                    </Text>
                    <Text
                      style={[
                        styles.packageStats,
                        activePackage.status === "Expire" && {
                          color: color.danger,
                        },
                      ]}
                    >
                      {activePackage.status === "Expire"
                        ? t("expired")
                        : `${Math.ceil(
                            (new Date(activePackage.expiry_date) - new Date()) /
                              (1000 * 60 * 60 * 24)
                          )} ${t("days-left")}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      progressStyle,
                      activePackage.status === "Expire" && {
                        backgroundColor: colors.danger,
                      },
                    ]}
                  />
                </View>
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
            count={numOfCategories.length}
            color={colors.accent}
            onPress={() => router.navigate("screens/CategoriesList")}
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
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  currentPackage: {
    marginBottom: 8,
  },
  currentPackageContainer: {
    borderRadius: 16, // Match the card's border radius
    overflow: "hidden", // Ensure the border radius is applied correctly
  },
  expiredCard: {
    borderWidth: 2, // Add a border width
    borderColor: colors.danger, // Red border color
  },
  expiredPackage: {
    borderLeftColor: colors.danger, // Red border for expired package
    borderLeftWidth: 4,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  packageName: {
    color: colors.textPrimary,
    fontSize: 18,
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
