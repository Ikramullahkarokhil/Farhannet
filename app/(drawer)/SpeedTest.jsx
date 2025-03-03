import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";

const SpeedTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [ping, setPing] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => progressAnim.setValue(0); // Cleanup on unmount
  }, []);

  const startTest = async () => {
    try {
      setIsTesting(true);
      setDownloadSpeed(0);
      setUploadSpeed(0);
      setPing(0);

      await testDownloadSpeed();
      updateProgress(33);
      await testUploadSpeed();
      updateProgress(66);
      await calculatePing();
      updateProgress(100);
    } catch (error) {
      console.error("Speed test failed:", error);
      alert("Speed test failed. Please try again.");
    } finally {
      setIsTesting(false);
      setTimeout(() => progressAnim.setValue(0), 300); // Reset animation
    }
  };

  const updateProgress = (value) => {
    Animated.timing(progressAnim, {
      toValue: value,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const testDownloadSpeed = async () => {
    const url = "http://speedtest.ftp.otenet.gr/files/test100Mb.db";
    const startTime = Date.now();
    try {
      const response = await fetch(url);
      const endTime = Date.now();
      const fileSize = response.headers.get("content-length"); // Bytes
      if (!fileSize) throw new Error("File size not available");
      const timeInSeconds = (endTime - startTime) / 1000;
      const speed = (fileSize * 8) / timeInSeconds / 1000000; // Mbps
      setDownloadSpeed(speed);
    } catch (error) {
      console.error("Download speed test failed:", error);
      setDownloadSpeed(0);
    }
  };

  const testUploadSpeed = async () => {
    const url = "https://webhook.site/2fc3d710-0655-4b46-80e8-57193597d480"; // Replace with your Webhook.site URL
    const fileSize = 1000000; // 1MB
    const dummyData = new ArrayBuffer(fileSize); // Create a dummy file
    const startTime = Date.now();
    try {
      await fetch(url, {
        method: "POST",
        body: dummyData,
        headers: { "Content-Type": "application/octet-stream" },
      });
      const endTime = Date.now();
      const timeInSeconds = (endTime - startTime) / 1000;
      const speed = (fileSize * 8) / timeInSeconds / 1000000; // Mbps
      setUploadSpeed(speed);
    } catch (error) {
      console.error("Upload speed test failed:", error);
      setUploadSpeed(0);
    }
  };

  const calculatePing = async () => {
    const url = "https://www.google.com/favicon.ico";
    const startTime = Date.now();
    try {
      await fetch(url);
      const endTime = Date.now();
      setPing(endTime - startTime); // Milliseconds
    } catch (error) {
      console.error("Ping test failed:", error);
      setPing(0);
    }
  };

  const progressInterpolation = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Speed Test</Text>
        <MaterialIcons name="speed" size={28} color="#007AFF" />
      </View>

      <Animated.View
        style={[
          styles.progressCircle,
          { transform: [{ rotate: progressInterpolation }] },
        ]}
      >
        <View style={styles.innerCircle}>
          <Text style={styles.speedText}>
            {isTesting ? "Testing..." : downloadSpeed.toFixed(1)}
          </Text>
          <Text style={styles.unitText}>{isTesting ? "" : "Mbps"}</Text>
        </View>
      </Animated.View>

      {!isTesting && (
        <TouchableOpacity
          style={[styles.startButton, isTesting && styles.startButtonDisabled]}
          onPress={startTest}
          disabled={isTesting}
        >
          <Text style={styles.buttonText}>Start Test</Text>
        </TouchableOpacity>
      )}

      {isTesting && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Testing your internet speed...</Text>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      <View style={styles.resultsContainer}>
        <View style={styles.resultCard}>
          <MaterialIcons name="cloud-download" size={24} color="#007AFF" />
          <Text style={styles.resultTitle}>Download</Text>
          <Text style={styles.resultValue}>
            {downloadSpeed.toFixed(1)} Mbps
          </Text>
        </View>
        <View style={styles.resultCard}>
          <MaterialIcons name="cloud-upload" size={24} color="#007AFF" />
          <Text style={styles.resultTitle}>Upload</Text>
          <Text style={styles.resultValue}>{uploadSpeed.toFixed(1)} Mbps</Text>
        </View>
        <View style={styles.resultCard}>
          <MaterialIcons name="network-check" size={24} color="#007AFF" />
          <Text style={styles.resultTitle}>Ping</Text>
          <Text style={styles.resultValue}>{ping} ms</Text>
        </View>
      </View>
    </View>
  );
};

export default SpeedTest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fd",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2d3436",
  },
  progressCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 10,
    borderColor: "#e0e0e0",
    borderLeftColor: "#007AFF",
    borderTopColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 30,
  },
  innerCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  speedText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2d3436",
  },
  unitText: {
    fontSize: 16,
    color: "#636e72",
    marginTop: -5,
  },
  startButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: "center",
    marginVertical: 20,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  startButtonDisabled: {
    backgroundColor: "#b0a9f5",
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  resultsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  resultCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    width: "30%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultTitle: {
    color: "#636e72",
    fontSize: 12,
    marginVertical: 5,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  loadingText: {
    color: "#636e72",
    marginBottom: 10,
  },
});
