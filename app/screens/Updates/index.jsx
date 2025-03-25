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
import { useLayoutEffect, useState, memo, useMemo } from "react";
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
  const { t, i18n } = useTranslation();

  const isRTL = useMemo(() => {
    return i18n.language === "pa" || i18n.language === "da";
  }, [i18n.language]);

  const getLocalizedUpdateTitle = (update) => {
    if (i18n.language === "pa" && update.title_ps) {
      return update.title_ps;
    } else if (i18n.language === "da" && update.title_dr) {
      return update.title_dr;
    } else {
      return update.title;
    }
  };

  const getLocalizedUpdateDescription = (update) => {
    if (i18n.language === "pa" && update.description_ps) {
      return update.description_ps;
    } else if (i18n.language === "da" && update.description_dr) {
      return update.description_dr;
    } else {
      return update.description;
    }
  };

  const localizedDescription = getLocalizedUpdateDescription(item);

  // Truncate description if it's too long and not expanded
  const MAX_DESCRIPTION_LENGTH = 100;
  const isLongDescription =
    localizedDescription.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription =
    !expanded && isLongDescription
      ? `${localizedDescription.substring(0, MAX_DESCRIPTION_LENGTH)}...`
      : localizedDescription;

  return (
    <View style={[styles.updateCard, isRTL && styles.updateCardRTL]}>
      <View style={[styles.cardContent, isRTL && styles.cardContentRTL]}>
        <View style={[styles.dateContainer, isRTL && styles.dateContainerRTL]}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.primary },
              isRTL && styles.iconContainerRTL,
            ]}
          >
            <Ionicons name="notifications" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>

        <Text style={[styles.title, isRTL && styles.textRTL]}>
          {getLocalizedUpdateTitle(item)}
        </Text>

        <Text style={[styles.description, isRTL && styles.textRTL]}>
          {displayDescription}
        </Text>

        {isLongDescription && (
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={[styles.readMoreButton, isRTL && styles.readMoreButtonRTL]}
          >
            <Text style={[styles.readMoreText, isRTL && styles.textRTL]}>
              {expanded ? t("read-less") : t("read-more")}
            </Text>
          </TouchableOpacity>
        )}

        {item.link && (
          <Pressable
            style={[
              styles.linkButton,
              { backgroundColor: colors.primary },
              isRTL && styles.linkButtonRTL,
            ]}
            onPress={() => Linking.openURL(item.link)}
          >
            <Text style={[styles.linkText, isRTL && styles.textRTL]}>
              {t("learn-more")}
            </Text>
            <Feather
              name="external-link"
              size={16}
              color="#FFFFFF"
              style={isRTL ? { marginRight: 8 } : { marginLeft: 8 }}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
});

const Index = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { updates, fetchUpdates } = apiStore();
  const [refreshing, setRefreshing] = useState(false);

  const isRTL = useMemo(() => {
    return i18n.language === "pa" || i18n.language === "da";
  }, [i18n.language]);

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
        removeClippedSubviews={true}
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
  updateCardRTL: {
    alignItems: "flex-end",
  },
  accentBar: {
    height: 6,
    width: "100%",
  },
  cardContent: {
    padding: 20,
    width: "100%",
  },
  cardContentRTL: {
    alignItems: "flex-end",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  dateContainerRTL: {
    flexDirection: "row-reverse",
    alignSelf: "flex-end",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconContainerRTL: {
    marginRight: 0,
    marginLeft: 12,
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
    width: "100%",
  },
  description: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
    marginBottom: 10,
    width: "100%",
  },
  textRTL: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  readMoreButton: {
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  readMoreButtonRTL: {
    alignSelf: "flex-end",
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
  linkButtonRTL: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 8,
  },
});
