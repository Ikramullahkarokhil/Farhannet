import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Linking,
  RefreshControl,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";
import colors from "../../../components/theme"; // Import your colors
import apiStore from "../../../components/api/apiStore";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Animated Card Component
const AnimatedUpdateCard = ({ item, index }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(25);
  const scale = useSharedValue(0.97);

  useEffect(() => {
    const animationDelay = index * 120;

    opacity.value = withDelay(
      animationDelay,
      withTiming(1, { duration: 450, easing: Easing.ease })
    );
    translateY.value = withDelay(
      animationDelay,
      withTiming(0, { duration: 450, easing: Easing.ease })
    );
    scale.value = withDelay(
      animationDelay,
      withTiming(1, { duration: 450, easing: Easing.ease })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.updateCard, animatedStyle]}>
      <View style={styles.cardContent}>
        <View style={styles.dateContainer}>
          <View
            style={[styles.iconContainer, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="notifications" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.description}>{item.description}</Text>

        {item.link && (
          <Pressable
            style={[styles.linkButton, { backgroundColor: colors.primary }]}
            onPress={() => Linking.openURL(item.link)}
          >
            <Text style={styles.linkText}>Learn More</Text>
            <Feather name="external-link" size={16} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

const Index = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { updates, fetchUpdates } = apiStore();
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t("updates"),
    });
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUpdates();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={updates.data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <AnimatedUpdateCard item={item} index={index} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]} // Customize the refresh control colors
            tintColor={colors.primary} // Customize the refresh control spinner color
          />
        }
      />
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 16,
  },
  updateCard: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: colors.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  accentBar: {
    height: 6,
    width: "100%",
  },
  cardContent: {
    padding: 20,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  date: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
    lineHeight: 28,
  },
  description: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
    marginBottom: 20,
  },
  linkButton: {
    alignSelf: "flex-start",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 8,
  },
});
