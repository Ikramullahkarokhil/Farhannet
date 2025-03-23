"use client";

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Linking,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLayoutEffect, useState, memo } from "react";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";
import colors from "../../../components/theme";
import apiStore from "../../../components/api/apiStore";

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Memoized Update Card Component without animations
const UpdateCard = memo(({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  // Truncate description if it's too long and not expanded
  const MAX_DESCRIPTION_LENGTH = 100;
  const isLongDescription = item.description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription =
    !expanded && isLongDescription
      ? `${item.description.substring(0, MAX_DESCRIPTION_LENGTH)}...`
      : item.description;

  return (
    <View style={styles.updateCard}>
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

        <Text style={styles.description}>{displayDescription}</Text>

        {isLongDescription && (
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={styles.readMoreButton}
          >
            <Text style={styles.readMoreText}>
              {expanded ? t("read-less") : t("read-more")}
            </Text>
          </TouchableOpacity>
        )}

        {item.link && (
          <Pressable
            style={[styles.linkButton, { backgroundColor: colors.primary }]}
            onPress={() => Linking.openURL(item.link)}
          >
            <Text style={styles.linkText}>{t("learn-more")}</Text>
            <Feather name="external-link" size={16} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
    </View>
  );
});

const Index = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { updates, fetchUpdates } = apiStore();
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t("updates"),
    });
  }, [navigation, t]);

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
        renderItem={({ item }) => <UpdateCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
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
    marginBottom: 10,
  },
  readMoreButton: {
    marginBottom: 15,
  },
  readMoreText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
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
