import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Alert,
  Linking,
  ScrollView,
  BackHandler,
} from "react-native";
import Modal from "react-native-modal";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import colors from "../theme";

const UpdateModal = ({ visible, onClose, currentVersion, versionData }) => {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const [isDownloading, setIsDownloading] = useState(false);
  const [latestVersionInfo, setLatestVersionInfo] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);

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

  const handleUpdate = async () => {
    if (!latestVersionInfo?.url) {
      console.error("No URL provided for update.");
      return;
    }

    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // For iOS, just open the URL directly
      await Linking.openURL(latestVersionInfo.url);
      onClose();
      return;
    }

    setIsDownloading(true);

    try {
      // For Android, open the URL in browser
      const canOpen = await Linking.canOpenURL(latestVersionInfo.url);

      if (canOpen) {
        await Linking.openURL(latestVersionInfo.url);
        setIsDownloading(false);
        return;
      }
    } catch (error) {
      console.error("Download failed:", error);
      setIsDownloading(false);

      Alert.alert(
        t("Download Error"),
        t(
          "Failed to open download link. Please try again or download manually."
        ),
        [
          { text: t("Try Again"), onPress: () => handleUpdate() },
          {
            text: t("Download in Browser"),
            onPress: () => {
              Linking.openURL(latestVersionInfo.url);
              onClose();
            },
          },
          { text: t("Cancel"), style: "cancel" },
        ]
      );
    }
  };

  const handleClose = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  const formatExpiryDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
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
            <Feather name="download" size={32} color={colors.primary} />
          </View>

          <Text style={styles.title}>
            {isDownloading ? t("Opening Download") : t("Update Available")}
          </Text>

          <View style={styles.divider} />

          {!isDownloading && (
            <Text style={styles.message}>
              {t("A new version of the app is available.")}
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
              <ScrollView
                style={styles.descriptionScroll}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.descriptionText}>
                  {latestVersionInfo.description}
                </Text>
              </ScrollView>
            </View>
          )}

          {isDownloading && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {t("Opening download in your browser...")}
              </Text>
              <View style={styles.loadingIndicator}>
                <Feather name="loader" size={24} color={colors.primary} />
              </View>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsDownloading(false);
                }}
              >
                <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isDownloading && (
            <View style={styles.buttonContainer}>
              {isExpired ? (
                <>
                  {/* Render the alternative button in place of "Later" */}
                  <TouchableOpacity
                    style={[styles.button, styles.buttonAlternative]}
                    onPress={() => BackHandler.exitApp()}
                    accessible={true}
                    accessibilityLabel={t("Close")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonAlternativeText}>
                      {t("Close")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={handleUpdate}
                    accessible={true}
                    accessibilityLabel={t("Update Now")}
                    accessibilityHint={t("Downloads and installs the update")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonPrimaryText}>
                      {t("Update Now")}
                    </Text>
                    <Feather
                      name="external-link"
                      size={16}
                      color="white"
                      style={styles.buttonIcon}
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <>
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

                  <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={handleUpdate}
                    accessible={true}
                    accessibilityLabel={t("Update Now")}
                    accessibilityHint={t("Downloads and installs the update")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonPrimaryText}>
                      {t("Update Now")}
                    </Text>
                    <Feather
                      name="external-link"
                      size={16}
                      color="white"
                      style={styles.buttonIcon}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {expiryDate && (
            <Text style={styles.expiryDate}>
              {t("Current version expires")}: {formatExpiryDate(expiryDate)}
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
    marginTop: 10,
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
  descriptionScroll: {
    maxHeight: 120,
    width: "100%",
  },
  descriptionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    textAlign: "center",
    paddingBottom: 8,
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
    marginBottom: 16,
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  cancelButton: {
    marginTop: 8,
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
  buttonAlternative: {
    borderWidth: 1,
  },
});

export default UpdateModal;
