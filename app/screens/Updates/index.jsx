import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, { useRef, useEffect, useLayoutEffect } from "react";
import { updates } from "../../../data";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

const Index = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Updates",
    });
  }, [navigation]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const renderUpdateCard = ({ item }) => {
    return (
      <Animated.View style={[styles.updateCard, { opacity: fadeAnim }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="notifications" size={24} color="#007AFF" />
          <Text style={styles.title}>{item.title}</Text>
        </View>
        <Text style={styles.message}>{item.message}</Text>
        <View style={styles.footer}>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
          <TouchableOpacity style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>Read More</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Latest Updates</Text>
      <FlatList
        data={updates}
        keyExtractor={(item, index) => index.toString()}
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
    backgroundColor: "white",
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "black",
    margin: 20,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  updateCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginVertical: 8,
    padding: 16,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "black",
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: "#666",
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
    color: "#888",
    fontWeight: "500",
  },
  readMoreButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
});
