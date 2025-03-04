import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Easing,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const SpeedTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [ping, setPing] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [currentTest, setCurrentTest] = useState("none");
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowLoopRef = useRef(null);

  useEffect(() => {
    return () => {
      progressAnim.setValue(0);
      glowAnim.setValue(0);
      if (glowLoopRef.current) {
        glowLoopRef.current.stop();
      }
    };
  }, []);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const startTest = async () => {
    try {
      animateButton();
      setIsTesting(true);
      setShowResults(false);
      setDownloadSpeed(0);
      setUploadSpeed(0);
      setPing(0);
      setProgress(0);

      glowLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      );
      glowLoopRef.current.start();

      setCurrentTest("download");
      await testDownloadSpeed();
      setProgress(33);
      updateProgress(33);

      setCurrentTest("upload");
      await testUploadSpeed();
      setProgress(66);
      updateProgress(66);

      setCurrentTest("ping");
      await calculatePing();
      setProgress(100);
      updateProgress(100);

      setCurrentTest("none");
      setShowResults(true);
    } catch (error) {
      console.error("Speed test failed:", error.message);
      alert(`Speed test failed: ${error.message}. Please try again.`);
    } finally {
      setIsTesting(false);
      glowAnim.setValue(0);
      if (glowLoopRef.current) {
        glowLoopRef.current.stop();
      }
      setTimeout(() => progressAnim.setValue(0), 300);
    }
  };

  const updateProgress = (value) => {
    Animated.timing(progressAnim, {
      toValue: value,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const testDownloadSpeed = () => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        "https://speed.cloudflare.com/__down?bytes=10000000",
        true
      );
      xhr.responseType = "blob";

      let startTime;
      xhr.onprogress = (event) => {
        if (event.loaded > 0 && !startTime) {
          startTime = Date.now();
        }
      };

      xhr.onload = () => {
        const endTime = Date.now();
        if (startTime) {
          const timeTaken = (endTime - startTime) / 1000;
          const fileSize = 10; // 10MB file
          const downloadSpeed = (fileSize * 8) / timeTaken;
          setDownloadSpeed(downloadSpeed.toFixed(1));
          resolve();
        } else {
          reject(new Error("Download did not start"));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Download test failed: Network error"));
      };

      xhr.send();
    });
  };

  const testUploadSpeed = () => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://httpbin.org/post", true);
      const data = "a".repeat(5 * 1024 * 1024); // 5MB of 'a' characters

      let startTime;
      xhr.upload.onprogress = (event) => {
        if (event.loaded > 0 && !startTime) {
          startTime = Date.now();
        }
        if (event.loaded === event.total) {
          const endTime = Date.now();
          const timeTaken = (endTime - startTime) / 1000;
          const fileSize = event.total / (1024 * 1024); // Size in MB
          const uploadSpeed = (fileSize * 8) / timeTaken; // Convert to Mbps
          setUploadSpeed(uploadSpeed.toFixed(1));
          resolve();
        }
      };

      xhr.onerror = () => {
        reject(new Error("Upload test failed: Network error"));
      };

      xhr.setRequestHeader("Content-Type", "text/plain");
      xhr.send(data);
    });
  };

  const calculatePing = async () => {
    const pingTimes = [];
    const numTests = 3;
    for (let i = 0; i < numTests; i++) {
      const startTime = Date.now();
      try {
        await fetch("https://speed.cloudflare.com", { method: "HEAD" });
        const endTime = Date.now();
        pingTimes.push(endTime - startTime);
      } catch (error) {
        console.error(`Ping test ${i + 1} failed:`, error.message);
      }
    }
    if (pingTimes.length > 0) {
      const averagePing =
        pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length;
      setPing(Math.round(averagePing));
    } else {
      throw new Error("All ping tests failed");
    }
  };

  const getSpeedQuality = (speed, type) => {
    if (type === "download" || type === "upload") {
      if (speed < 5) return { text: "Slow", color: "#FF3B30" };
      if (speed < 20) return { text: "Moderate", color: "#FF9500" };
      return { text: "Fast", color: "#34C759" };
    } else {
      if (speed > 100) return { text: "High", color: "#FF3B30" };
      if (speed > 50) return { text: "Moderate", color: "#FF9500" };
      return { text: "Low", color: "#34C759" };
    }
  };

  const progressInterpolation = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0deg", "360deg"],
  });

  const progressPercentInterpolation = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const glowInterpolation = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  const downloadQuality = getSpeedQuality(downloadSpeed, "download");
  const uploadQuality = getSpeedQuality(uploadSpeed, "upload");
  const pingQuality = getSpeedQuality(ping, "ping");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          {/* <Text style={styles.title}>Speed Test</Text> */}
          <Text style={styles.subtitle}>Check your connection speed</Text>
        </View>

        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressCircle,
              {
                transform: [
                  { rotate: progressInterpolation },
                  { scale: scaleAnim },
                ],
                shadowRadius: glowInterpolation,
                shadowOpacity: glowAnim,
              },
            ]}
          >
            <TouchableOpacity
              onPress={startTest}
              disabled={isTesting}
              style={styles.innerCircleButton}
              activeOpacity={0.8}
              accessibilityLabel={
                isTesting ? "Testing in progress" : "Start speed test"
              }
            >
              <View style={styles.innerCircle}>
                {isTesting ? (
                  <>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.progressText}>{`${progress}%`}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.speedText}>
                      {showResults ? downloadSpeed : ""}
                    </Text>
                    <Text style={styles.unitText}>
                      {showResults ? "Mbps" : "Start Test"}
                    </Text>
                    {!showResults && (
                      <MaterialIcons name="speed" size={36} color="#007AFF" />
                    )}
                  </>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>

          {isTesting && (
            <View style={styles.testStatusCard}>
              <Text style={styles.testMessage}>
                {currentTest === "download" && "Testing Download Speed..."}
                {currentTest === "upload" && "Testing Upload Speed..."}
                {currentTest === "ping" && "Testing Ping..."}
              </Text>
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    { width: progressPercentInterpolation },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {showResults && (
          <>
            <Text style={styles.resultsTitle}>Test Results</Text>
            <View style={styles.resultsContainer}>
              <View style={styles.resultCard}>
                <View style={styles.resultIconContainer}>
                  <MaterialIcons
                    name="cloud-download"
                    size={24}
                    color="#007AFF"
                  />
                </View>
                <Text style={styles.resultTitle}>Download</Text>
                <Text style={styles.resultValue}>{downloadSpeed} Mbps</Text>
                <View
                  style={[
                    styles.qualityBadge,
                    { backgroundColor: downloadQuality.color },
                  ]}
                >
                  <Text style={styles.qualityText}>{downloadQuality.text}</Text>
                </View>
              </View>

              <View style={styles.resultCard}>
                <View style={styles.resultIconContainer}>
                  <MaterialIcons
                    name="cloud-upload"
                    size={24}
                    color="#007AFF"
                  />
                </View>
                <Text style={styles.resultTitle}>Upload</Text>
                <Text style={styles.resultValue}>{uploadSpeed} Mbps</Text>
                <View
                  style={[
                    styles.qualityBadge,
                    { backgroundColor: uploadQuality.color },
                  ]}
                >
                  <Text style={styles.qualityText}>{uploadQuality.text}</Text>
                </View>
              </View>

              <View style={styles.resultCard}>
                <View style={styles.resultIconContainer}>
                  <MaterialIcons
                    name="network-check"
                    size={24}
                    color="#007AFF"
                  />
                </View>
                <Text style={styles.resultTitle}>Ping</Text>
                <Text style={styles.resultValue}>{ping} ms</Text>
                <View
                  style={[
                    styles.qualityBadge,
                    { backgroundColor: pingQuality.color },
                  ]}
                >
                  <Text style={styles.qualityText}>{pingQuality.text}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.retestButton}
              onPress={startTest}
              activeOpacity={0.8}
              accessibilityLabel="Run speed test again"
            >
              <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retestButtonText}>Run Again</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Speed Test</Text>
          <Text style={styles.infoText}>
            This test measures your connection's download speed, upload speed,
            and ping latency. Results may vary based on network conditions and
            server load.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#6E6E73",
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  progressCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 12,
    borderColor: "#E9ECEF",
    borderLeftColor: "#007AFF",
    borderTopColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    elevation: 5,
  },
  innerCircleButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  speedText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  unitText: {
    fontSize: 18,
    color: "#6E6E73",
    marginTop: 5,
    fontWeight: "500",
  },
  progressText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    marginTop: 10,
  },
  testStatusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 10,
  },
  testMessage: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E9ECEF",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 4,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 15,
    marginTop: 10,
  },
  resultsContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  resultTitle: {
    color: "#6E6E73",
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "500",
  },
  resultValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  qualityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  retestButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  retestButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#6E6E73",
    lineHeight: 20,
  },
});

export default SpeedTest;
