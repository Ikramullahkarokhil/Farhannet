import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, { useRef, useEffect, useLayoutEffect } from "react";
import { availablePackages } from "../../../data";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

const PackageItem = ({ packages, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Initial scale value

  useEffect(() => {
    // Animate opacity and scale with a delay based on the index
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, index]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{packages.name}</Text>
        <Text style={styles.price}>
          ${packages.price}
          <Text style={styles.month}>/mo</Text>
        </Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.detailItem}>
          <Ionicons name="speedometer" size={18} color="#007AFF" />
          <Text style={styles.detailText}>{packages.bandwidth}</Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="calendar" size={18} color="#007AFF" />
          <Text style={styles.detailText}>{packages.duration} Days</Text>
        </View>

        <Text style={styles.description}>{packages.description}</Text>
      </View>
    </Animated.View>
  );
};

const index = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Our Packages",
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={availablePackages}
        renderItem={({ item, index }) => (
          <PackageItem packages={item} index={index} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 8,
  },
  listContent: {
    paddingVertical: 16,
    paddingBottom: 50,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    margin: 8,
    flex: 1,
    elevation: 5,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: "white",
  },
  month: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardContent: {
    padding: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  description: {
    fontSize: 12,
    color: "#999",
    marginVertical: 8,
    lineHeight: 18,
  },
});

export default index;
