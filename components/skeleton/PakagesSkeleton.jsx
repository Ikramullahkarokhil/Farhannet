// SkeletonLoader.js
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const SkeletonLoader = () => {
  const shimmerAnim = useSharedValue(0);

  useEffect(() => {
    shimmerAnim.value = withTiming(
      1,
      {
        duration: 1000,
      },
      () => {
        shimmerAnim.value = 0;
      }
    );
  }, [shimmerAnim]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerAnim.value * 200 - 100 }],
  }));

  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonCard}>
        <View style={styles.headerSkeleton}>
          <View style={styles.titleSkeleton} />
          <View style={styles.priceSkeleton} />
        </View>
        <View style={styles.contentSkeleton}>
          <View style={styles.detailSkeleton} />
          <View style={styles.detailSkeleton} />
          <View style={styles.descriptionSkeleton} />
        </View>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
  },
  skeletonCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 8,
    flex: 1,
    minWidth: "45%",
    maxWidth: "45%",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  headerSkeleton: {
    backgroundColor: "#E0E0E0",
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  titleSkeleton: {
    width: "70%",
    height: 20,
    backgroundColor: "#ECECEC",
    borderRadius: 4,
    marginBottom: 6,
  },
  priceSkeleton: {
    width: "40%",
    height: 24,
    backgroundColor: "#ECECEC",
    borderRadius: 4,
  },
  contentSkeleton: {
    padding: 12,
  },
  detailSkeleton: {
    width: "60%",
    height: 18,
    backgroundColor: "#ECECEC",
    borderRadius: 4,
    marginBottom: 8,
  },
  descriptionSkeleton: {
    width: "90%",
    height: 36,
    backgroundColor: "#ECECEC",
    borderRadius: 4,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 100,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});

export default SkeletonLoader;
