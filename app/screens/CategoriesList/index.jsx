import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native"; // Assuming you're using React Navigation
import apiStore from "../../../components/api/apiStore";
import { Ionicons } from "@expo/vector-icons"; // For icons
import Animated, { FadeInDown } from "react-native-reanimated"; // For animations
import { useRouter } from "expo-router";

// Mapping of category IDs or titles to icons
const categoryIcons = {
  9: "people", // Shared
  1: "desktop", // Dedicated
  // Add more mappings as new categories are added
  default: "grid", // Default icon for unknown categories
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Index = () => {
  const navigation = useNavigation();
  const { categories } = apiStore();
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: "Packages" });
  }, [navigation]);

  const renderItem = ({ item, index }) => {
    // Get the icon for the category, or use the default icon if not found
    const iconName = categoryIcons[item.id] || categoryIcons.default;

    return (
      <AnimatedTouchable
        style={[
          styles.itemContainer,
          { marginBottom: index === categories.length - 1 ? 0 : 16 },
        ]}
        entering={FadeInDown.delay(index * 100).springify()}
        onPress={() => {
          // Navigate to the specific package category screen
          router.navigate({
            pathname: "screens/Pakages",
            params: { categoryId: item.id, catName: item.title },
          });
        }}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={iconName} size={32} color="#007AFF" />
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
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    marginTop: 16,
  },
  itemContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginHorizontal: 16,
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 50,
    padding: 12,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
