import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Alert,
  BackHandler,
} from "react-native";
import Modal from "react-native-modal";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import * as IntentLauncher from "expo-intent-launcher";
import * as FileSystem from "expo-file-system";
import { Feather } from "@expo/vector-icons";
import colors from "../theme";

const UpdateModal = ({ visible, onClose, currentVersion, versionData }) => {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [latestVersionInfo, setLatestVersionInfo] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [downloadTask, setDownloadTask] = useState(null);
  const [downloadAttempts, setDownloadAttempts] = useState(0);

  useEffect(() => {
    if (versionData && versionData.length > 0) {
      const latestVersion = versionData.reduce((latest, current) =>
        new Date(current.release_date) > new Date(latest.release_date)
          ? current
          : latest
      );
      setLatestVersionInfo(latestVersion);

      const currentVersionInfo = versionData.find(
        (version) => version.version === currentVersion
      );

      if (currentVersionInfo) {
        const expiry = new Date(currentVersionInfo.expiry_date);
        setExpiryDate(expiry);
        if (expiry < new Date()) {
          setIsExpired(true);
        }
      }
    }
  }, [versionData, currentVersion]);

  const downloadProgressCallback = ({
    totalBytesWritten,
    totalBytesExpectedToWrite,
  }) => {
    const progressValue = totalBytesWritten / totalBytesExpectedToWrite;
    setDownloadProgress(progressValue);
  };

  const handleUpdate = async (attempt = 1, maxAttempts = 3) => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log("iOS requires App Store or TestFlight updates.");
      return;
    }

    if (!latestVersionInfo?.url) {
      console.error("No URL provided for update.");
      return;
    }

    setIsDownloading(true);
    setDownloadAttempts((prev) => prev + 1);
    const downloadPath = `${FileSystem.cacheDirectory}update.apk`;

    try {
      // Clean up existing file
      const fileInfo = await FileSystem.getInfoAsync(downloadPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(downloadPath);
        console.log("Cleared old file");
      }

      console.log("Download started at:", new Date().toISOString());

      const downloadResumable = FileSystem.createDownloadResumable(
        latestVersionInfo.url,
        downloadPath,
        {},
        downloadProgressCallback
      );

      setDownloadTask(downloadResumable);
      const downloadResponse = await downloadResumable.downloadAsync();

      if (!downloadResponse) {
        throw new Error("Download failed - no response");
      }

      console.log(
        "Download completed at:",
        new Date().toISOString(),
        "to:",
        downloadResponse.uri
      );

      setIsDownloading(false);
      setDownloadProgress(0);

      // Open the downloaded APK
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: downloadResponse.uri,
        flags: IntentLauncher.FLAG_GRANT_READ_URI_PERMISSION,
        type: "application/vnd.android.package-archive",
      });
    } catch (error) {
      console.error(
        `Download attempt ${attempt} failed at ${new Date().toISOString()}:`,
        error
      );

      setIsDownloading(false);
      setDownloadProgress(0);

      // Retry logic
      if (attempt < maxAttempts) {
        console.log(`Retrying (${attempt + 1}/${maxAttempts})...`);
        return handleUpdate(attempt + 1, maxAttempts);
      }

      Alert.alert(
        t("Download Error"),
        t(
          `Failed after ${attempt} attempts: ${error.message}. Please try again.`
        ),
        [
          { text: t("Try Again"), onPress: () => handleUpdate() },
          { text: t("Cancel"), style: "cancel" },
        ]
      );
    }
  };

  const cancelDownload = async () => {
    if (downloadTask) {
      try {
        await downloadTask.cancelAsync();
        console.log("Download cancelled");
        setIsDownloading(false);
        setDownloadProgress(0);
      } catch (error) {
        console.error("Error cancelling download:", error);
      }
    }
  };

  const handleClose = () => {
    if (isDownloading) {
      cancelDownload();
    }

    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  const formatExpiryDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View>
      <Modal
        isVisible={visible}
        onBackButtonPress={!isDownloading ? handleClose : null}
        backdropOpacity={0.3}
        backdropTransitionOutTiming={0}
        animationIn="fadeInUp"
        animationOut="fadeOutDown"
        animationInTiming={500}
        animationOutTiming={50}
        useNativeDriver={true}
        statusBarTranslucent
        style={styles.modal}
      >
        <View
          style={[
            styles.modalContent,
            { width: windowWidth * 0.85, maxWidth: 400 },
          ]}
        >
          <View style={styles.updateIconContainer}>
            {isDownloading ? (
              <Feather name="download-cloud" size={32} color={colors.primary} />
            ) : (
              <Feather name="download" size={32} color={colors.primary} />
            )}
          </View>

          <Text style={styles.title}>
            {isDownloading ? t("Downloading Update") : t("Update Available")}
          </Text>

          <View style={styles.divider} />

          {!isDownloading && (
            <Text style={styles.message}>
              {t(
                "A new version of the app is available with the latest features and improvements."
              )}
            </Text>
          )}

          {!isDownloading && (
            <View style={styles.versionContainer}>
              <View style={styles.versionItem}>
                <Text style={styles.versionLabel}>{t("Current version")}</Text>
                <Text style={styles.versionValue}>{currentVersion}</Text>
              </View>

              <View style={styles.versionArrow}>
                <Feather name="arrow-right" size={20} color="#999" />
              </View>

              <View style={styles.versionItem}>
                <Text style={styles.versionLabel}>{t("Latest version")}</Text>
                <Text style={[styles.versionValue, styles.latestVersion]}>
                  {latestVersionInfo?.version || "N/A"}
                </Text>
              </View>
            </View>
          )}

          {!isDownloading && latestVersionInfo?.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>{t("What's New")}</Text>
              <Text style={styles.descriptionText} numberOfLines={5}>
                {latestVersionInfo.description}
              </Text>
            </View>
          )}

          {isDownloading && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {`${t("Downloading")}: ${Math.round(downloadProgress * 100)}%`}
              </Text>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${downloadProgress * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressSubtext}>
                {t("Please wait while the update downloads")}
              </Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDownload}
              >
                <Text style={styles.cancelButtonText}>{t("Cancel")}</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isDownloading && (
            <View style={styles.buttonContainer}>
              {isExpired ? (
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={() => BackHandler.exitApp()}
                  accessible={true}
                  accessibilityLabel={t("Close")}
                  accessibilityHint={t("Closes the app as update is mandatory")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonPrimaryText}>{t("Close")}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={handleClose}
                  accessible={true}
                  accessibilityLabel={t("Later")}
                  accessibilityHint={t(
                    "Closes the update modal and postpones the update"
                  )}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonSecondaryText}>{t("Later")}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={() => handleUpdate()}
                accessible={true}
                accessibilityLabel={t("Update Now")}
                accessibilityHint={t("Downloads and installs the update")}
                activeOpacity={0.7}
                disabled={isDownloading}
              >
                <Text style={styles.buttonPrimaryText}>{t("Update Now")}</Text>
                <Feather
                  name="external-link"
                  size={16}
                  color="white"
                  style={styles.buttonIcon}
                />
              </TouchableOpacity>
            </View>
          )}
          {expiryDate && (
            <Text style={styles.expiryDate}>
              {t("Expires")}: {formatExpiryDate(expiryDate)}
            </Text>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 100,
  },
  updateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    width: "100%",
    marginVertical: 12,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
    lineHeight: 22,
  },
  versionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  versionItem: {
    alignItems: "center",
    flex: 1,
  },
  versionArrow: {
    paddingHorizontal: 8,
  },
  versionLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },
  versionValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#444",
  },
  expiryDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  latestVersion: {
    color: colors.primary,
    fontWeight: "bold",
  },
  descriptionContainer: {
    width: "100%",
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 10,
  },
  progressSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  progressBarBackground: {
    width: "100%",
    height: 12,
    backgroundColor: "#eee",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  cancelButton: {
    marginTop: 16,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 12,
    padding: 14,
    minWidth: "45%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonDisabled: {
    backgroundColor: "#999",
    shadowColor: "#999",
  },
  buttonPrimaryText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  buttonSecondaryText: {
    color: "#666",
    fontWeight: "500",
    fontSize: 15,
  },
  buttonIcon: {
    marginLeft: 6,
  },
});

export default UpdateModal;
