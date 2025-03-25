import { useEffect, useLayoutEffect, useState, memo } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";
import apiStore from "../../../components/api/apiStore";
import colors from "../../../components/theme";

const PackageItem = memo(
  ({ packages }) => {
    const { t, i18n } = useTranslation();

    const getLocalizedPackageName = () => {
      if (i18n.language === "pa" && packages.title_ps) {
        return packages.title_ps;
      } else if (i18n.language === "da" && packages.title_dr) {
        return packages.title_dr;
      } else {
        return packages.title;
      }
    };

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>
            {getLocalizedPackageName()}
          </Text>
          <Text style={styles.price}>
            {packages.price} <Text style={styles.month}></Text>
          </Text>
          <Text style={{ color: colors.background }}>{t("month")}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.detailItem}>
            <Ionicons name="speedometer" size={18} color={colors.accent} />
            <Text style={styles.detailText}>{packages.validity}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="pricetag" size={18} color={colors.accent} />
            <Text style={styles.detailText}>{packages.cat_title}</Text>
          </View>

          <Text style={styles.description} ellipsizeMode="tail">
            {packages.description}
          </Text>
        </View>
      </View>
    );
  },
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.packages) === JSON.stringify(nextProps.packages)
);

PackageItem.displayName = "PackageItem";

const Index = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { categoryId, catName } = useLocalSearchParams();
  const { packagesData } = apiStore();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (packagesData.data) {
      const filteredData = packagesData.data.filter(
        (item) => item.package_categories_id.toString() === categoryId
      );
      setData(filteredData);
    }
    setLoading(false);
  }, [packagesData, categoryId]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: catName });
  }, [navigation, catName]);

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={({ item }) => <PackageItem packages={item} />}
        keyExtractor={(item, index) => item.id?.toString() || `item-${index}`}
        contentContainerStyle={styles.listContent}
        numColumns={1}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={(index) => ({
          length: 200,
          offset: 200 * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>
              {t("no-packages") || "No packages available"}
            </Text>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    paddingBottom: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
    padding: 20,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    margin: 8,
    flex: 1,
    elevation: 4,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.background,
    marginBottom: 6,
    lineHeight: 20,
  },
  price: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.background,
  },
  month: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.9,
  },
  cardContent: {
    padding: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.accent,
    fontWeight: "500",
  },
  description: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
});

export default Index;
