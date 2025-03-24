import { useLayoutEffect, useMemo, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";
import colors from "../../../components/theme";
import apiStore from "../../../components/api/apiStore";
import NetInfo from "@react-native-community/netinfo";

const { width } = Dimensions.get("window");
const cardWidth = width * 0.9;

const AboutScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { fetchFrequantlyQuestions } = apiStore();

  // Check if language is RTL (Pashto or Dari)
  const isRTL = useMemo(() => {
    return i18n.language === "pa" || i18n.language === "da";
  }, [i18n.language]);

  // Features data
  const features = [
    {
      icon: "speed",
      title: t("Ultra-Fast Internet Speeds"),
      description: t(
        "Experience lightning-fast connectivity with our premium fiber optic network."
      ),
    },
    {
      icon: "security",
      title: t("Advanced Network Security"),
      description: t(
        "Your data is protected with enterprise-grade security protocols and real-time monitoring."
      ),
    },
    {
      icon: "support-agent",
      title: t("24/7 Expert Support"),
      description: t(
        "Our dedicated team is always available to assist you with any technical issues."
      ),
    },
    {
      icon: "wifi",
      title: t("Reliable Connectivity"),
      description: t(
        "Enjoy 99.9% uptime guarantee with our redundant network infrastructure."
      ),
    },
  ];

  // Fetch FAQs from API
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetchFrequantlyQuestions();
      setFaqs(response);
      setCurrentPage(response.current_page);
      setTotalPages(response.last_page);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setLoading(false);
    }
  };

  // Load FAQs on component mount
  useEffect(() => {
    const getData = async () => {
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        fetchFAQs();
      }
    };
    getData();
  }, []);

  // Load next page of FAQs
  const loadMoreFAQs = () => {
    if (currentPage < totalPages && !loading) {
      fetchFAQs(currentPage + 1);
    }
  };

  // Get FAQ question and answer based on current language
  const getLocalizedFAQ = (faq) => {
    if (i18n.language === "pa" && faq.question_ps && faq.answer_ps) {
      return {
        question: faq.question_ps,
        answer: faq.answer_ps,
      };
    } else if (i18n.language === "da" && faq.question_dr && faq.answer_dr) {
      return {
        question: faq.question_dr,
        answer: faq.answer_dr,
      };
    } else {
      return {
        question: faq.question_en,
        answer: faq.answer_en,
      };
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t("about-us"),
      headerStyle: {
        backgroundColor: colors.background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        fontWeight: "600",
        fontSize: 18,
        color: colors.text,
        textAlign: isRTL ? "right" : "left",
      },
    });
  }, [navigation, t, isRTL]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/images/farhannetLogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={[styles.title, isRTL && styles.rtlText]}>
              {t("Welcome to Farhanict")}
            </Text>
            <View style={styles.titleUnderline} />
            <Text style={[styles.description, isRTL && styles.rtlText]}>
              {t(
                "At Farhanict, we are dedicated to delivering high-speed, reliable, and secure internet services to our customers. Our mission is to empower communities with cutting-edge technology and exceptional customer support."
              )}
            </Text>
          </View>

          <View style={styles.featuresSection}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
              {t("Why Choose Farhanict?")}
            </Text>

            {features.map((feature, index) => (
              <View key={index} style={styles.featureCardContainer}>
                <View style={styles.featureCard}>
                  {isRTL ? (
                    // RTL layout - icon on right
                    <>
                      <View style={styles.featureContent}>
                        <Text style={[styles.featureTitle, styles.rtlText]}>
                          {feature.title}
                        </Text>
                        <Text
                          style={[styles.featureDescription, styles.rtlText]}
                        >
                          {feature.description}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor: `${colors.primary}19`,
                            marginLeft: 16,
                            marginRight: 0,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name={feature.icon}
                          size={28}
                          color={colors.primary}
                        />
                      </View>
                    </>
                  ) : (
                    // LTR layout - icon on left
                    <>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: `${colors.primary}19` },
                        ]}
                      >
                        <MaterialIcons
                          name={feature.icon}
                          size={28}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        <Text style={styles.featureDescription}>
                          {feature.description}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.valuesSection}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
              {t("our-values")}
            </Text>
            <View style={styles.valuesContainer}>
              <View style={styles.valueItem}>
                <MaterialIcons
                  name="thumb-up"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.valueText, isRTL && styles.rtlText]}>
                  {t("Quality Service")}
                </Text>
              </View>
              <View style={styles.valueItem}>
                <MaterialIcons
                  name="lightbulb"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.valueText, isRTL && styles.rtlText]}>
                  {t("Innovation")}
                </Text>
              </View>
              <View style={styles.valueItem}>
                <MaterialIcons name="people" size={24} color={colors.primary} />
                <Text style={[styles.valueText, isRTL && styles.rtlText]}>
                  {t("community")}
                </Text>
              </View>
              <View style={styles.valueItem}>
                <MaterialIcons
                  name="verified-user"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.valueText, isRTL && styles.rtlText]}>
                  {t("integrity")}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.contactSection}>
            <Text style={[styles.contactText, isRTL && styles.rtlText]}>
              {t("Have questions or need assistance with your service?")}
            </Text>
            <Link href={{ pathname: "/screens/Contact" }} asChild>
              <TouchableOpacity
                style={styles.contactButton}
                activeOpacity={0.8}
              >
                {isRTL ? (
                  <>
                    <MaterialIcons
                      name="arrow-back"
                      size={20}
                      color={colors.background}
                    />
                    <Text
                      style={[
                        styles.buttonText,
                        { marginLeft: 8, marginRight: 0 },
                      ]}
                    >
                      {t("Get in Touch")}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.buttonText}>{t("Get in Touch")}</Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={20}
                      color={colors.background}
                    />
                  </>
                )}
              </TouchableOpacity>
            </Link>
          </View>

          {/* Company Stats Section */}
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
              {t("Company Stats")}
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, isRTL && styles.rtlText]}>
                  5+
                </Text>
                <Text style={[styles.statLabel, isRTL && styles.rtlText]}>
                  {t("Years of Service")}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, isRTL && styles.rtlText]}>
                  1000+
                </Text>
                <Text style={[styles.statLabel, isRTL && styles.rtlText]}>
                  {t("Happy Customers")}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, isRTL && styles.rtlText]}>
                  99.9%
                </Text>
                <Text style={[styles.statLabel, isRTL && styles.rtlText]}>
                  {t("Uptime")}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, isRTL && styles.rtlText]}>
                  24/7
                </Text>
                <Text style={[styles.statLabel, isRTL && styles.rtlText]}>
                  {t("support")}
                </Text>
              </View>
            </View>
          </View>

          {/* Dynamic FAQ Section */}
          <View style={styles.faqSection}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
              {t("Frequently Asked Questions")}
            </Text>

            {loading && faqs.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                {faqs.map((faq) => {
                  const localizedFAQ = getLocalizedFAQ(faq);
                  return (
                    <View key={faq.id} style={styles.faqItem}>
                      <Text
                        style={[styles.faqQuestion, isRTL && styles.rtlText]}
                      >
                        {localizedFAQ.question}
                      </Text>
                      <Text style={[styles.faqAnswer, isRTL && styles.rtlText]}>
                        {localizedFAQ.answer}
                      </Text>
                    </View>
                  );
                })}

                {currentPage < totalPages && (
                  <TouchableOpacity
                    style={styles.viewMoreButton}
                    onPress={loadMoreFAQs}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text style={styles.viewMoreText}>{t("View More")}</Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    height: 150,
    width: "100%",
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: 90,
  },
  content: {
    paddingHorizontal: 20,
  },
  welcomeSection: {
    marginTop: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
    textAlign: "center",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: colors.primary,
    marginBottom: 20,
    borderRadius: 2,
  },
  description: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  featuresSection: {
    width: "100%",
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  featureCardContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: "row",
    width: cardWidth,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  valuesSection: {
    marginBottom: 30,
  },
  valuesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  valueItem: {
    width: "48%",
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  valueText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  contactSection: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 30,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  contactButton: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.background,
    marginRight: 8,
  },
  statsSection: {
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    backgroundColor: colors.primary + "10",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text,
    textAlign: "center",
  },
  faqSection: {
    marginBottom: 30,
  },
  faqItem: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  viewMoreButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  viewMoreText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
});
