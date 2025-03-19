import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
import { updates } from "../../../data";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";
import colors from "../../../components/theme";

const Index = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t("updates"),
    });
  }, [navigation]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderUpdateCard = ({ item }) => {
    const isExpanded = expandedItems[item.id];
    const messageLines = isExpanded ? undefined : 2;

    return (
      <Animated.View style={[styles.updateCard, { opacity: fadeAnim }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="notifications" size={24} color={colors.primary} />
          <Text style={styles.title}>{item.title}</Text>
        </View>
        <Text style={styles.message} numberOfLines={messageLines}>
          {item.message}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={() => toggleExpand(item.id)}
          >
            <Text style={styles.readMoreText}>
              {isExpanded ? t("read-less") : t("read-more")}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={updates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUpdateCard}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    margin: 20,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  updateCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    marginVertical: 8,
    padding: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  readMoreButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.background,
  },
});
