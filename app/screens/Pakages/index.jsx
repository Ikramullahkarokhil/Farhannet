import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  memo,
} from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";
import apiStore from "../../../components/api/apiStore";
import SkeletonLoader from "../../../components/skeleton/PakagesSkeleton";

// Optimized PackageItem with memoization
const PackageItem = memo(
  ({ packages, index }) => {
    const fadeAnim = useSharedValue(0);
    const scaleAnim = useSharedValue(0.8);
    const { t } = useTranslation();

    useEffect(() => {
      fadeAnim.value = withTiming(1, { duration: 400, delay: index * 100 });
      scaleAnim.value = withSpring(1, { damping: 10, stiffness: 100 });
    }, [fadeAnim, scaleAnim, index]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: fadeAnim.value,
      transform: [{ scale: scaleAnim.value }],
    }));

    const cleanDescription =
      packages.description?.replace(/✅/g, "•").replace(/\r\n/g, " ") || "";

    return (
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>
            {packages.title}
          </Text>
          <Text style={styles.price}>
            {packages.price} <Text style={styles.month}>{t("month")}</Text>
          </Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.detailItem}>
            <Ionicons name="speedometer" size={18} color="#007AFF" />
            <Text style={styles.detailText}>{packages.validity}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="pricetag" size={18} color="#007AFF" />
            <Text style={styles.detailText}>{packages.cat_title}</Text>
          </View>

          <Text style={styles.description} ellipsizeMode="tail">
            {packages.description}
          </Text>
        </View>
      </Animated.View>
    );
  },
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.packages) === JSON.stringify(nextProps.packages)
);

PackageItem.displayName = "PackageItem";

const Index = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { categoryId, catName } = useLocalSearchParams();
  const { packagesData, categories } = apiStore();

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
  }, [navigation, t]);

  const renderItem = useCallback(
    ({ item, index }) => {
      return loading ? (
        <SkeletonLoader />
      ) : (
        <PackageItem packages={item} index={index} />
      );
    },
    [loading]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={loading ? Array(6).fill({}) : data}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          loading ? `skeleton-${index}` : item.id?.toString() || `item-${index}`
        }
        contentContainerStyle={styles.listContent}
        numColumns={1}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        getItemLayout={(data, index) => ({
          length: 200, // Approximate height of an item
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
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  listContent: { paddingVertical: 10, paddingHorizontal: 8, paddingBottom: 20 },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center", padding: 20 },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    margin: 8,
    flex: 1,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    marginBottom: 6,
    lineHeight: 20,
  },
  price: { fontSize: 20, fontWeight: "800", color: "white" },
  month: { fontSize: 12, fontWeight: "500", opacity: 0.9 },

  cardContent: { padding: 12 },
  detailItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  description: { fontSize: 12, color: "#666", lineHeight: 16 },
});

export default Index;
