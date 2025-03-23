import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLayoutEffect, memo, useCallback } from "react";
import apiStore from "../../../components/api/apiStore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import colors from "../../../components/theme";
import { useTranslation } from "react-i18next";

// Mapping of category IDs to icons
const categoryIcons = {
  9: "people",
  1: "desktop",
  default: "grid",
};

const CategoryItem = memo(({ item, index, totalItems, onPress, language }) => {
  const iconName = categoryIcons[item.id] || categoryIcons.default;

  // Memoize title computation to avoid re-calculation unless language or item changes
  const getTitle = useCallback(() => {
    if (language === "pa" && item.title_ps) return item.title_ps;
    if (language === "da" && item.title_dr) return item.title_dr;
    return item.title;
  }, [language, item]);

  return (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        { marginBottom: index === totalItems - 1 ? 0 : 16 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={32} color={colors.primary} />
        </View>
        <Text style={styles.itemTitle}>{getTitle()}</Text>
      </View>
    </TouchableOpacity>
  );
});

const Index = () => {
  const navigation = useNavigation();
  const { categories } = apiStore();
  const router = useRouter();
  const { t, i18n } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: t("pakages") });
  }, [navigation, t]);

  const getTitle = useCallback(
    (item) => {
      const language = i18n.language;
      if (language === "pa" && item.title_ps) return item.title_ps;
      if (language === "da" && item.title_dr) return item.title_dr;
      return item.title;
    },
    [i18n.language]
  );

  // Memoize renderItem so the function is not recreated on every render.
  const renderItem = useCallback(
    ({ item, index }) => {
      // Define onPress callback for each item
      const onPress = () => {
        router.navigate({
          pathname: "screens/Pakages",
          params: { categoryId: item.id, catName: getTitle(item) },
        });
      };

      return (
        <CategoryItem
          item={item}
          index={index}
          totalItems={categories.length}
          onPress={onPress}
          language={i18n.language}
        />
      );
    },
    [categories, i18n.language, router]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
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
  listContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  itemContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    backgroundColor: `${colors.primary}20`,
    borderRadius: 50,
    padding: 12,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 5,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
});
