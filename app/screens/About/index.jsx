"use client";

import { useLayoutEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Link, useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";
import colors from "../../../components/theme";

const { width } = Dimensions.get("window");
const cardWidth = width * 0.85;

const AboutScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Reanimated shared values
  const scrollY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    const translateYValue = interpolate(
      scrollY.value,
      [0, 100],
      [0, -20],
      "clamp"
    );

    return {
      transform: [{ translateY: translateYValue }],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

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

  const featureAnimatedStyles = features.map((_, index) => {
    return useAnimatedStyle(() => {
      return {
        opacity: withDelay(
          100 * index,
          withTiming(opacity.value, { duration: 300 })
        ),
        transform: [
          {
            translateY: withDelay(
              100 * index,
              withTiming(translateY.value, { duration: 500 })
            ),
          },
        ],
        zIndex: 1,
      };
    });
  });

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
      },
    });

    // Start entrance animations
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 800 });
  }, [navigation, opacity, translateY, t]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <View style={styles.headerContainer}>
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <Image
              source={require("../../../assets/images/farhannetLogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          <View style={styles.welcomeSection}>
            <Text style={styles.title}>{t("Welcome to Farhanict")}</Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.description}>
              {t(
                "At Farhanict, we are dedicated to delivering high-speed, reliable, and secure internet services to our customers. Our mission is to empower communities with cutting-edge technology and exceptional customer support."
              )}
            </Text>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>
              {t("Why Choose Farhanict?")}
            </Text>

            {features.map((feature, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.featureCardContainer,
                  featureAnimatedStyles[index],
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.featureCard}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${colors.primary}19` },
                    ]}
                  >
                    <Icon
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
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <View style={styles.valuesSection}>
            <Text style={styles.sectionTitle}>{t("our-values")}</Text>
            <View style={styles.valuesContainer}>
              <View style={styles.valueItem}>
                <Icon name="thumb-up" size={24} color={colors.primary} />
                <Text style={styles.valueText}>{t("Quality Service")}</Text>
              </View>
              <View style={styles.valueItem}>
                <Icon name="lightbulb" size={24} color={colors.primary} />
                <Text style={styles.valueText}>{t("Innovation")}</Text>
              </View>
              <View style={styles.valueItem}>
                <Icon name="people" size={24} color={colors.primary} />
                <Text style={styles.valueText}>{t("community")}</Text>
              </View>
              <View style={styles.valueItem}>
                <Icon name="verified-user" size={24} color={colors.primary} />
                <Text style={styles.valueText}>{t("integrity")}</Text>
              </View>
            </View>
          </View>

          <View style={styles.contactSection}>
            <Text style={styles.contactText}>
              {t("Have questions or need assistance with your service?")}
            </Text>
            <Link href={{ pathname: "/screens/Contact" }} asChild>
              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.buttonText}>{t("Get in Touch")}</Text>
                <Icon
                  name="arrow-forward"
                  size={20}
                  color={colors.background}
                />
              </TouchableOpacity>
            </Link>
          </View>
        </Animated.View>
      </Animated.ScrollView>
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
    height: 180,
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
    width: 220,
    height: 100,
  },
  content: {
    paddingHorizontal: 20,
  },
  welcomeSection: {
    marginTop: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
    textAlign: "center",
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
    padding: 20,
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
        elevation: 5,
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
    marginBottom: 20,
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
});
