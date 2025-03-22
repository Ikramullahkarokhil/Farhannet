import { useState, useEffect, useLayoutEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../../components/theme";
import { useTranslation } from "react-i18next";
import { useNavigation } from "expo-router";

const SpeedTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [ping, setPing] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [currentTest, setCurrentTest] = useState("none");
  const [progress, setProgress] = useState(0);
  const { t } = useTranslation();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t("speed-test"),
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTitleStyle: {
        color: colors.text,
      },
    });
  }, [navigation, t]);

  const startTest = async () => {
    try {
      setIsTesting(true);
      setShowResults(false);
      setDownloadSpeed(0);
      setUploadSpeed(0);
      setPing(0);
      setProgress(0);

      setCurrentTest(t("download"));
      await testDownloadSpeed();
      setProgress(33);

      setCurrentTest(t("upload"));
      await testUploadSpeed();
      setProgress(66);

      setCurrentTest(t("ping"));
      await calculatePing();
      setProgress(100);

      setCurrentTest("none");
      setShowResults(true);
    } catch (error) {
      console.error("Speed test failed:", error.message);
      alert(`Speed test failed: ${error.message}. Please try again.`);
    } finally {
      setIsTesting(false);
      // Reset progress after a short delay if needed.
      setTimeout(() => setProgress(0), 300);
    }
  };

  const testDownloadSpeed = () => {
    return new Promise((resolve, reject) => {
      // Use a cache buster to avoid caching issues
      const url = `https://speed.cloudflare.com/__down?bytes=5000000&cb=${Date.now()}`;
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "blob";

      let startTime;
      xhr.onprogress = (event) => {
        if (event.loaded > 0 && !startTime) {
          // Use performance.now() if available for more precise timing
          startTime =
            typeof performance !== "undefined" && performance.now
              ? performance.now()
              : Date.now();
        }
      };

      xhr.onload = () => {
        const endTime =
          typeof performance !== "undefined" && performance.now
            ? performance.now()
            : Date.now();
        if (startTime) {
          const timeTaken = (endTime - startTime) / 1000; // seconds
          const fileSizeMB = 5; // Downloading 5,000,000 bytes = 5 MB
          const speed = (fileSizeMB * 8) / timeTaken; // Mbps calculation
          setDownloadSpeed(speed.toFixed(1));
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
          startTime =
            typeof performance !== "undefined" && performance.now
              ? performance.now()
              : Date.now();
        }
        if (event.loaded === event.total) {
          const endTime =
            typeof performance !== "undefined" && performance.now
              ? performance.now()
              : Date.now();
          const timeTaken = (endTime - startTime) / 1000; // seconds
          const fileSizeMB = event.total / (1024 * 1024); // in MB
          const speed = (fileSizeMB * 8) / timeTaken; // Mbps
          setUploadSpeed(speed.toFixed(1));
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
    const numTests = 5; // Increased number of tests for a more stable average
    for (let i = 0; i < numTests; i++) {
      try {
        const startTime = Date.now();
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            {t("check-your-connection-speed")}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressCircle}>
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
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.progressText}>{`${progress}%`}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.speedText}>
                      {showResults ? downloadSpeed : ""}
                    </Text>
                    <Text style={styles.unitText}>
                      {showResults ? t("mbps") : t("start-test")}
                    </Text>
                    {!showResults && (
                      <MaterialIcons
                        name="speed"
                        size={36}
                        color={colors.primary}
                      />
                    )}
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {isTesting && (
            <View style={styles.testStatusCard}>
              <Text style={styles.testMessage}>
                {currentTest === "download" && t("testing-download-speed")}
                {currentTest === "upload" && t("testing-upload-speed")}
                {currentTest === "ping" && t("testing-ping")}
              </Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
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
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.resultTitle}>{t("download")}</Text>
                <Text style={styles.resultValue}>
                  {downloadSpeed} {t("mbps")}
                </Text>
              </View>

              <View style={styles.resultCard}>
                <View style={styles.resultIconContainer}>
                  <MaterialIcons
                    name="cloud-upload"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.resultTitle}>{t("upload")}</Text>
                <Text style={styles.resultValue}>
                  {uploadSpeed} {t("upload")}
                </Text>
              </View>

              <View style={styles.resultCard}>
                <View style={styles.resultIconContainer}>
                  <MaterialIcons
                    name="network-check"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.resultTitle}>{t("ping")}</Text>
                <Text style={styles.resultValue}>
                  {ping} {t("ms")}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.retestButton}
              onPress={startTest}
              activeOpacity={0.8}
              accessibilityLabel="Run speed test again"
            >
              <MaterialIcons
                name="refresh"
                size={20}
                color={colors.background}
              />
              <Text style={styles.retestButtonText}>{t("run-agian")}</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t("about-speed-test")}</Text>
          <Text style={styles.infoText}>
            {t(
              "This test measures your connections download speed, upload speed, and ping latency. Results may vary based on network conditions and server load."
            )}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.textMuted,
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
    borderColor: colors.border,
    borderLeftColor: colors.primary,
    borderTopColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    shadowColor: colors.primary,
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
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  speedText: {
    fontSize: 42,
    fontWeight: "bold",
    color: colors.text,
  },
  unitText: {
    fontSize: 18,
    color: colors.textMuted,
    marginTop: 5,
    fontWeight: "500",
  },
  progressText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 10,
  },
  testStatusCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    width: "100%",
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 10,
  },
  testMessage: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
    textAlign: "center",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 15,
    marginTop: 10,
  },
  resultsRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  resultCard: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    width: "31%",
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${colors.primary}19`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  resultTitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "500",
  },
  resultValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  retestButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  retestButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
});

export default SpeedTest;
