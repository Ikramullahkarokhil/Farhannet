import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Image,
} from "react-native";
import React, { useLayoutEffect, useEffect, useRef, useState } from "react";
import { setBackgroundColorAsync } from "expo-navigation-bar";
import { useNavigation, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { currentPackage, availablePackages, updates } from "../../data";

const colors = {
  primary: "#007AFF",
  backgroundStart: "#E0F2FE",
  backgroundEnd: "#FFFFFF",
  textPrimary: "#000000",
  textSecondary: "#6C757D",
  cardBackground: "rgba(255, 255, 255, 0.8)",
  accent: "#34C759",
};

// Reusable Full-Row Tile Component
const FullRowTile = ({ icon, title, count, onPress, color }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={() =>
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start()
      }
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[styles.fullRowTile, { transform: [{ scale: scaleAnim }] }]}
      >
        <LinearGradient
          colors={["#FFFFFF", "#F8F8F8"]}
          style={[styles.tileGradient, { borderColor: color }]}
        >
          <View style={styles.tileHeader}>
            <Feather name={icon} size={28} color={color} />
            <View style={styles.tileContent}>
              <Text style={styles.tileTitle}>{title}</Text>
              {count !== undefined && (
                <Text style={[styles.tileCount, { color }]}>
                  {count} available
                </Text>
              )}
            </View>
            <Feather
              name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const Index = () => {
  const navigation = useNavigation();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Image
          source={require("../../assets/images/farhannetLogo.png")}
          style={{ width: 150, height: 100 }}
          resizeMode="contain"
        />
      ),
      headerTitle: "",
    });
    setBackgroundColorAsync("transparent");
  }, [navigation]);

  useEffect(() => {
    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue:
        (currentPackage.totalDuration - currentPackage.remainingDays) /
        currentPackage.totalDuration,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, []);

  const progressInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Current Plan Section (Unchanged) */}
      <View style={[styles.section, styles.glassEffect]}>
        <Text style={styles.sectionTitle}>Current Plan</Text>
        {currentPackage ? (
          <View style={styles.currentPackage}>
            <View style={styles.packageHeader}>
              <Text style={styles.packageName}>{currentPackage.name}</Text>
              <Feather name="zap" size={24} color={colors.primary} />
            </View>
            <Text style={styles.packageStats}>
              {currentPackage.bandwidth} • {currentPackage.remainingDays} days
              left
            </Text>
            <View style={styles.progressContainer}>
              <Animated.View
                style={[styles.progressBar, { width: progressInterpolate }]}
              />
            </View>
            {currentPackage.remainingDays < 7 && (
              <TouchableOpacity style={styles.renewButton}>
                <Text style={styles.renewButtonText}>Renew Now</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Feather
              name="alert-circle"
              size={24}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>
              No active package. Choose one below!
            </Text>
          </View>
        )}
      </View>

      {/* Full-Row Tiles for Other Sections */}
      <View style={styles.tilesContainer}>
        <FullRowTile
          icon="package"
          title="Available Packages"
          count={availablePackages.length}
          color="#4ECDC4"
          onPress={() => router.navigate("screens/Pakages")}
        />
        <FullRowTile
          icon="bell"
          title="Updates"
          count={updates.length}
          color="#FF9F43"
          onPress={() => router.navigate("screens/Updates")}
        />
        <FullRowTile
          icon="message-circle"
          title="Feedback"
          color="#6C5CE7"
          onPress={() => router.navigate("screens/Feadback")}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    backgroundColor: "white",
    flex: 1,
  },
  section: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  glassEffect: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 16,
  },
  currentPackage: {
    marginBottom: 8,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  packageName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  packageStats: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  progressContainer: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  renewButton: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  renewButtonText: {
    color: colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
  },
  tilesContainer: {
    marginTop: 8,
  },
  fullRowTile: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },
  tileGradient: {
    padding: 20,
    borderWidth: 2,
    borderRadius: 20,
  },
  tileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  tileContent: {
    flex: 1,
    marginLeft: 16,
  },
  tileTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: colors.textPrimary,
  },
  tileCount: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
  },
});

export default Index;
