import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from "react-native-reanimated";

const SpeedTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [ping, setPing] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [currentTest, setCurrentTest] = useState("none");
  const [progress, setProgress] = useState(0);

  // Reanimated shared values
  const progressAnim = useSharedValue(0);
  const glowAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const glowLoopRef = useRef(null);

  useEffect(() => {
    return () => {
      progressAnim.value = 0;
      glowAnim.value = 0;
      if (glowLoopRef.current) {
        glowLoopRef.current(); // Cancel the loop
      }
    };
  }, []);

  const animateButton = () => {
    scaleAnim.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
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

      // Start glow animation loop
      glowAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0, { duration: 800 })
        ),
        -1, // Infinite loop
        true // Reverse
      );
      glowLoopRef.current = () => (glowAnim.value = 0); // Store cancel function

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
      glowAnim.value = 0; // Stop glow
      if (glowLoopRef.current) {
        glowLoopRef.current();
      }
      setTimeout(() => (progressAnim.value = 0), 300);
    }
  };

  const updateProgress = (value) => {
    progressAnim.value = withTiming(value, {
      duration: 500,
      easing: Easing.linear,
    });
  };

  const testDownloadSpeed = () => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        "https://speed.cloudflare.com/__down?bytes=5000000",
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

  // Animated styles
  const progressStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${progressAnim.value * 3.6}deg` }, // 0-100 -> 0-360deg
      { scale: scaleAnim.value },
    ],
    shadowRadius: glowAnim.value * 8, // 0-1 -> 0-8
    shadowOpacity: glowAnim.value,
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.subtitle}>Check your connection speed</Text>
        </View>

        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressCircle, progressStyle]}>
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
                <Animated.View style={[styles.progressBar, progressBarStyle]} />
              </View>
            </View>
          )}
        </View>

        {showResults && (
          <>
            <Text style={styles.resultsTitle}>Test Results</Text>
            <View style={styles.resultsRowContainer}>
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
  resultsRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    width: "31%",
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
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
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
