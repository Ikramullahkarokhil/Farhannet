import React, {
  useLayoutEffect,
  useEffect,
  useState,
  useCallback,
  memo,
  useMemo,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { Feather, FontAwesome6 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import apiStore from "../../components/api/apiStore";
import colors from "../../components/theme";
import NetInfo from "@react-native-community/netinfo";
import { Dialog, Portal, Button } from "react-native-paper";

// Simplified Tile Component without animations
const FullRowTile = memo(({ icon, title, count, onPress, color }) => {
  const { t, i18n } = useTranslation();
  const isRTL = useMemo(() => {
    return i18n.language === "pa" || i18n.language === "da";
  }, [i18n.language]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.fullRowTile}>
        <View
          style={[
            styles.tileContent,
            isRTL
              ? {
                  borderRightColor: color,
                  borderRightWidth: 4,
                  borderLeftWidth: 0,
                  flexDirection: "row-reverse",
                }
              : { borderLeftColor: color, borderLeftWidth: 4 },
          ]}
        >
          <View
            style={[
              styles.tileIconContainer,
              { backgroundColor: `${color}15` },
            ]}
          >
            <Feather name={icon} size={22} color={color} />
          </View>
          <View
            style={[
              styles.tileTextContent,
              isRTL ? { marginRight: 16, marginLeft: 0 } : { marginLeft: 16 },
            ]}
          >
            <Text style={[styles.tileTitle, isRTL && styles.rtlText]}>
              {title}
            </Text>
            {count !== undefined && (
              <Text style={[styles.tileCount, isRTL && styles.rtlText]}>
                <Text style={{ color, fontWeight: "600" }}>{count}</Text>{" "}
                <Text style={styles.tileCountLabel}>{t("available")}</Text>
              </Text>
            )}
          </View>
          <View style={styles.chevronContainer}>
            <Feather
              name={isRTL ? "chevron-left" : "chevron-right"}
              size={20}
              color={colors.textMuted}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const Index = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [progressValue, setProgressValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);

  const {
    categories,
    activePackage,
    fetchCustomerPackage,
    fetchCustomerComplaints,
    fetchUpdates,
    fetchAllPakages,
    updates,
    user,
  } = apiStore();

  // Get text direction based on language
  const isRTL = useMemo(() => {
    return i18n.language === "pa" || i18n.language === "da";
  }, [i18n.language]);

  const formatDateWithShortMonth = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Image
          source={require("../../assets/images/farhannetLogo.png")}
          style={{
            width: 110,
            height: 70,
            marginLeft: isRTL ? 0 : 6,
            marginRight: isRTL ? 6 : 0,
          }}
          resizeMode="contain"
        />
      ),
      headerTitle: "",
      headerStyle: {
        backgroundColor: colors.background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
    });
  }, [navigation, isRTL]);

  const numOfCategories = React.useMemo(
    () => categories.map((item) => item.id),
    [categories]
  );

  // Calculate progress value without animations
  useEffect(() => {
    if (activePackage) {
      const totalDuration = Math.ceil(
        (new Date(activePackage.expiry_date) -
          new Date(activePackage.activation_date)) /
          (1000 * 60 * 60 * 24)
      );
      const remainingDays = Math.ceil(
        (new Date(activePackage.expiry_date) - new Date()) /
          (1000 * 60 * 60 * 24)
      );

      setProgressValue(((totalDuration - remainingDays) / totalDuration) * 100);
    }
  }, [activePackage]);

  const onRefresh = useCallback(async () => {
    const netState = await NetInfo.fetch();
    setRefreshing(true);

    if (netState.isConnected) {
      await fetchAllPakages();
      if (user) {
        await Promise.all([
          fetchCustomerPackage(user.id),
          fetchCustomerComplaints(user.id),
          fetchUpdates(),
        ]);
      }
    }

    setRefreshing(false);
  }, [
    user,
    fetchCustomerPackage,
    fetchCustomerComplaints,
    fetchUpdates,
    fetchAllPakages,
  ]);

  const daysLeft = activePackage
    ? Math.ceil(
        (new Date(activePackage.expiry_date) - new Date()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;
  const isExpired = activePackage?.status === "Expire";
  const isWarning =
    activePackage && activePackage.status !== "Expire" && daysLeft <= 7;

  const getTitle = useCallback(
    (category) => {
      const lang = i18n.language;
      console.log(category);

      if (lang === "pa" && category.title_ps) return category.title_ps;
      if (lang === "da" && category.title_dr) return category.title_dr;
      return category.title;
    },
    [i18n.language]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Render current package section */}
        <View
          style={[
            styles.section,
            {
              borderColor: isExpired
                ? colors.danger
                : isWarning
                ? colors.secondary2
                : "transparent",
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {t("current-plan")}
          </Text>
          {user ? (
            activePackage ? (
              <View style={styles.currentPackageContainer}>
                <View style={styles.currentPackage}>
                  <View
                    style={[styles.packageHeader, isRTL && styles.rtlFlexRow]}
                  >
                    <View
                      style={[
                        styles.packageInfo,
                        isRTL
                          ? { marginLeft: 10, marginRight: 0 }
                          : { marginRight: 10 },
                      ]}
                    >
                      <Text
                        style={[styles.packageName, isRTL && styles.rtlText]}
                        numberOfLines={2}
                      >
                        {activePackage.package}
                      </Text>
                      <Text
                        style={[
                          styles.packageStats,
                          isRTL && styles.rtlText,
                          isExpired && styles.expiredText,
                        ]}
                      >
                        {isExpired
                          ? t("expired")
                          : daysLeft === 0
                          ? t("last-day")
                          : `${daysLeft} ${t("days-left")}`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${progressValue}%` },
                        isExpired && styles.expiredProgressBar,
                        isWarning && styles.warningProgressBar,
                        isRTL && styles.rtlProgressBar,
                      ]}
                    />
                  </View>

                  <Text style={[styles.expiryDate, isRTL && styles.rtlText]}>
                    {isExpired
                      ? `${t("expired")}: ${formatDateWithShortMonth(
                          activePackage.expiry_date
                        )}`
                      : `${t("expires")}: ${formatDateWithShortMonth(
                          activePackage.expiry_date
                        )}`}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Feather
                  name="alert-circle"
                  size={24}
                  color={colors.textMuted}
                />
                <Text style={[styles.emptyStateText, isRTL && styles.rtlText]}>
                  {t("no-active-package")}
                </Text>
                <TouchableOpacity
                  style={styles.getPackageButton}
                  onPress={() => router.navigate("screens/CategoriesList")}
                >
                  <Text
                    style={[
                      styles.getPackageButtonText,
                      isRTL && styles.rtlText,
                    ]}
                  >
                    {t("get-package")}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <View style={styles.loginPromptContainer}>
              <FontAwesome6
                name="user-large-slash"
                size={24}
                color={colors.textMuted}
              />
              <Text style={[styles.loginPromptText, isRTL && styles.rtlText]}>
                {t("please-login-to-show-your-package")}
              </Text>
            </View>
          )}
        </View>

        {/* Tiles Section */}
        <View style={styles.tilesContainer}>
          <FullRowTile
            icon="package"
            title={t("available-pakages")}
            count={numOfCategories.length}
            color={colors.accent}
            onPress={() => {
              if (numOfCategories.length === 1) {
                const category = categories[0];
                router.navigate({
                  pathname: "screens/Pakages",
                  params: {
                    categoryId: category.id,
                    catName: getTitle(category),
                  },
                });
              } else {
                router.navigate("screens/CategoriesList");
              }
            }}
          />
          <FullRowTile
            icon="bell"
            title={t("updates")}
            count={updates.total}
            color={colors.primary}
            onPress={() => {
              if (!user) {
                setVisible(true);
              } else {
                router.navigate("screens/Updates");
              }
            }}
          />
          <FullRowTile
            icon="message-circle"
            title={t("feedback")}
            color="#6366F1"
            onPress={() => {
              if (!user) {
                setVisible(true);
              } else {
                router.navigate("screens/Feadback");
              }
            }}
          />
          <FullRowTile
            icon="help-circle"
            title={t("support")}
            color={colors.secondary2}
            onPress={() => router.navigate("screens/Contact")}
          />
        </View>
      </ScrollView>

      {/* Dialog for showing login alert */}
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title style={isRTL && styles.rtlText}>
            {t("login-required")}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={isRTL && styles.rtlText}>
              {t("please-login-to-access-this-feature")}
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={isRTL && styles.rtlFlexRow}>
            <Button onPress={() => setVisible(false)}>
              <Text style={isRTL && styles.rtlText}>{t("cancel")}</Text>
            </Button>
            <Button
              onPress={() => {
                router.navigate("/Login");
                setVisible(false);
              }}
            >
              <Text style={isRTL && styles.rtlText}>{t("login")}</Text>
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  rtlFlexRow: {
    flexDirection: "row-reverse",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  rtlProgressBar: {
    right: 0,
    left: "auto",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  section: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    backgroundColor: colors.background,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  currentPackage: {
    marginBottom: 8,
  },
  currentPackageContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  expiredCard: {
    borderWidth: 2,
    borderColor: colors.danger,
    borderStyle: "dashed",
  },
  warningCard: {
    borderWidth: 2,
    borderColor: colors.secondary2,
    borderStyle: "solid",
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  packageInfo: {
    flex: 1,
    marginRight: 10,
  },
  packageName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  packageStats: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  expiredText: {
    color: colors.danger,
    fontWeight: "600",
  },
  progressContainer: {
    height: 8,
    backgroundColor: colors.secondary,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
    position: "absolute",
    left: 0,
  },
  expiredProgressBar: {
    backgroundColor: colors.danger,
  },
  warningProgressBar: {
    backgroundColor: colors.secondary2,
  },
  expiryDate: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "left",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyStateText: {
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 16,
    fontSize: 15,
    textAlign: "center",
  },
  getPackageButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  getPackageButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  tilesContainer: {
    marginBottom: 20,
  },
  fullRowTile: {
    borderRadius: 16,
    marginBottom: 14,
    backgroundColor: colors.background,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tileContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.background,
  },
  tileIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  tileTextContent: {
    flex: 1,
    marginLeft: 16,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  tileCount: {
    fontSize: 14,
    color: colors.text,
  },
  tileCountLabel: {
    color: colors.textMuted,
    fontWeight: "400",
  },
  chevronContainer: {
    backgroundColor: colors.secondary + "40",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    minHeight: 150,
  },
  placeholderText: {
    color: colors.textMuted,
    marginTop: 12,
    fontSize: 14,
  },
  noUserContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noUserText: {
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
  },
  loginPromptContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loginPromptText: {
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 16,
    fontSize: 15,
    textAlign: "center",
  },
});

export default Index;
