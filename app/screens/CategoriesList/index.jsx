import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import apiStore from "../../../components/api/apiStore";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";

import colors from "../../../components/theme";
import { useTranslation } from "react-i18next";

// Mapping of category IDs or titles to icons
const categoryIcons = {
  9: "people",
  1: "desktop",
  default: "grid",
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Index = () => {
  const navigation = useNavigation();
  const { categories } = apiStore();
  const router = useRouter();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: t("pakages") });
  }, [navigation]);

  const renderItem = ({ item, index }) => {
    const iconName = categoryIcons[item.id] || categoryIcons.default;

    return (
      <AnimatedTouchable
        style={[
          styles.itemContainer,
          { marginBottom: index === categories.length - 1 ? 0 : 16 },
        ]}
        entering={FadeInDown.delay(index * 100).springify()}
        onPress={() => {
          router.navigate({
            pathname: "screens/Pakages",
            params: { categoryId: item.id, catName: item.title },
          });
        }}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={iconName} size={32} color={colors.primary} />
          </View>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {/* <Text style={styles.itemSubtitle}>
            {item.id === 9 ? "For individual use" : "For multiple users"}
          </Text> */}
        </View>
      </AnimatedTouchable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Changed from #f5f5f5
  },
  listContainer: {
    marginTop: 16,
  },
  itemContainer: {
    backgroundColor: colors.background, // Changed from #fff
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.text, // Changed from #000
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border, // Added border color
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    backgroundColor: `${colors.primary}20`, // Changed to use primary color with opacity (20% in hex)
    borderRadius: 50,
    padding: 12,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text, // Changed from #333
    marginBottom: 5,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.textMuted, // Changed from #666
    textAlign: "center",
  },
});
